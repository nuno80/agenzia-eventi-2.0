import { eq } from 'drizzle-orm'
import { createAssignment } from '../app/actions/staff-assignments'
import { budgetCategories, db, events, staff } from '../db'

async function main() {
  console.log('Reproducing createAssignment...')

  // 1. Find Event
  const allEvents = await db.select().from(events)
  const targetEvent = allEvents.find((e) => e.title.includes('Startup Pitch Night'))
  if (!targetEvent) throw new Error('Event not found')

  // 2. Find Staff (Sara Conti)
  const allStaff = await db.select().from(staff)
  const targetStaff = allStaff.find((s) => s.lastName === 'Conti')
  if (!targetStaff) throw new Error('Staff Sara Conti not found')

  // 3. Find Budget Category
  const categories = await db
    .select()
    .from(budgetCategories)
    .where(eq(budgetCategories.eventId, targetEvent.id))
  const targetCategory = categories[0]
  if (!targetCategory) throw new Error('No budget category found')

  console.log(`Event: ${targetEvent.title}`)
  console.log(`Staff: ${targetStaff.firstName} ${targetStaff.lastName}`)
  console.log(`Category: ${targetCategory.name}`)

  // 4. Call createAssignment
  console.log('Calling createAssignment...')
  const payload = {
    eventId: targetEvent.id,
    staffId: targetStaff.id,
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000), // 1 hour later
    assignmentStatus: 'confirmed',
    paymentAmount: 200,
    paymentTerms: 'immediate',
    budgetCategoryId: targetCategory.id,
    paymentStatus: 'paid',
  }

  const result = await createAssignment(payload)
  console.log('Result:', result)

  if (result.success && result.data?.id) {
    // Check assignment
    const assignment = await db.query.staffAssignments.findFirst({
      where: (sa, { eq }) => eq(sa.id, result.data!.id as string),
    })
    console.log('Assignment created:', assignment)
    console.log('BudgetItemId:', assignment?.budgetItemId)

    if (assignment?.budgetItemId) {
      const bItem = await db.query.budgetItems.findFirst({
        where: (bi, { eq }) => eq(bi.id, assignment.budgetItemId!),
      })
      console.log('Budget Item created:', bItem)
    } else {
      console.error('FAIL: Assignment created but BudgetItemId is NULL')
    }
  } else {
    console.error('FAIL: createAssignment returned error')
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0))
