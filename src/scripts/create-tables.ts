// scripts/create-tables.ts
import { createClient } from '@libsql/client'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

async function createTables() {
  // Check if we should use Turso or local SQLite
  const useTurso = process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN

  const client = createClient({
    url: useTurso ? process.env.TURSO_DATABASE_URL! : 'file:test-libsql.db',
    authToken: useTurso ? process.env.TURSO_AUTH_TOKEN : undefined,
  })

  try {
    console.log(`🔄 Creating tables in ${useTurso ? 'Turso' : 'local SQLite'} database...`)

    // Drop existing tables (optional - commenta se vuoi mantenere i dati)
    await client.execute('DROP TABLE IF EXISTS survey_responses')
    await client.execute('DROP TABLE IF EXISTS surveys')
    await client.execute('DROP TABLE IF EXISTS communications')
    await client.execute('DROP TABLE IF EXISTS checkins')
    await client.execute('DROP TABLE IF EXISTS budget_items')
    await client.execute('DROP TABLE IF EXISTS budget_categories')
    await client.execute('DROP TABLE IF EXISTS session_registrations')
    await client.execute('DROP TABLE IF EXISTS agenda_sessions')
    await client.execute('DROP TABLE IF EXISTS services')
    await client.execute('DROP TABLE IF EXISTS sponsors')
    await client.execute('DROP TABLE IF EXISTS speakers')
    await client.execute('DROP TABLE IF EXISTS participants')
    await client.execute('DROP TABLE IF EXISTS deadlines')
    await client.execute('DROP TABLE IF EXISTS events')
    await client.execute('DROP TABLE IF EXISTS files')
    await client.execute('DROP TABLE IF EXISTS users')

    // Create users table
    await client.execute(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `)
    console.log('✅ Table "users" created')

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
    `)
    console.log('✅ Table "files" created')

    // Create events table
    await client.execute(`
      CREATE TABLE events (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        location TEXT NOT NULL,
        start_date INTEGER NOT NULL,
        end_date INTEGER NOT NULL,
        capacity INTEGER NOT NULL,
        registered_count INTEGER DEFAULT 0 NOT NULL,
        budget REAL NOT NULL,
        spent REAL DEFAULT 0 NOT NULL,
        status TEXT DEFAULT 'draft' NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        deleted_at INTEGER
      )
    `)
    console.log('✅ Table "events" created')

    // Create participants table
    await client.execute(`
      CREATE TABLE participants (
        id TEXT PRIMARY KEY NOT NULL,
        event_id TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        company TEXT,
        job_title TEXT,
        registration_date INTEGER DEFAULT (unixepoch()) NOT NULL,
        status TEXT DEFAULT 'registered' NOT NULL,
        checked_in INTEGER DEFAULT 0 NOT NULL,
        checkin_time INTEGER,
        notes TEXT,
        dietary_requirements TEXT,
        special_needs TEXT,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `)
    console.log('✅ Table "participants" created')

    // Create speakers table
    await client.execute(`
      CREATE TABLE speakers (
        id TEXT PRIMARY KEY NOT NULL,
        event_id TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        company TEXT,
        job_title TEXT,
        bio TEXT,
        photo_url TEXT,
        presentation_title TEXT,
        presentation_description TEXT,
        presentation_duration INTEGER,
        presentation_date INTEGER,
        presentation_slot TEXT,
        status TEXT DEFAULT 'invited' NOT NULL,
        notes TEXT,
        travel_arrangements TEXT,
        accommodation_needs TEXT,
        dietary_requirements TEXT,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `)
    console.log('✅ Table "speakers" created')

    // Create sponsors table
    await client.execute(`
      CREATE TABLE sponsors (
        id TEXT PRIMARY KEY NOT NULL,
        event_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        logo_url TEXT,
        website TEXT,
        contact_name TEXT,
        contact_email TEXT NOT NULL,
        contact_phone TEXT,
        amount REAL NOT NULL,
        benefits TEXT,
        booth_location TEXT,
        booth_size TEXT,
        status TEXT DEFAULT 'prospect' NOT NULL,
        invoice_number TEXT,
        invoice_date INTEGER,
        payment_date INTEGER,
        payment_method TEXT,
        notes TEXT,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `)
    console.log('✅ Table "sponsors" created')

    // Create services table
    await client.execute(`
      CREATE TABLE services (
        id TEXT PRIMARY KEY NOT NULL,
        event_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        provider_name TEXT NOT NULL,
        provider_contact TEXT,
        provider_email TEXT,
        provider_phone TEXT,
        cost REAL NOT NULL,
        is_paid INTEGER DEFAULT 0 NOT NULL,
        payment_date INTEGER,
        invoice_number TEXT,
        scheduled_date INTEGER,
        scheduled_start_time TEXT,
        scheduled_end_time TEXT,
        status TEXT DEFAULT 'requested' NOT NULL,
        notes TEXT,
        attachments TEXT,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `)
    console.log('✅ Table "services" created')

    // Create agenda_sessions table
    await client.execute(`
      CREATE TABLE agenda_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        event_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        start_time INTEGER NOT NULL,
        end_time INTEGER NOT NULL,
        day INTEGER NOT NULL,
        location TEXT,
        room TEXT,
        capacity INTEGER,
        speaker_ids TEXT,
        speaker_names TEXT,
        status TEXT DEFAULT 'draft' NOT NULL,
        tags TEXT,
        materials TEXT,
        is_public INTEGER DEFAULT 1 NOT NULL,
        requires_registration INTEGER DEFAULT 0 NOT NULL,
        registration_count INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `)
    console.log('✅ Table "agenda_sessions" created')

    // Create session_registrations table
    await client.execute(`
      CREATE TABLE session_registrations (
        id TEXT PRIMARY KEY NOT NULL,
        session_id TEXT NOT NULL,
        participant_id TEXT NOT NULL,
        participant_name TEXT NOT NULL,
        participant_email TEXT,
        registered_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        status TEXT DEFAULT 'registered' NOT NULL,
        attended_at INTEGER,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `)
    console.log('✅ Table "session_registrations" created')

    // Create budget_categories table
    await client.execute(`
      CREATE TABLE budget_categories (
        id TEXT PRIMARY KEY NOT NULL,
        event_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        budget_allocated REAL NOT NULL,
        budget_spent REAL DEFAULT 0 NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `)
    console.log('✅ Table "budget_categories" created')

    // Create budget_items table
    await client.execute(`
      CREATE TABLE budget_items (
        id TEXT PRIMARY KEY NOT NULL,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        estimated_cost REAL NOT NULL,
        actual_cost REAL,
        quantity INTEGER DEFAULT 1 NOT NULL,
        status TEXT DEFAULT 'planned' NOT NULL,
        vendor_name TEXT,
        invoice_number TEXT,
        invoice_date INTEGER,
        payment_date INTEGER,
        payment_method TEXT,
        notes TEXT,
        attachments TEXT,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `)
    console.log('✅ Table "budget_items" created')

    // Create checkins table
    await client.execute(`
      CREATE TABLE checkins (
        id TEXT PRIMARY KEY NOT NULL,
        event_id TEXT NOT NULL,
        person_id TEXT NOT NULL,
        person_type TEXT NOT NULL,
        person_name TEXT NOT NULL,
        person_email TEXT,
        checked_in_at INTEGER NOT NULL,
        checked_in_by TEXT,
        checkout_at INTEGER,
        status TEXT DEFAULT 'checked_in' NOT NULL,
        verification_method TEXT DEFAULT 'manual' NOT NULL,
        verification_code TEXT,
        notes TEXT,
        badge_printed INTEGER DEFAULT 0 NOT NULL,
        materials_provided TEXT,
        location_id TEXT,
        location_name TEXT,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `)
    console.log('✅ Table "checkins" created')

    // Create communications table
    await client.execute(`
      CREATE TABLE communications (
        id TEXT PRIMARY KEY NOT NULL,
        event_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        recipient_type TEXT NOT NULL,
        recipient_filter TEXT,
        recipient_count INTEGER DEFAULT 0,
        scheduled_at INTEGER,
        sent_at INTEGER,
        status TEXT DEFAULT 'draft' NOT NULL,
        open_count INTEGER DEFAULT 0,
        click_count INTEGER DEFAULT 0,
        bounce_count INTEGER DEFAULT 0,
        attachments TEXT,
        metadata TEXT,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `)
    console.log('✅ Table "communications" created')

    // Create surveys table
    await client.execute(`
      CREATE TABLE surveys (
        id TEXT PRIMARY KEY NOT NULL,
        event_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'draft' NOT NULL,
        start_date INTEGER,
        end_date INTEGER,
        is_anonymous INTEGER DEFAULT 0 NOT NULL,
        allow_multiple_responses INTEGER DEFAULT 0 NOT NULL,
        questions TEXT NOT NULL,
        response_count INTEGER DEFAULT 0,
        completion_rate REAL DEFAULT 0,
        average_rating REAL,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `)
    console.log('✅ Table "surveys" created')

    // Create survey_responses table
    await client.execute(`
      CREATE TABLE survey_responses (
        id TEXT PRIMARY KEY NOT NULL,
        survey_id TEXT NOT NULL,
        respondent_id TEXT,
        respondent_type TEXT,
        respondent_email TEXT,
        answers TEXT NOT NULL,
        completed_at INTEGER NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at INTEGER DEFAULT (unixepoch()) NOT NULL,
        updated_at INTEGER DEFAULT (unixepoch()) NOT NULL
      )
    `)
    console.log('✅ Table "survey_responses" created')

    // Create unique index on email
    await client.execute(`
      CREATE UNIQUE INDEX users_email_unique ON users(email)
    `)
    console.log('✅ Index "users_email_unique" created')

    // Create indexes for events table
    await client.execute(`
      CREATE INDEX events_status_idx ON events(status)
    `)
    console.log('✅ Index "events_status_idx" created')

    await client.execute(`
      CREATE INDEX events_start_date_idx ON events(start_date)
    `)
    console.log('✅ Index "events_start_date_idx" created')

    await client.execute(`
      CREATE INDEX events_type_idx ON events(type)
    `)
    console.log('✅ Index "events_type_idx" created')

    console.log('\n🎉 All tables created successfully!')

    // Verify tables exist
    const tables = await client.execute(`
      SELECT name FROM sqlite_master WHERE type='table'
    `)

    console.log('\n📋 Tables in database:')
    tables.rows.forEach((row) => {
      console.log(`  - ${row.name}`)
    })
  } catch (error) {
    console.error('❌ Error creating tables:', error)
    throw error
  } finally {
    client.close()
  }
}

createTables()
