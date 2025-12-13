/**
 * Script: Set user as admin
 * Usage: npx tsx scripts/set-admin.ts email@example.com
 */

import { config } from 'dotenv'

config({ path: '.env.local' })

import { createClient } from '@libsql/client'

async function setAdmin() {
  const email = process.argv[2]

  if (!email) {
    console.log('Usage: npx tsx scripts/set-admin.ts email@example.com')
    console.log('Example: npx tsx scripts/set-admin.ts admin@gmail.com')
    process.exit(1)
  }

  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  })

  // First show all users
  const users = await client.execute('SELECT id, email, role FROM user')
  console.log('\n📋 Current users:')
  for (const row of users.rows) {
    console.log(`  - ${row.email} (role: ${row.role})`)
  }

  // Update the role
  await client.execute({
    sql: 'UPDATE user SET role = ? WHERE email = ?',
    args: ['admin', email],
  })

  console.log(`\n✅ User ${email} is now admin!`)

  // Verify
  const updated = await client.execute({
    sql: 'SELECT id, email, role FROM user WHERE email = ?',
    args: [email],
  })

  if (updated.rows.length > 0) {
    console.log(`   Verified: ${updated.rows[0].email} has role: ${updated.rows[0].role}`)
  } else {
    console.log(`   ⚠️ User with email ${email} not found!`)
  }
}

setAdmin().catch(console.error)
