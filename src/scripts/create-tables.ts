// scripts/create-tables.ts
import { createClient } from '@libsql/client';

async function createTables() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:test-libsql.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    console.log('🔄 Creating tables...');

    // Drop existing tables (optional - commenta se vuoi mantenere i dati)
    await client.execute('DROP TABLE IF EXISTS files');
    await client.execute('DROP TABLE IF EXISTS users');

    // Create users table
    await client.execute(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `);
    console.log('✅ Table "users" created');

    // Create files table
    await client.execute(`
      CREATE TABLE files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        filename TEXT NOT NULL,
        blob_url TEXT NOT NULL,
        content_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        uploaded_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `);
    console.log('✅ Table "files" created');

    // Create unique index on email
    await client.execute(`
      CREATE UNIQUE INDEX users_email_unique ON users(email)
    `);
    console.log('✅ Index "users_email_unique" created');

    console.log('\n🎉 All tables created successfully!');

    // Verify tables exist
    const tables = await client.execute(`
      SELECT name FROM sqlite_master WHERE type='table'
    `);
    
    console.log('\n📋 Tables in database:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.name}`);
    });

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.close();
  }
}

createTables();