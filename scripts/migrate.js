/**
 * DB migration — adds rate-limit and vote-dedup support.
 *
 * Safe to run multiple times (all statements use IF NOT EXISTS / IF NOT EXISTS).
 *
 * Usage:  node scripts/migrate.js
 */

import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'

config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function migrate() {
  console.log('🔄 Running migrations...\n')

  // 1. Add ip_hash column to experiences (rate-limit tracking)
  await sql`
    ALTER TABLE experiences
    ADD COLUMN IF NOT EXISTS ip_hash VARCHAR(64)
  `
  console.log('✅ experiences.ip_hash column added')

  // 2. Index so the rate-limit query (COUNT by ip_hash + created_at) is fast
  await sql`
    CREATE INDEX IF NOT EXISTS idx_experiences_ip_hash
    ON experiences(ip_hash, created_at DESC)
  `
  console.log('✅ ip_hash index created')

  // 3. helpful_votes table — one row per (experience, voter IP)
  await sql`
    CREATE TABLE IF NOT EXISTS helpful_votes (
      id         SERIAL PRIMARY KEY,
      experience_id INTEGER NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
      ip_hash    VARCHAR(64) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (experience_id, ip_hash)
    )
  `
  console.log('✅ helpful_votes table created')

  await sql`
    CREATE INDEX IF NOT EXISTS idx_helpful_votes_exp
    ON helpful_votes(experience_id)
  `
  console.log('✅ helpful_votes index created')

  console.log('\n🎉 Migrations complete!')
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message)
  process.exit(1)
})
