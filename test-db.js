const { createClient } = require('@libsql/client');

// Create a client
const client = createClient({
  url: 'file:test-libsql.db'
});

// Test the connection
async function test() {
  try {
    console.log('Testing database connection...');
    const result = await client.execute('SELECT * FROM files LIMIT 1');
    console.log('Query successful:', result);
  } catch (error) {
    console.error('Database test failed:', error);
  }
}

test();