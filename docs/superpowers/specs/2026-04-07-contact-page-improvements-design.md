# Contact Page Improvements Design

## Overview

Upgrade the existing contact page with a two-column layout (form + info sidebar), a category dropdown field, a nav link, and translations for all 31 locales.

## 1. Two-Column Layout

### Desktop (above 1023px)

```
┌─────────────────────────────────────────────────────┐
│  max-width: 1000px, centered, height fits viewport  │
│                                                     │
│  ┌──────────────────────┐  ┌──────────────────────┐ │
│  │  h1: "Contact Us"    │  │  Info Sidebar        │ │
│  │  p: description      │  │                      │ │
│  │                      │  │  ┌──────────────────┐ │ │
│  │  ┌──────────────────┐│  │  │ Response Time    │ │ │
│  │  │ Name             ││  │  │ "We typically    │ │ │
│  │  │ Email            ││  │  │  reply within    │ │ │
│  │  │ Subject          ││  │  │  48 hours"       │ │ │
│  │  │ Category (NEW)   ││  │  └──────────────────┘ │ │
│  │  │ Message          ││  │                      │ │
│  │  │ [Send Message]   ││  │  ┌──────────────────┐ │ │
│  │  └──────────────────┘│  │  │ Helpful Links    │ │ │
│  │                      │  │  │ • Glossary       │ │ │
│  └──────────────────────┘  │  │ • About          │ │ │
│                            │  └──────────────────┘ │ │
│                            └──────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

- Container: `max-width: 1000px`, centered, `padding: var(--space-xl) var(--space-md)`
- Two-column grid: `grid-template-columns: 1fr 320px`, `gap: var(--space-xl)`
- Left column: page heading, description, and `<ContactForm />`
- Right column: info sidebar — `var(--bg-secondary)` background, `1px solid var(--border)`, `border-radius: var(--radius-md)`, `padding: var(--space-lg)`
- Desktop: container has `overflow-y: auto` to scroll internally if form is tall, honoring the no-page-scroll constraint
- The form column scrolls if needed; the info sidebar is short enough to never need scrolling

### Mobile (1023px and below)

- Single column, natural stacking order: heading → description → form → info sidebar below
- Page scrolls naturally (mobile is exempt from the no-scroll rule)

### Component Boundaries

- `page.tsx` (server component): renders the two-column grid, heading, description, info sidebar (all translated server-side), and `<ContactForm />`
- `ContactForm.tsx` (client component, `'use client'`): the form itself — unchanged client boundary, only gains the new category field
- Info sidebar stays in the server component since it's static translated content with locale-aware links (using `Link` from `@/lib/i18n/navigation`, not `next/link`)

### New Files

- `src/app/[locale]/contact/ContactPage.module.css` — page-level layout styles (grid, sidebar card, responsive breakpoint)

### Modified Files

- `src/app/[locale]/contact/page.tsx` — replace inline styles with CSS Module, add two-column grid, render info sidebar
- `src/app/[locale]/contact/_components/ContactForm.module.css` — add `.select` style for the new dropdown

## 2. Category Dropdown

A required `<select>` field added between Subject and Message in `ContactForm.tsx`.

### Options

| Value | English Label |
|-------|--------------|
| `""` (disabled, selected by default) | Select a category... |
| `tool-feedback` | Tool Feedback |
| `bug-report` | Bug Report |
| `new-tool-suggestion` | New Tool Suggestion |
| `translation-issue` | Translation Issue |
| `other` | Other |

### Styling

New `.select` class in `ContactForm.module.css`, matching the existing `.input` styles (same background, border, border-radius, padding, font-size, color, focus state). Add `appearance: none` with a custom chevron via background SVG for cross-browser consistency.

### API Route Changes (`src/app/api/contact/route.ts`)

- Add `category` to the `ContactBody` interface
- Validate that `category` is one of the five allowed values; return 400 if not
- Include category as a tag in the email subject: `[PhotoTools Contact] [Bug Report] Something is broken`
- Include category as a labeled line in the email body: `Category: Bug Report`
- Map category values to display labels server-side (hardcoded English map — these are internal labels for the site owner's inbox, not user-facing)

## 3. Nav Link

Add a "Contact" link to `Nav.tsx`, positioned after the `<div className={styles.spacer} />` and before the `ThemeToggle` / `LanguageSwitcher` controls.

```
[Logo]  [Tools ▼]  [Glossary]  ───spacer───  [Contact]  [🌙]  [🌐]
```

### Changes

- `Nav.tsx` (line ~166): insert `<Link href="/contact" className={styles.navLink}>{t('contact')}</Link>` after the spacer div and before the `ThemeToggle` span
- `Nav.module.css`: no changes needed — reuses existing `.navLink` class (same style as Glossary)

### Translation Key

Add `"contact": "Contact"` to the `common.nav` object in `common.json` for all 31 locales.

## 4. Translations (31 Locales)

### New Keys in `contact.json` (all 31 locales)

Under `contact.form`:
```json
{
  "categoryLabel": "Category",
  "categoryPlaceholder": "Select a category...",
  "categoryToolFeedback": "Tool Feedback",
  "categoryBugReport": "Bug Report",
  "categoryNewToolSuggestion": "New Tool Suggestion",
  "categoryTranslationIssue": "Translation Issue",
  "categoryOther": "Other"
}
```

Under `contact` (new sibling to `form`):
```json
{
  "sidebar": {
    "responseTimeTitle": "Response Time",
    "responseTimeText": "We typically reply within 48 hours.",
    "helpfulLinksTitle": "Helpful Links",
    "glossaryLink": "Photography Glossary",
    "aboutLink": "About PhotoTools"
  }
}
```

### New Key in `common.json` (all 31 locales)

Under `common.nav`:
```json
{
  "contact": "Contact"
}
```

### Translation Approach

- All 31 locale files already exist for `contact.json` and `common.json`
- Add the new keys to each file with properly translated values
- Use `src/lib/i18n/glossary.photography.json` as reference for terminology consistency
- Run `node scripts/check-translations.mjs` and `node scripts/find-english-leaks.mjs` after completion

## 5. Files Summary

### New Files
| File | Purpose |
|------|---------|
| `src/app/[locale]/contact/ContactPage.module.css` | Page-level layout (grid, sidebar card, responsive) |

### Modified Files
| File | Changes |
|------|---------|
| `src/app/[locale]/contact/page.tsx` | Two-column grid layout, info sidebar, CSS Module import |
| `src/app/[locale]/contact/_components/ContactForm.tsx` | Add category `<select>` field |
| `src/app/[locale]/contact/_components/ContactForm.module.css` | Add `.select` style |
| `src/app/api/contact/route.ts` | Accept/validate `category`, include in email subject+body |
| `src/components/layout/Nav.tsx` | Add Contact link after spacer |
| `src/lib/i18n/messages/*/contact.json` (×31) | Add category + sidebar translation keys |
| `src/lib/i18n/messages/*/common.json` (×31) | Add `nav.contact` key |

## 6. Testing

- Existing unit tests for the API route (if any) need updating for the new `category` field
- Run full test suite (`npm test`) to catch regressions
- Manual verification: dev server with English + one RTL locale to confirm layout
- Run translation scripts to verify coverage
