const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function seedCountries() {
  try {
    const dataPath = path.join(process.cwd(), 'data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const countries = JSON.parse(rawData);

    console.log(`Found ${countries.length} countries to seed.`);

    // Initialize table if not exists (redundant if init-db runs, but safe)
    await sql`
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        code VARCHAR(2),
        name VARCHAR(255) NOT NULL,
        supports_rtd BOOLEAN DEFAULT false,
        visa_requirement TEXT,
        duration TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Add columns if they don't exist (migration support)
    try {
        await sql`ALTER TABLE countries ADD COLUMN IF NOT EXISTS visa_requirement TEXT`;
        await sql`ALTER TABLE countries ADD COLUMN IF NOT EXISTS duration TEXT`;
        await sql`ALTER TABLE countries ADD COLUMN IF NOT EXISTS notes TEXT`;
    } catch (e) {
        console.log("Columns might already exist, proceeding...");
    }

    // Get country codes helper
    const { getCode } = require('country-list');

    let inserted = 0;
    let updated = 0;

    for (const country of countries) {
      const code = getCode(country.country) || null;
      
      // Upsert
      // We match on 'name' because 'code' might be null for some entries or mismatched
      // Ideally we should use code, but for now name is the unique key in data.json
      
      const existing = await sql`SELECT id FROM countries WHERE name = ${country.country} LIMIT 1`;

      if (existing.length > 0) {
        await sql`
          UPDATE countries 
          SET 
            code = ${code},
            visa_requirement = ${country.visaRequirement},
            duration = ${country.duration},
            notes = ${country.notes},
            updated_at = CURRENT_TIMESTAMP
          WHERE name = ${country.country}
        `;
        updated++;
      } else {
        await sql`
          INSERT INTO countries (code, name, visa_requirement, duration, notes)
          VALUES (${code}, ${country.country}, ${country.visaRequirement}, ${country.duration}, ${country.notes})
        `;
        inserted++;
      }
    }

    console.log(`Seeding complete: ${inserted} inserted, ${updated} updated.`);

  } catch (error) {
    console.error('Error seeding countries:', error);
    process.exit(1);
  }
}

seedCountries();
