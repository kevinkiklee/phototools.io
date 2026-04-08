import { type NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { logger } from '@/lib/logger'

function getResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not configured')
  return new Resend(key)
}

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX = 3
// Cap the size of the in-memory rate limit map to prevent unbounded growth
// on long-running Fluid Compute instances. When exceeded, we evict the
// oldest expired entries first; if none are expired, we evict the single
// oldest entry. This is intentionally simple — real DDOS protection should
// live at the edge.
const RATE_LIMIT_MAX_ENTRIES = 10_000

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function getRateLimitKey(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

function pruneRateLimitMap(now: number): void {
  if (rateLimitMap.size < RATE_LIMIT_MAX_ENTRIES) return
  // First pass: drop everything that has expired.
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key)
  }
  // Still over the cap? Drop the oldest insertion (Map preserves order).
  while (rateLimitMap.size >= RATE_LIMIT_MAX_ENTRIES) {
    const oldest = rateLimitMap.keys().next().value
    if (oldest === undefined) break
    rateLimitMap.delete(oldest)
  }
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  pruneRateLimitMap(now)
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  entry.count++
  return entry.count > RATE_LIMIT_MAX
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ALLOWED_CATEGORIES = ['tool-feedback', 'bug-report', 'new-tool-suggestion', 'translation-issue', 'other'] as const
type ContactCategory = typeof ALLOWED_CATEGORIES[number]

const CATEGORY_LABELS: Record<ContactCategory, string> = {
  'tool-feedback': 'Tool Feedback',
  'bug-report': 'Bug Report',
  'new-tool-suggestion': 'New Tool Suggestion',
  'translation-issue': 'Translation Issue',
  'other': 'Other',
}

interface ContactBody {
  name: string
  email: string
  subject: string
  category: string
  message: string
  website?: string
}

export async function POST(request: NextRequest) {
  let body: ContactBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Honeypot field — bots fill all fields; real users never see this.
  // Return success (not error) to avoid confirming the trap to spammers.
  if (body.website) {
    logger.info('contact', 'Honeypot triggered', { ip: getRateLimitKey(request) })
    return NextResponse.json({ success: true })
  }

  const ip = getRateLimitKey(request)
  if (isRateLimited(ip)) {
    logger.warn('contact', 'Rate limited', { ip })
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  const { name, email, subject, category, message } = body

  if (!name || !email || !subject || !category || !message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  if (typeof name !== 'string' || name.length > 100) {
    return NextResponse.json({ error: 'Name must be under 100 characters.' }, { status: 400 })
  }

  if (typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
  }

  if (typeof subject !== 'string' || subject.length > 200) {
    return NextResponse.json({ error: 'Subject must be under 200 characters.' }, { status: 400 })
  }

  if (typeof category !== 'string' || !ALLOWED_CATEGORIES.includes(category as ContactCategory)) {
    return NextResponse.json({ error: 'Please select a valid category.' }, { status: 400 })
  }

  if (typeof message !== 'string' || message.length > 5000) {
    return NextResponse.json({ error: 'Message must be under 5000 characters.' }, { status: 400 })
  }

  const contactTo = process.env.CONTACT_FORM_TO || 'kevinkiklee@gmail.com'
  const contactFrom = process.env.CONTACT_FORM_FROM || 'PhotoTools <hello@phototools.io>'

  try {
    const resend = getResend()
    await resend.emails.send({
      from: contactFrom,
      to: contactTo,
      subject: `[PhotoTools Contact] [${CATEGORY_LABELS[category as ContactCategory]}] ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nCategory: ${CATEGORY_LABELS[category as ContactCategory]}\n\n${message}`,
      replyTo: email,
    })

    logger.info('contact', 'Email sent', { ip, subject: subject.slice(0, 50) })
    return NextResponse.json({ success: true })
  } catch (err) {
    logger.error('contact', 'Send failed', { ip, error: err instanceof Error ? err : String(err) })
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}
