import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';

config();

async function initializeDatabase() {
  console.log('Initializing database tables for Vercel deployment...');
  
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Create experiences table without foreign key constraint
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Experiences table created');

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_experiences_country
      ON experiences(country_code)
    `;
    console.log('✅ Country index created');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_experiences_created
      ON experiences(created_at DESC)
    `;
    console.log('✅ Created at index created');

    console.log('🎉 Database initialized successfully for Vercel!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    return { success: false, error: error.message };
  }
}

// Only run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase().then(result => {
    if (result.success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  });
}

export { initializeDatabase };
