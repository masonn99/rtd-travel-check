import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create a SQL function using Neon's serverless driver
export const sql = neon(process.env.DATABASE_URL)

// Helper function to initialize database tables
export async function initializeDatabase() {
  try {
    // Create countries table
    await sql`
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        code VARCHAR(2) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        supports_rtd BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create experiences table
    await sql`
      CREATE TABLE IF NOT EXISTS experiences (
        id SERIAL PRIMARY KEY,
        country_code VARCHAR(2) NOT NULL,
        country_name VARCHAR(255) NOT NULL,
        experience_type VARCHAR(50) NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        author_name VARCHAR(255),
        author_email VARCHAR(255),
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (country_code) REFERENCES countries(code) ON DELETE CASCADE
      )
    `

    // Create index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_experiences_country
      ON experiences(country_code)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_experiences_created
      ON experiences(created_at DESC)
    `

    console.log('Database initialized successfully')
    return { success: true }
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}
