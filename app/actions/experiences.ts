'use server'

import { createHash } from 'crypto'
import { headers } from 'next/headers'
import { getSql } from '../lib/db'
import { EXPERIENCES_PAGE_SIZE as PAGE_SIZE } from '../lib/constants'
import { revalidateTag, unstable_cache } from 'next/cache'
import { validateExperienceData, sanitizeExperienceData } from '../lib/security'

export interface Experience {
  id: number
  country_code: string
  country_name: string
  experience_type: string
  title: string
  description: string
  author_name?: string
  author_email?: string
  helpful_count: number
  created_at: Date
  updated_at: Date
}

export interface ExperienceStats {
  total: number
  countries: number
  helpfulVotes: number
  thisMonth: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Hash an IP address with SHA-256 for privacy — we never store raw IPs. */
function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex')
}

/** Extract the real client IP from request headers. */
async function getClientIp(): Promise<string> {
  const h = await headers()
  // x-forwarded-for can be a comma-separated list; take the first (original client)
  const forwarded = h.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return h.get('x-real-ip') ?? '127.0.0.1'
}

// ─── Read actions (cached) ─────────────────────────────────────────────────────

export const getExperiences = unstable_cache(
  async (): Promise<Experience[]> => {
    const sql = getSql()
    try {
      const result = await sql`
        SELECT * FROM experiences
        WHERE status = 'published' OR status IS NULL
        ORDER BY created_at DESC
        LIMIT ${PAGE_SIZE}
      `
      return result as Experience[]
    } catch (error) {
      console.error('Error fetching experiences:', error)
      return []
    }
  },
  ['experiences-list'],
  { revalidate: 3600, tags: ['experiences'] }
)

/**
 * Load the next page of experiences after a given ID (cursor-based).
 * Not cached — always fetches fresh so new stories appear immediately.
 */
export async function loadMoreExperiences(afterId: number): Promise<Experience[]> {
  const sql = getSql()
  try {
    const result = await sql`
      SELECT * FROM experiences
      WHERE id < ${afterId}
        AND (status = 'published' OR status IS NULL)
      ORDER BY created_at DESC
      LIMIT ${PAGE_SIZE}
    `
    return result as Experience[]
  } catch (error) {
    console.error('Error loading more experiences:', error)
    return []
  }
}

// ─── Telegram pipeline actions ─────────────────────────────────────────────────

/**
 * Insert a story extracted from Telegram as pending_review.
 * Bypasses IP rate limiting — Telegram messages are already filtered.
 * Returns the new row's ID so the approve button can reference it.
 */
export async function insertTelegramExperience(data: {
  country_code: string
  country_name: string
  experience_type: string
  title: string
  description: string
  author_name: string
  telegram_message_id: number
}): Promise<{ success: boolean; id?: number; error?: string }> {
  const sql = getSql()
  try {
    const rows = await sql`
      INSERT INTO experiences (
        country_code, country_name, experience_type,
        title, description, author_name,
        status, source, telegram_message_id
      ) VALUES (
        ${data.country_code},
        ${data.country_name},
        ${data.experience_type},
        ${data.title},
        ${data.description},
        ${data.author_name},
        'pending_review',
        'telegram',
        ${data.telegram_message_id}
      )
      ON CONFLICT (telegram_message_id) DO NOTHING
      RETURNING id
    `
    const id = (rows as { id: number }[])[0]?.id
    if (!id) return { success: false, error: 'duplicate' }
    return { success: true, id }
  } catch (error) {
    console.error('Error inserting telegram experience:', error)
    return { success: false, error: String(error) }
  }
}

/** Publish a pending story. */
export async function approveExperience(id: number): Promise<{ success: boolean }> {
  const sql = getSql()
  try {
    await sql`
      UPDATE experiences
      SET status = 'published', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `
    revalidateTag('experiences')
    return { success: true }
  } catch (error) {
    console.error('Error approving experience:', error)
    return { success: false }
  }
}

/** Reject and delete a pending story. */
export async function rejectExperience(id: number): Promise<{ success: boolean }> {
  const sql = getSql()
  try {
    await sql`DELETE FROM experiences WHERE id = ${id} AND status = 'pending_review'`
    return { success: true }
  } catch (error) {
    console.error('Error rejecting experience:', error)
    return { success: false }
  }
}

/**
 * Check if a country already has published stories.
 * Used by the Telegram pipeline to label notifications (new country vs existing).
 */
export async function countStoriesForCountry(countryName: string): Promise<number> {
  const sql = getSql()
  try {
    const rows = await sql`
      SELECT COUNT(*) as cnt FROM experiences
      WHERE country_name ILIKE ${countryName}
        AND (status = 'published' OR status IS NULL)
    `
    return Number((rows as { cnt: string }[])[0]?.cnt ?? 0)
  } catch {
    return 0
  }
}

