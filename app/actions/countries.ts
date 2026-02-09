'use server'

import { getSql } from '../lib/db'

export interface CountryData {
  country: string
  visaRequirement: string
  duration: string
  notes: string
  code?: string
}

export async function getCountries(): Promise<CountryData[]> {
  const sql = getSql()
  
  try {
    // Map database columns to the interface expected by components
    const result = await sql`
      SELECT 
        name as country, 
        visa_requirement as "visaRequirement", 
        duration, 
        notes,
        code
      FROM countries
      ORDER BY name ASC
    `
    return result as CountryData[]
  } catch (error) {
    console.error('Error fetching countries:', error)
    return []
  }
}
