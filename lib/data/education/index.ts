import { TOOL_EDUCATION } from './content'
import { TOOL_EDUCATION_2 } from './content2'
import { LEARNING_PATHS } from './paths'
import type { ToolEducation, LearningPath, ChallengeProgress } from './types'

const ALL_EDUCATION: ToolEducation[] = [...TOOL_EDUCATION, ...TOOL_EDUCATION_2]

export function getEducationBySlug(slug: string): ToolEducation | undefined {
  return ALL_EDUCATION.find((e) => e.slug === slug)
}

export function getAllEducation(): ToolEducation[] {
  return ALL_EDUCATION
}

export function getLearningPaths(): LearningPath[] {
  return LEARNING_PATHS
}

export function getLearningPathById(id: string): LearningPath | undefined {
  return LEARNING_PATHS.find((p) => p.id === id)
}

const PROGRESS_KEY = 'phototools-challenge-progress'

export function getChallengeProgress(): ChallengeProgress {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function markChallengeComplete(challengeId: string): void {
  const progress = getChallengeProgress()
  progress[challengeId] = { completed: true, completedAt: new Date().toISOString() }
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
}

export function isChallengeComplete(challengeId: string): boolean {
  return getChallengeProgress()[challengeId]?.completed === true
}

export function getPathProgress(pathId: string): { completed: number; total: number } {
  const path = getLearningPathById(pathId)
  if (!path) return { completed: 0, total: 0 }
  const progress = getChallengeProgress()
  const completed = path.steps.filter((s) => progress[s.challengeId]?.completed).length
  return { completed, total: path.steps.length }
}

export type { ToolEducation, LearningPath, LearningPathStep, ChallengeProgress, Challenge, ProTip, Tooltip } from './types'
