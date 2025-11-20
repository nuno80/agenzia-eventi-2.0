import { revalidatePath } from 'next/cache'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '@/db'
import { createSession, deleteSession, updateSession } from './agenda'

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
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
  },
  agenda: {
    id: 'id',
    eventId: 'eventId',
    // Add other fields as needed for mocking
  },
}))

// Mock eq from drizzle-orm
vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
}))

describe('Agenda Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createSession', () => {
    it('should create a session successfully with valid data', async () => {
      const formData = new FormData()
      formData.append('eventId', 'event-123')
      formData.append('title', 'Test Session')
      formData.append('startTime', new Date('2023-01-01T10:00:00').toISOString())
      formData.append('endTime', new Date('2023-01-01T11:00:00').toISOString())
      formData.append('sessionType', 'talk')

      const result = await createSession(null, formData)

      expect(result).toEqual({ success: true })
      expect(db.insert).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/eventi/event-123')
      expect(revalidatePath).toHaveBeenCalledWith('/eventi/event-123/agenda')
    })

    it('should fail validation if title is missing', async () => {
      const formData = new FormData()
      formData.append('eventId', 'event-123')
      // Title missing
      formData.append('startTime', new Date().toISOString())
      formData.append('endTime', new Date().toISOString())
      formData.append('sessionType', 'talk')

      const result = await createSession(null, formData)

      expect(result).toHaveProperty('error', 'Validation failed')
      expect(db.insert).not.toHaveBeenCalled()
    })
  })

  describe('updateSession', () => {
    it('should update a session successfully', async () => {
      const formData = new FormData()
      formData.append('id', 'session-123')
      formData.append('eventId', 'event-123')
      formData.append('title', 'Updated Session')
      formData.append('startTime', new Date('2023-01-01T10:00:00').toISOString())
      formData.append('endTime', new Date('2023-01-01T11:00:00').toISOString())
      formData.append('sessionType', 'workshop')
      formData.append('status', 'scheduled')

      const result = await updateSession(null, formData)

      expect(result).toEqual({ success: true })
      expect(db.update).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/eventi/event-123')
      expect(revalidatePath).toHaveBeenCalledWith('/eventi/event-123/agenda')
    })

    it('should fail if id is missing', async () => {
      const formData = new FormData()
      formData.append('eventId', 'event-123')
      formData.append('title', 'Updated Session')

      const result = await updateSession(null, formData)

      expect(result).toHaveProperty('error', 'Session ID is required')
      expect(db.update).not.toHaveBeenCalled()
    })
  })

  describe('deleteSession', () => {
    it('should delete a session successfully', async () => {
      const result = await deleteSession('session-123', 'event-123')

      expect(result).toEqual({ success: true })
      expect(db.delete).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/eventi/event-123')
      expect(revalidatePath).toHaveBeenCalledWith('/eventi/event-123/agenda')
    })

    it('should fail if id is missing', async () => {
      const result = await deleteSession('', 'event-123')
      expect(result).toHaveProperty('error', 'Session ID is required')
      expect(db.delete).not.toHaveBeenCalled()
    })
  })
})
