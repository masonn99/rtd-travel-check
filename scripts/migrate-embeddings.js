/**
 * Adds an embedding column to the experiences table for semantic search.
 * Safe to run multiple times (uses IF NOT EXISTS / DO NOTHING).
 *
 * Usage:  node scripts/migrate-embeddings.js
 */

import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'

config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function migrate() {
  console.log('Running embedding migration...\n')

  // Store the 768-float Gemini embedding as JSONB.
  // NULL means "not yet embedded" — stories without embeddings still
  // show up in keyword search, they just won't appear in semantic results.
  await sql`
    ALTER TABLE experiences
    ADD COLUMN IF NOT EXISTS embedding JSONB DEFAULT NULL
  `
  console.log('experiences.embedding column added')

  // Partial index — only indexes rows that actually have an embedding,
  // so the index stays small as the table grows.
  await sql`
    CREATE INDEX IF NOT EXISTS idx_experiences_embedding_not_null
    ON experiences ((embedding IS NOT NULL))
    WHERE embedding IS NOT NULL
  `
  console.log('embedding index created')

  console.log('\nMigration complete!')
}

migrate().catch(err => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
