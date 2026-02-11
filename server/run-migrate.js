require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for Supabase
  });

  try {
    await client.connect();
    console.log("✅ Connected to database");

    const filePath = path.join(__dirname, 'create-admin-tables.sql');
    const sql = fs.readFileSync(filePath, 'utf8');

    await client.query(sql);

    console.log("🚀 Migration executed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
  } finally {
    await client.end();
    console.log("🔒 Connection closed");
  }
}

runMigration();
