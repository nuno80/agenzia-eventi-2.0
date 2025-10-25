const { drizzle } = require('drizzle-orm/libsql');
const { createClient } = require('@libsql/client');
const { files } = require('./src/db/libsql-schemas');

// Create a client
const client = createClient({
  url: 'file:test-libsql.db'
});

// Create drizzle instance
const db = drizzle(client, { schema: { files } });

// Test the connection
async function test() {
  try {
    console.log('Testing Drizzle ORM connection...');
    const result = await db.select().from(db.files).limit(1);
    console.log('Query successful:', result);
  } catch (error) {
    console.error('Drizzle ORM test failed:', error);
  }
}

test();