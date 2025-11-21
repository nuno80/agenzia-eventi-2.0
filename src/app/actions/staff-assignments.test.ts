/**
 * FILE: src/app/actions/staff-assignments.test.ts
 * PURPOSE: Unit tests for Staff ↔ Budget integration
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as budgetActions from './budget'
import { createAssignment, deleteAssignment, updateAssignment } from './staff-assignments'

// Mock budget actions
vi.mock('./budget', () => ({
  createBudgetItem: vi.fn(),
  updateBudgetItem: vi.fn(),
  deleteBudgetItem: vi.fn(),
}))

// Mock database
vi.mock('@/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'assignment-1' }]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([
          {
            id: 'assignment-1',
            staffId: 'staff-1',
            eventId: 'event-1',
            budgetItemId: 'budget-item-1',
            paymentAmount: 500,
            paymentStatus: 'pending',
            assignmentStatus: 'confirmed',
          },
        ]),
      }),
    }),
    query: {
      staff: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'staff-1',
          firstName: 'Mario',
          lastName: 'Rossi',
        }),
      },
      staffAssignments: {
        findFirst: vi.fn(),
      },
    },
  },
  staffAssignments: {},
}))

// Mock revalidatePath
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Staff ↔ Budget Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createAssignment', () => {
    it('should create budget item when budgetCategoryId is provided', async () => {
      const mockBudgetResult = {
        success: true,
        message: 'Budget item created',
        data: { id: 'budget-item-1' },
      }

      vi.mocked(budgetActions.createBudgetItem).mockResolvedValue(mockBudgetResult)

      const payload = {
        eventId: 'event-1',
        staffId: 'staff-1',
        startTime: new Date('2025-01-01T09:00:00'),
        endTime: new Date('2025-01-01T17:00:00'),
        assignmentStatus: 'confirmed' as const,
        paymentAmount: 500,
        paymentTerms: 'custom' as const,
        budgetCategoryId: 'category-1',
      }

      const result = await createAssignment(payload)

      expect(result.success).toBe(true)
      expect(budgetActions.createBudgetItem).toHaveBeenCalledWith('category-1', 'event-1', {
        description: 'Pagamento Staff: Rossi Mario',
        estimatedCost: 500,
        actualCost: 500,
        vendor: 'Mario Rossi',
        notes: 'Generato automaticamente dal modulo Staff',
      })
    })

    it('should NOT create budget item when budgetCategoryId is missing', async () => {
      const payload = {
        eventId: 'event-1',
        staffId: 'staff-1',
        startTime: new Date('2025-01-01T09:00:00'),
        endTime: new Date('2025-01-01T17:00:00'),
        assignmentStatus: 'confirmed' as const,
        paymentAmount: 500,
        paymentTerms: 'custom' as const,
      }

      await createAssignment(payload)

      expect(budgetActions.createBudgetItem).not.toHaveBeenCalled()
    })

    it('should NOT create budget item when paymentAmount is zero', async () => {
      const payload = {
        eventId: 'event-1',
        staffId: 'staff-1',
        startTime: new Date('2025-01-01T09:00:00'),
        endTime: new Date('2025-01-01T17:00:00'),
        assignmentStatus: 'confirmed' as const,
        paymentAmount: 0,
        paymentTerms: 'custom' as const,
        budgetCategoryId: 'category-1',
      }

      await createAssignment(payload)

      expect(budgetActions.createBudgetItem).not.toHaveBeenCalled()
    })
  })

  describe('updateAssignment', () => {
    it('should update existing budget item when budgetItemId exists', async () => {
      const payload = {
        paymentAmount: 600,
      }

      await updateAssignment('assignment-1', payload)

      expect(budgetActions.updateBudgetItem).toHaveBeenCalledWith('budget-item-1', {
        description: 'Pagamento Staff: Rossi Mario',
        estimatedCost: 600,
        actualCost: 600,
        vendor: 'Mario Rossi',
      })
    })

    it('should create new budget item if budgetCategoryId provided and none exists', async () => {
      // Mock assignment without budgetItemId
      vi.mocked(require('@/db').db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              id: 'assignment-2',
              staffId: 'staff-1',
              eventId: 'event-1',
              budgetItemId: null,
              paymentAmount: 400,
            },
          ]),
        }),
      })

      const mockBudgetResult = {
        success: true,
        message: 'Budget item created',
        data: { id: 'budget-item-2' },
      }

      vi.mocked(budgetActions.createBudgetItem).mockResolvedValue(mockBudgetResult)

      const payload = {
        budgetCategoryId: 'category-1',
        paymentAmount: 500,
      }

      await updateAssignment('assignment-2', payload)

      expect(budgetActions.createBudgetItem).toHaveBeenCalled()
    })
  })

  describe('deleteAssignment', () => {
    it('should delete linked budget item before deleting assignment', async () => {
      await deleteAssignment('assignment-1')

      expect(budgetActions.deleteBudgetItem).toHaveBeenCalledWith('budget-item-1')
    })

    it('should NOT call deleteBudgetItem if no budgetItemId exists', async () => {
      // Mock assignment without budgetItemId
      vi.mocked(require('@/db').db.select).mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([
            {
              id: 'assignment-3',
              staffId: 'staff-1',
              eventId: 'event-1',
              budgetItemId: null,
            },
          ]),
        }),
      })

      await deleteAssignment('assignment-3')

      expect(budgetActions.deleteBudgetItem).not.toHaveBeenCalled()
    })
  })
})
