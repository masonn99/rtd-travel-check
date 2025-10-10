'use server'

import { getSql } from '../lib/db'
import { revalidatePath } from 'next/cache'

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

// Get all experiences
export async function getExperiences(): Promise<Experience[]> {
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
}

// Get experience stats
export async function getExperienceStats(): Promise<ExperienceStats> {
  const sql = getSql()
  
  try {
    const [totalResult] = await sql`
      SELECT COUNT(*) as count FROM experiences
    `

    const [countriesResult] = await sql`
      SELECT COUNT(DISTINCT country_code) as count FROM experiences
    `

    const [helpfulResult] = await sql`
      SELECT COALESCE(SUM(helpful_count), 0) as total FROM experiences
    `

    const [thisMonthResult] = await sql`
      SELECT COUNT(*) as count FROM experiences
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_TIMESTAMP)
    `

    return {
      total: Number(totalResult.count) || 0,
      countries: Number(countriesResult.count) || 0,
      helpfulVotes: Number(helpfulResult.total) || 0,
      thisMonth: Number(thisMonthResult.count) || 0,
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { total: 0, countries: 0, helpfulVotes: 0, thisMonth: 0 }
  }
}

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
    // Validate required fields
    if (!data.country_code || !data.country_name || !data.title || !data.description) {
      return { success: false, error: 'Missing required fields' }
    }

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
        ${data.country_code},
        ${data.country_name},
        ${data.experience_type},
        ${data.title},
        ${data.description},
        ${data.author_name || null},
        ${data.author_email || null}
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
