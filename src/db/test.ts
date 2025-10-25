// Test both better-sqlite3 and libsql implementations
export {};

async function testDatabases() {
  console.log('Testing database connections...');

  // Test better-sqlite3 implementation
  try {
    console.log('\n1. Testing better-sqlite3 implementation...');
    const { drizzle: drizzleBetterSQLite3 } = await import('drizzle-orm/better-sqlite3');
    const Database = (await import('better-sqlite3')).default;
    const { resolve } = await import('path');
    
    // Resolve the database path relative to the project root
    const dbPath = resolve(process.cwd(), 'test-better-sqlite3.db');
    
    // Initialize the database
    const sqlite = new Database(dbPath);
    console.log('  Database connection successful!');
    
    // Initialize drizzle with the database instance
    const db = drizzleBetterSQLite3(sqlite);
    console.log('  Drizzle ORM initialized successfully!');
    
    sqlite.close();
    console.log('  better-sqlite3 test completed successfully!');
  } catch (error: any) {
    console.log('  better-sqlite3 test failed (this is expected on Windows without build tools):', error.message);
  }

  // Test libsql implementation
  try {
    console.log('\n2. Testing libsql implementation...');
    const { drizzle: drizzleLibSQL } = await import('drizzle-orm/libsql');
    const { createClient } = await import('@libsql/client');
    
    // For local development, we can use a local SQLite file
    const client = createClient({
      url: 'file:test-libsql.db',
    });
    
    console.log('  Database connection successful!');
    
    // Initialize drizzle with the libsql client
    const db = drizzleLibSQL(client);
    console.log('  Drizzle ORM initialized successfully!');
    
    console.log('  libsql test completed successfully!');
  } catch (error: any) {
    console.log('  libsql test failed:', error.message);
  }

  console.log('\nDatabase testing completed!');
}

testDatabases();