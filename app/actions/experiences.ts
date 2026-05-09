'use server'

import { getSql } from '../lib/db'
import { revalidatePath, unstable_cache } from 'next/cache'
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

// Get all experiences - Cached for 1 hour, but revalidated on change
export const getExperiences = unstable_cache(
  async (): Promise<Experience[]> => {
    const sql = getSql()
    
    try {
      const result = await sql`
        SELECT * FROM experiences
        ORDER BY created_at DESC
        LIMIT 100
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

// Combined fetch — runs both queries in parallel in a single server action call.
// Use this in ExperiencesView to avoid two separate round-trips.
export const getExperiencesWithStats = unstable_cache(
  async (): Promise<{ experiences: Experience[]; stats: ExperienceStats }> => {
    const sql = getSql()
    try {
      const [experiences, statsRows] = await Promise.all([
        sql`SELECT * FROM experiences ORDER BY created_at DESC LIMIT 100`,
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

// Get experience stats - Optimized single query + Cached
export const getExperienceStats = unstable_cache(
  async (): Promise<ExperienceStats> => {
    const sql = getSql()
    
    try {
      // Execute all counts in a single query to reduce round-trips
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

// Create a new experience
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
    // Validate input data
    const validation = validateExperienceData(data)
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join(', ') }
    }

    // Sanitize input data
    const sanitizedData = sanitizeExperienceData(data)

    // Insert the experience
    await sql`
      INSERT INTO experiences (
        country_code,
        country_name,
        experience_type,
        title,
        description,
        author_name,
        author_email
      ) VALUES (
        ${sanitizedData.country_code},
        ${sanitizedData.country_name},
        ${sanitizedData.experience_type},
        ${sanitizedData.title},
        ${sanitizedData.description},
        ${sanitizedData.author_name},
        ${sanitizedData.author_email}
      )
    `

    // Revalidate the page to show new data
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Error creating experience:', error)
    return { success: false, error: 'Failed to create experience' }
  }
}

// Increment helpful count
export async function incrementHelpful(experienceId: number): Promise<{ success: boolean }> {
  const sql = getSql()
  
  try {
    await sql`
      UPDATE experiences
      SET helpful_count = helpful_count + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${experienceId}
    `

    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Error incrementing helpful count:', error)
    return { success: false }
  }
}

// Delete an experience
export async function deleteExperience(experienceId: number): Promise<{ success: boolean }> {
  const sql = getSql()
  
  try {
    await sql`
      DELETE FROM experiences
      WHERE id = ${experienceId}
    `

    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Error deleting experience:', error)
    return { success: false }
  }
}
