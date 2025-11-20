import { revalidatePath } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBudgetItem, deleteBudgetItem, updateBudgetItem } from '@/app/actions/budget'
import { db } from '@/db'
import { createService, deleteService, updateService, updateServiceStatus } from './services'

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock budget actions
vi.mock('@/app/actions/budget', () => ({
  createBudgetItem: vi.fn(() =>
    Promise.resolve({ success: true, data: { id: 'budget-item-123' } })
  ),
  updateBudgetItem: vi.fn(() => Promise.resolve({ success: true })),
  deleteBudgetItem: vi.fn(() => Promise.resolve({ success: true })),
}))

// Mock db
vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve()),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
    query: {
      services: {
        findFirst: vi.fn(),
      },
    },
  },
}))

// Mock eq and relations from drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  relations: vi.fn(),
}))

describe('Services Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createService', () => {
    it('should create a service successfully with valid data', async () => {
      const formData = new FormData()
      formData.append('eventId', 'event-123')
      formData.append('serviceName', 'Catering Lunch')
      formData.append('serviceType', 'catering')
      formData.append('contractStatus', 'requested')
      formData.append('paymentStatus', 'pending')

      const result = await createService(null, formData)

      expect(result).toEqual({ success: true })
      expect(db.insert).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/eventi/event-123')
    })

    it('should create a budget item if budgetCategoryId is provided', async () => {
      const formData = new FormData()
      formData.append('eventId', 'event-123')
      formData.append('serviceName', 'Catering Lunch')
      formData.append('serviceType', 'catering')
      formData.append('budgetCategoryId', 'cat-123')
      formData.append('quotedPrice', '1000')

      const result = await createService(null, formData)

      expect(result).toEqual({ success: true })
      expect(createBudgetItem).toHaveBeenCalledWith(
        'cat-123',
        'event-123',
        expect.objectContaining({
          description: 'Catering Lunch',
          estimatedCost: 1000,
        })
      )
      expect(db.insert).toHaveBeenCalled()
    })

    it('should fail validation if serviceName is missing', async () => {
      const formData = new FormData()
      formData.append('eventId', 'event-123')
      // serviceName missing
      formData.append('serviceType', 'catering')

      const result = await createService(null, formData)

      expect(result).toHaveProperty('error', 'Validation failed')
      expect(db.insert).not.toHaveBeenCalled()
    })
  })

  describe('updateService', () => {
    it('should update a service successfully', async () => {
      // Mock existing service
      const mockService = { id: 'service-123', budgetItemId: null }
      // @ts-expect-error
      db.query.services.findFirst.mockResolvedValue(mockService)

      const formData = new FormData()
      formData.append('id', 'service-123')
      formData.append('eventId', 'event-123')
      formData.append('serviceName', 'Updated Catering')
      formData.append('serviceType', 'catering')

      const result = await updateService(null, formData)

      expect(result).toEqual({ success: true })
      expect(db.update).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/eventi/event-123')
    })

    it('should update linked budget item if exists', async () => {
      // Mock existing service with budget item
      const mockService = { id: 'service-123', budgetItemId: 'budget-item-123' }
      // @ts-expect-error
      db.query.services.findFirst.mockResolvedValue(mockService)

      const formData = new FormData()
      formData.append('id', 'service-123')
      formData.append('eventId', 'event-123')
      formData.append('serviceName', 'Updated Catering')
      formData.append('serviceType', 'catering')
      formData.append('finalPrice', '1200')

      const result = await updateService(null, formData)

      expect(result).toEqual({ success: true })
      expect(updateBudgetItem).toHaveBeenCalledWith(
        'budget-item-123',
        expect.objectContaining({
          description: 'Updated Catering',
          actualCost: 1200,
        })
      )
    })

    it('should fail if id is missing', async () => {
      const formData = new FormData()
      formData.append('eventId', 'event-123')
      formData.append('serviceName', 'Updated Catering')

      const result = await updateService(null, formData)

      expect(result).toHaveProperty('error', 'Service ID is required')
      expect(db.update).not.toHaveBeenCalled()
    })
  })

  describe('deleteService', () => {
    it('should delete a service successfully', async () => {
      const result = await deleteService('service-123', 'event-123')

      expect(result).toEqual({ success: true })
      expect(db.delete).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/eventi/event-123')
    })

    it('should delete linked budget item if exists', async () => {
      // Mock existing service with budget item
      const mockService = { id: 'service-123', budgetItemId: 'budget-item-123' }
      // @ts-expect-error
      db.query.services.findFirst.mockResolvedValue(mockService)

      const result = await deleteService('service-123', 'event-123')

      expect(result).toEqual({ success: true })
      expect(deleteBudgetItem).toHaveBeenCalledWith('budget-item-123')
      expect(db.delete).toHaveBeenCalled()
    })

    it('should fail if id is missing', async () => {
      const result = await deleteService('', 'event-123')
      expect(result).toHaveProperty('error', 'Service ID is required')
      expect(db.delete).not.toHaveBeenCalled()
    })
  })

  describe('updateServiceStatus', () => {
    it('should update service status successfully', async () => {
      const result = await updateServiceStatus('service-123', 'event-123', 'contracted')

      expect(result).toEqual({ success: true })
      expect(db.update).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/eventi/event-123')
    })

    it('should fail if id is missing', async () => {
      const result = await updateServiceStatus('', 'event-123', 'contracted')
      expect(result).toHaveProperty('error', 'Service ID is required')
      expect(db.update).not.toHaveBeenCalled()
    })
  })
})
