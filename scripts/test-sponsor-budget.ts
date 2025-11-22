import fs from 'node:fs'
import path from 'node:path'
import { eq } from 'drizzle-orm'

// Load env vars
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8')
  envConfig.split('\n').forEach((line) => {
    const [key, value] = line.split('=')
    if (key && value) {
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '')
    }
  })
}

async function main() {
  console.log('Starting Sponsor-Budget Integration Test...')

  // Dynamic imports to ensure env vars are loaded
  const { db, events, sponsors, budgetItems } = await import('@/db')
  const { createSponsor, updateSponsor, deleteSponsor } = await import('@/app/actions/sponsors')

  // 1. Create a test event
  console.log('Creating test event...')
  const [event] = await db
    .insert(events)
    .values({
      title: 'Test Event Sponsor Integration',
      startDate: new Date(),
      endDate: new Date(),
      location: 'Test Location',
      status: 'draft',
    })
    .returning()
  console.log('Event created:', event.id)

  try {
    // 2. Create a sponsor
    console.log('Creating sponsor...')
    const sponsorData = {
      companyName: 'Test Corp',
      email: 'test@corp.com',
      sponsorshipLevel: 'gold',
      sponsorshipAmount: 5000,
      paymentStatus: 'pending',
    }

    const createResult = await createSponsor(event.id, sponsorData)
    if (!createResult.success) throw new Error(`Failed to create sponsor: ${createResult.message}`)
    console.log('Sponsor created successfully')

    // Verify budget item creation
    const [sponsor] = await db.select().from(sponsors).where(eq(sponsors.eventId, event.id))
    if (!sponsor.budgetItemId) throw new Error('Sponsor has no budgetItemId')

    const [budgetItem] = await db
      .select()
      .from(budgetItems)
      .where(eq(budgetItems.id, sponsor.budgetItemId))
    if (!budgetItem) throw new Error('Budget item not found')

    console.log('Budget Item verified:', {
      id: budgetItem.id,
      estimatedCost: budgetItem.estimatedCost,
      description: budgetItem.description,
    })

    if (budgetItem.estimatedCost !== 5000) throw new Error('Budget item amount mismatch')

    // 3. Update sponsor amount
    console.log('Updating sponsor amount...')
    const updateResult = await updateSponsor(sponsor.id, {
      sponsorshipAmount: 7500,
      paymentStatus: 'paid',
      paymentDate: new Date(),
    })
    if (!updateResult.success) throw new Error(`Failed to update sponsor: ${updateResult.message}`)

    // Verify budget item update
    const [updatedBudgetItem] = await db
      .select()
      .from(budgetItems)
      .where(eq(budgetItems.id, sponsor.budgetItemId))
    console.log('Updated Budget Item verified:', {
      estimatedCost: updatedBudgetItem.estimatedCost,
      actualCost: updatedBudgetItem.actualCost,
      status: updatedBudgetItem.status,
    })

    if (updatedBudgetItem.estimatedCost !== 7500)
      throw new Error('Budget item estimated cost not updated')
    if (updatedBudgetItem.actualCost !== 7500)
      throw new Error('Budget item actual cost not updated')
    if (updatedBudgetItem.status !== 'paid') throw new Error('Budget item status not updated')

    // 4. Delete sponsor
    console.log('Deleting sponsor...')
    const deleteResult = await deleteSponsor(sponsor.id)
    if (!deleteResult.success) throw new Error(`Failed to delete sponsor: ${deleteResult.message}`)

    // Verify deletion
    const [deletedSponsor] = await db.select().from(sponsors).where(eq(sponsors.id, sponsor.id))
    if (deletedSponsor) throw new Error('Sponsor not deleted')

    const [deletedBudgetItem] = await db
      .select()
      .from(budgetItems)
      .where(eq(budgetItems.id, sponsor.budgetItemId))
    if (deletedBudgetItem) throw new Error('Budget item not deleted')

    console.log('Sponsor and Budget Item deletion verified')
  } catch (error) {
    console.error('Test failed:', error)
  } finally {
    // Cleanup
    console.log('Cleaning up...')
    await db.delete(events).where(eq(events.id, event.id))
    console.log('Test complete')
  }
}

main()
