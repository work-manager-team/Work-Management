// Quick script to add missing column to database
// Run: node run-migration.js

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL not found in .env file');
    process.exit(1);
  }

  console.log('🔄 Connecting to database...');
  const sql = neon(databaseUrl);

  try {
    // Add missing column
    console.log('📝 Adding avatar_public_id column to users table...');
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS avatar_public_id varchar(255)
    `;
    console.log('✅ Column added successfully!');

    // Verify column exists
    console.log('🔍 Verifying column...');
    const result = await sql`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name = 'avatar_public_id'
    `;

    if (result.length > 0) {
      console.log('✅ Verification successful!');
      console.log('Column details:', result[0]);
    } else {
      console.error('❌ Column not found after adding. Something went wrong.');
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('You can now test your API.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
