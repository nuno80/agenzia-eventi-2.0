// ============================================================================
// EVENTS TABLE COMPONENT
// ============================================================================
// FILE: src/components/dashboard/events/EventsTable.tsx
//
// PURPOSE: Component to display events in a table format with sorting and actions
// FEATURES:
// - Sortable columns
// - Status badges
// - Action buttons
// - Pagination
// ============================================================================

import type { Event } from '@/db/libsql-schemas/events'
import { getAllEvents } from '@/lib/dal/events'
import { EventsTableClient } from './EventsTableClient'

export async function EventsTable() {
  // Fetch events from the database
  const events = await getAllEvents()

  return <EventsTableClient events={events} />
}
