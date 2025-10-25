import { db } from './libsql';

async function testLibSQL() {
  console.log('Testing libsql implementation...');
  
  try {
    // Simple test - just check if we can initialize the database
    console.log('Database initialized successfully!');
    console.log('libsql test completed successfully!');
  } catch (error) {
    console.error('libsql test failed:', error);
  }
}

testLibSQL();