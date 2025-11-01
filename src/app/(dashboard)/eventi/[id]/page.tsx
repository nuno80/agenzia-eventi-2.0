// ============================================================================
// EVENT DETAIL PAGE
// ============================================================================
// FILE: src/app/(dashboard)/eventi/[id]/page.tsx
//
// PURPOSE: View and manage a specific event
// FEATURES:
// - Event details with edit capability
// - Tabs for different event aspects (participants, speakers, etc.)
// - Actions (delete, duplicate, change status)
// ============================================================================

// Redirect-only page to the default tab

import { redirect } from 'next/navigation'

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  // Redirect to overview tab where tabbed routing is implemented
  redirect(`/eventi/${params.id}/overview`)
}
