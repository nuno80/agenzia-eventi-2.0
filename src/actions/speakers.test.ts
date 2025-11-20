import { afterEach, describe, expect, it, vi } from 'vitest'
import { createBudgetItem, deleteBudgetItem, updateBudgetItem } from '@/app/actions/budget'
import { db } from '@/db'
import { createSpeaker, deleteSpeaker, updateSpeaker } from './speakers'

// Mock dependencies
vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(() => ({ values: vi.fn() })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })),
    delete: vi.fn(() => ({ where: vi.fn() })),
    query: {
      speakers: {
        findFirst: vi.fn(),
      },
    },
  },
  speakers: {
    id: 'id',
    eventId: 'eventId',
  },
}))

vi.mock('@/app/actions/budget', () => ({
  createBudgetItem: vi.fn(),
  updateBudgetItem: vi.fn(),
  deleteBudgetItem: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Speaker Actions', () => {
  const eventId = 'evt_123'
  const speakerId = 'spk_123'

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createSpeaker', () => {
    it('should create a speaker without budget item', async () => {
      const formData = new FormData()
      formData.append('firstName', 'Mario')
      formData.append('lastName', 'Rossi')
      formData.append('email', 'mario@test.com')
      formData.append('confirmationStatus', 'invited')

      const result = await createSpeaker(eventId, formData)

      expect(result.success).toBe(true)
      expect(db.insert).toHaveBeenCalled()
      expect(createBudgetItem).not.toHaveBeenCalled()
    })

    it('should create a speaker AND a budget item if category provided', async () => {
      const formData = new FormData()
      formData.append('firstName', 'Mario')
      formData.append('lastName', 'Rossi')
      formData.append('email', 'mario@test.com')
      formData.append('confirmationStatus', 'confirmed')
      formData.append('fee', '1000')
      formData.append('budgetCategoryId', 'cat_123')

      vi.mocked(createBudgetItem).mockResolvedValue({
        success: true,
        message: 'Created',
        data: { id: 'bi_123' },
      })

      const result = await createSpeaker(eventId, formData)

      expect(result.success).toBe(true)
      expect(createBudgetItem).toHaveBeenCalledWith(
        'cat_123',
        eventId,
        expect.objectContaining({
          estimatedCost: 1000,
          actualCost: 1000,
        })
      )
      // Verify budgetItemId was passed to insert
      const insertCall = vi.mocked(db.insert).mock.results[0].value
      expect(insertCall.values).toHaveBeenCalledWith(
        expect.objectContaining({
          budgetItemId: 'bi_123',
        })
      )
    })
  })

  describe('updateSpeaker', () => {
    it('should update speaker and linked budget item', async () => {
      const formData = new FormData()
      formData.append('firstName', 'Mario')
      formData.append('lastName', 'Verdi') // Changed name
      formData.append('email', 'mario@test.com')
      formData.append('confirmationStatus', 'confirmed')
      formData.append('fee', '1500') // Changed fee

      // Mock existing speaker with budget link
      vi.mocked(db.query.speakers.findFirst).mockResolvedValue({
        id: speakerId,
        budgetItemId: 'bi_123',
      } as any)

      const result = await updateSpeaker(eventId, speakerId, formData)

      expect(result.success).toBe(true)
      expect(updateBudgetItem).toHaveBeenCalledWith(
        'bi_123',
        expect.objectContaining({
          estimatedCost: 1500,
          actualCost: 1500,
        })
      )
      expect(db.update).toHaveBeenCalled()
    })

    it('should create new budget item if category added during update', async () => {
      const formData = new FormData()
      formData.append('firstName', 'Mario')
      formData.append('lastName', 'Rossi')
      formData.append('email', 'mario@test.com')
      formData.append('confirmationStatus', 'confirmed')
      formData.append('fee', '1000')
      formData.append('budgetCategoryId', 'cat_123')

      // Mock existing speaker WITHOUT budget link
      vi.mocked(db.query.speakers.findFirst).mockResolvedValue({
        id: speakerId,
        budgetItemId: null,
      })

      vi.mocked(createBudgetItem).mockResolvedValue({
        success: true,
        message: 'Created',
        data: { id: 'bi_new' },
      })

      const result = await updateSpeaker(eventId, speakerId, formData)

      expect(result.success).toBe(true)
      expect(createBudgetItem).toHaveBeenCalled()
      // Verify new budget ID is saved
      const updateCall = vi.mocked(db.update).mock.results[0].value
      const setCall = updateCall.set.mock.results[0].value
      expect(setCall.where).toHaveBeenCalled() // Check chain
      expect(updateCall.set).toHaveBeenCalledWith(
        expect.objectContaining({
          budgetItemId: 'bi_new',
        })
      )
    })
  })

  describe('deleteSpeaker', () => {
    it('should delete speaker and linked budget item', async () => {
      // Mock existing speaker with budget link
      vi.mocked(db.query.speakers.findFirst).mockResolvedValue({
        id: speakerId,
        budgetItemId: 'bi_123',
      })

      const result = await deleteSpeaker(eventId, speakerId)

      expect(result.success).toBe(true)
      expect(deleteBudgetItem).toHaveBeenCalledWith('bi_123')
      expect(db.delete).toHaveBeenCalled()
    })
  })
})