// Combined fetch — runs both queries in parallel in a single server action call.
export const getExperiencesWithStats = unstable_cache(
  async (): Promise<{ experiences: Experience[]; stats: ExperienceStats }> => {
    const sql = getSql()
    try {
      const [experiences, statsRows] = await Promise.all([
        sql`SELECT * FROM experiences WHERE status = 'published' OR status IS NULL ORDER BY created_at DESC LIMIT ${PAGE_SIZE}`,
        sql`
          SELECT
            COUNT(*) as total,
            COUNT(DISTINCT country_code) as countries,
            COALESCE(SUM(helpful_count), 0) as helpful_votes,
            COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)) as this_month
          FROM experiences
        `,
      ])
      const row = (statsRows as Record<string, unknown>[])[0]
      return {
        experiences: experiences as Experience[],
        stats: {
          total: Number(row.total) || 0,
          countries: Number(row.countries) || 0,
          helpfulVotes: Number(row.helpful_votes) || 0,
          thisMonth: Number(row.this_month) || 0,
        },
      }
    } catch (error) {
      console.error('Error fetching experiences with stats:', error)
      return {
        experiences: [],
        stats: { total: 0, countries: 0, helpfulVotes: 0, thisMonth: 0 },
      }
    }
  },
  ['experiences-with-stats'],
  { revalidate: 3600, tags: ['experiences'] }
)

export const getExperienceStats = unstable_cache(
  async (): Promise<ExperienceStats> => {
    const sql = getSql()
    try {
      const rows = await sql`
        SELECT
          COUNT(*) as total,
          COUNT(DISTINCT country_code) as countries,
          COALESCE(SUM(helpful_count), 0) as helpful_votes,
          COUNT(*) FILTER (WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)) as this_month
        FROM experiences
      `
      const result = (rows as Record<string, unknown>[])[0]
      return {
        total: Number(result.total) || 0,
        countries: Number(result.countries) || 0,
        helpfulVotes: Number(result.helpful_votes) || 0,
        thisMonth: Number(result.this_month) || 0,
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      return { total: 0, countries: 0, helpfulVotes: 0, thisMonth: 0 }
    }
  },
  ['experience-stats'],
  { revalidate: 3600, tags: ['experiences'] }
)

// ─── Write actions ─────────────────────────────────────────────────────────────

const RATE_LIMIT_MAX = 5       // max submissions per IP
const RATE_LIMIT_WINDOW_H = 24 // rolling window in hours

export async function createExperience(data: {
  country_code: string
  country_name: string
  experience_type: string
  title: string
  description: string
  author_name?: string
  author_email?: string
}): Promise<{ success: boolean; error?: string }> {
  const sql = getSql()

  try {
    // Validate first (cheap, no DB hit)
    const validation = validateExperienceData(data)
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') }
    }

    // Rate limit — count this IP's submissions in the rolling window
    const ip = await getClientIp()
    const ipHash = hashIp(ip)

    const countRows = await sql`
      SELECT COUNT(*) as cnt
      FROM experiences
      WHERE ip_hash = ${ipHash}
        AND created_at > NOW() - INTERVAL '${RATE_LIMIT_WINDOW_H} hours'
    `
    const recentCount = Number((countRows as Record<string, unknown>[])[0].cnt)

    if (recentCount >= RATE_LIMIT_MAX) {
      return {
        success: false,
        error: `You can submit up to ${RATE_LIMIT_MAX} stories per day. Please try again later.`,
      }
    }

    // Insert
    const sanitizedData = sanitizeExperienceData(data)
    await sql`
      INSERT INTO experiences (
        country_code, country_name, experience_type,
        title, description, author_name, author_email, ip_hash
      ) VALUES (
        ${sanitizedData.country_code},
        ${sanitizedData.country_name},
        ${sanitizedData.experience_type},
        ${sanitizedData.title},
        ${sanitizedData.description},
        ${sanitizedData.author_name},
        ${sanitizedData.author_email},
        ${ipHash}
      )
    `

    revalidateTag('experiences')
    return { success: true }
  } catch (error) {
    console.error('Error creating experience:', error)
    return { success: false, error: 'Failed to create experience' }
  }
}

/**
 * Increment the helpful count for a story.
 * Each IP can only vote once per story — enforced by a UNIQUE constraint
 * on (experience_id, ip_hash) in the helpful_votes table.
 */
export async function incrementHelpful(
  experienceId: number
): Promise<{ success: boolean; alreadyVoted?: boolean }> {
  const sql = getSql()

  try {
    const ip = await getClientIp()
    const ipHash = hashIp(ip)

    // Try to record the vote — fails silently if already voted (ON CONFLICT DO NOTHING)
    const result = await sql`
      INSERT INTO helpful_votes (experience_id, ip_hash)
      VALUES (${experienceId}, ${ipHash})
      ON CONFLICT (experience_id, ip_hash) DO NOTHING
      RETURNING id
    `

    // If nothing was inserted, this IP already voted
    if ((result as unknown[]).length === 0) {
      return { success: false, alreadyVoted: true }
    }

    // Vote recorded — now bump the counter
    await sql`
      UPDATE experiences
      SET helpful_count = helpful_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${experienceId}
    `

    revalidateTag('experiences')
    return { success: true }
  } catch (error) {
    console.error('Error incrementing helpful count:', error)
    return { success: false }
  }
}

export async function deleteExperience(experienceId: number): Promise<{ success: boolean }> {
  const sql = getSql()
  try {
    await sql`DELETE FROM experiences WHERE id = ${experienceId}`
    revalidateTag('experiences')
    return { success: true }
  } catch (error) {
    console.error('Error deleting experience:', error)
    return { success: false }
  }
}
