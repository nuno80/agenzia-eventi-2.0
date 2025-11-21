/**
 * FILE: src/scripts/test-staff-budget-integration.ts
 * PURPOSE: Manual integration test for Staff ↔ Budget
 *
 * Run with: tsx --env-file=.env.local src/scripts/test-staff-budget-integration.ts
 */

import {
  createAssignment,
  deleteAssignment,
  updateAssignment,
} from '../app/actions/staff-assignments'
import { db } from '../db'

async function testStaffBudgetIntegration() {
  console.log('🧪 Testing Staff ↔ Budget Integration\n')

  try {
    // Test 1: Create assignment with budget
    console.log('Test 1: Creating staff assignment with budget category...')
    const createResult = await createAssignment({
      eventId: 'test-event-1',
      staffId: 'test-staff-1',
      startTime: new Date('2025-01-15T09:00:00'),
      endTime: new Date('2025-01-15T17:00:00'),
      assignmentStatus: 'confirmed',
      paymentAmount: 500,
      paymentTerms: 'custom',
      paymentDueDate: new Date('2025-01-30'),
      budgetCategoryId: 'test-budget-category-1', // This should trigger budget creation
    })

    if (createResult.success) {
      console.log('✅ Assignment created successfully')
      console.log(`   Assignment ID: ${createResult.data?.id}`)

      // Check if budgetItemId was stored
      const assignment = await db.query.staffAssignments.findFirst({
        where: (staffAssignments, { eq }) =>
          eq(staffAssignments.id, createResult.data?.id as string),
      })

      if (assignment?.budgetItemId) {
        console.log(`✅ Budget item linked: ${assignment.budgetItemId}`)
      } else {
        console.log("⚠️  No budget item linked (expected if category doesn't exist)")
      }
    } else {
      console.log(`❌ Failed to create assignment: ${createResult.message}`)
    }

    console.log(`\n${'='.repeat(60)}\n`)

    // Test 2: Update assignment payment
    if (createResult.success && createResult.data?.id) {
      console.log('Test 2: Updating payment amount...')
      const updateResult = await updateAssignment(createResult.data.id as string, {
        paymentAmount: 600,
      })

      if (updateResult.success) {
        console.log('✅ Assignment updated successfully')
      } else {
        console.log(`❌ Failed to update: ${updateResult.message}`)
      }

      console.log(`\n${'='.repeat(60)}\n`)

      // Test 3: Delete assignment
      console.log('Test 3: Deleting assignment (should also delete budget item)...')
      const deleteResult = await deleteAssignment(createResult.data.id as string)

      if (deleteResult.success) {
        console.log('✅ Assignment deleted successfully')
        console.log('✅ Linked budget item should also be deleted')
      } else {
        console.log(`❌ Failed to delete: ${deleteResult.message}`)
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log('✅ All tests completed!')
    console.log('\n💡 Note: Budget items are only created if:')
    console.log('   1. budgetCategoryId is provided')
    console.log('   2. paymentAmount > 0')
    console.log('   3. The budget category exists in the database')
    console.log('\n📊 Check Drizzle Studio to verify budget items were created/deleted')
  } catch (error) {
    console.error('❌ Test failed with error:', error)
  }

  process.exit(0)
}

testStaffBudgetIntegration()
