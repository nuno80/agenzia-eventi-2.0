import { getAllEvents } from '@/lib/dal/events'
import { getAllStaff } from '@/lib/dal/staff'
import { StaffListClient } from './StaffListClient'

export async function StaffListFetcher() {
  const [staff, events] = await Promise.all([getAllStaff(), getAllEvents()])

  return <StaffListClient staff={staff} events={events} />
}
