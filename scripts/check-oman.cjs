const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
  const result = await sql`SELECT * FROM countries WHERE name ILIKE '%Oman%'`;
  console.log(JSON.stringify(result, null, 2));
}

check();
