import { desc, eq } from 'drizzle-orm'
import { budgetCategories, budgetItems, db, events, staff, staffAssignments } from '../db'

async function main() {
  console.log('Diagnosing Staff-Budget Integration...')

  // 1. Find Event
  const allEvents = await db.select().from(events)
  const targetEvent = allEvents.find((e) => e.title.includes('Startup Pitch Night'))

  if (!targetEvent) {
    console.error('Event "Startup Pitch Night" not found!')
    console.log(
      'Available events:',
      allEvents.map((e) => e.title)
    )
    return
  }

  console.log(`Found Event: ${targetEvent.title} (${targetEvent.id})`)

  // 1.5 Check Budget Categories
  const categories = await db
    .select()
    .from(budgetCategories)
    .where(eq(budgetCategories.eventId, targetEvent.id))

  console.log('\n--- Budget Categories ---')
  if (categories.length === 0) {
    console.log('WARNING: No budget categories found! User cannot select a category.')
  } else {
    console.table(categories.map((c) => ({ ID: c.id, Name: c.name })))
  }

  // 2. Get Staff Assignments
  const assignments = await db
    .select({
      id: staffAssignments.id,
      staffName: staff.firstName,
      staffLastName: staff.lastName,
      role: staff.role,
      paymentAmount: staffAssignments.paymentAmount,
      paymentStatus: staffAssignments.paymentStatus,
      budgetItemId: staffAssignments.budgetItemId,
      createdAt: staffAssignments.createdAt,
    })
    .from(staffAssignments)
    .leftJoin(staff, eq(staffAssignments.staffId, staff.id))
    .where(eq(staffAssignments.eventId, targetEvent.id))
    .orderBy(desc(staffAssignments.createdAt))

  console.log('\n--- Staff Assignments ---')
  if (assignments.length === 0) {
    console.log('No assignments found.')
  } else {
    console.table(
      assignments.map((a) => ({
        Name: `${a.staffName} ${a.staffLastName}`,
        Role: a.role,
        Amount: a.paymentAmount,
        Status: a.paymentStatus,
        BudgetItem: a.budgetItemId || 'NULL',
        Created: a.createdAt ? new Date(a.createdAt).toLocaleString() : 'N/A',
      }))
    )
  }

  // 3. Get Budget Items
  const bItems = await db.select().from(budgetItems).where(eq(budgetItems.eventId, targetEvent.id))

  console.log('\n--- Budget Items ---')
  if (bItems.length === 0) {
    console.log('No budget items found.')
  } else {
    console.table(
      bItems.map((b) => ({
        ID: b.id,
        Desc: b.description,
        Est: b.estimatedCost,
        Actual: b.actualCost,
        Status: b.status,
      }))
    )
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0))
