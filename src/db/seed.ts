import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { resolve } from 'path';
import * as schema from './schemas';
import { users } from './schemas';

// Resolve the database path relative to the project root
const dbPath = resolve(process.cwd(), 'sqlite.db');

// Initialize the database
const sqlite = new Database(dbPath);

// Initialize drizzle with the database instance and schema
const db = drizzle(sqlite, { schema });

async function seed() {
  console.log('Seeding database...');
  
  // Insert sample users
  const sampleUsers = [
    { name: 'John Doe', email: 'john@example.com' },
    { name: 'Jane Smith', email: 'jane@example.com' },
    { name: 'Bob Johnson', email: 'bob@example.com' },
  ];

  try {
    // Insert users
    for (const user of sampleUsers) {
      await db.insert(users).values(user).onConflictDoNothing();
    }
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    sqlite.close();
  }
}

// Run the seed function
seed();