import { initializeDatabase } from '../app/lib/db'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

async function main() {
  console.log('Initializing database...')

  try {
    await initializeDatabase()
    console.log('✅ Database initialized successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error initializing database:', error)
    process.exit(1)
  }
}

main()
