'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { agenda, db } from '@/db'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const sessionSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  startTime: z.string().transform((str) => new Date(str)),
  endTime: z.string().transform((str) => new Date(str)),
  sessionType: z.enum(['keynote', 'talk', 'workshop', 'panel', 'break', 'networking', 'other']),
  room: z.string().optional(),
  location: z.string().optional(),
  speakerId: z.string().optional().nullable(),
  maxAttendees: z.number().min(0).optional().nullable(),
  status: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled']).default('scheduled'),
})

export type SessionFormData = z.infer<typeof sessionSchema>

// ============================================================================
// ACTIONS
// ============================================================================

export async function createSession(_prevState: any, formData: FormData) {
  // Extract data from FormData
  const rawData: Record<string, any> = {
    eventId: formData.get('eventId'),
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    sessionType: formData.get('sessionType'),
    room: formData.get('room') || undefined,
    location: formData.get('location') || undefined,
    speakerId: formData.get('speakerId') || null,
    maxAttendees: formData.get('maxAttendees') ? Number(formData.get('maxAttendees')) : null,
    status: formData.get('status') || 'scheduled',
  }

  // Validate
  const validated = sessionSchema.safeParse(rawData)
  if (!validated.success) {
    console.log('Create Session Validation failed. Raw data:', rawData)
    console.log('Validation errors:', validated.error.flatten())
    return { error: 'Validation failed', details: validated.error.flatten() }
  }

  const data = validated.data

  // Calculate duration
  const duration = Math.round((data.endTime.getTime() - data.startTime.getTime()) / (1000 * 60))

  try {
    await db.insert(agenda).values({
      ...data,
      duration,
    })

    revalidatePath(`/eventi/${data.eventId}`)
    revalidatePath(`/eventi/${data.eventId}/agenda`)
    return { success: true }
  } catch (error) {
    console.error('Failed to create session:', error)
    return { error: 'Failed to create session' }
  }
}

export async function updateSession(_prevState: any, formData: FormData) {
  const id = formData.get('id') as string
  console.log('Updating session ID:', id)
  if (!id) return { error: 'Session ID is required' }

  // Extract data
  const rawData: Record<string, any> = {
    eventId: formData.get('eventId'),
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    sessionType: formData.get('sessionType'),
    room: formData.get('room') || undefined,
    location: formData.get('location') || undefined,
    speakerId: formData.get('speakerId') || null,
    maxAttendees: formData.get('maxAttendees') ? Number(formData.get('maxAttendees')) : null,
    status: formData.get('status') || undefined,
  }

  // Validate
  const validated = sessionSchema.safeParse(rawData)
  if (!validated.success) {
    console.log('Update Session Validation failed. Raw data:', rawData)
    console.log('Validation errors:', validated.error.flatten())
    return { error: 'Validation failed', details: validated.error.flatten() }
  }

  const data = validated.data
  const duration = Math.round((data.endTime.getTime() - data.startTime.getTime()) / (1000 * 60))

  try {
    await db
      .update(agenda)
      .set({
        ...data,
        duration,
      })
      .where(eq(agenda.id, id))

    revalidatePath(`/eventi/${data.eventId}`)
    revalidatePath(`/eventi/${data.eventId}/agenda`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update session:', error)
    return { error: 'Failed to update session' }
  }
}

export async function deleteSession(id: string, eventId: string) {
  console.log('Deleting session:', id, 'Event:', eventId)
  if (!id) return { error: 'Session ID is required' }

  try {
    await db.delete(agenda).where(eq(agenda.id, id))
    revalidatePath(`/eventi/${eventId}`)
    revalidatePath(`/eventi/${eventId}/agenda`)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete session:', error)
    return { error: 'Failed to delete session' }
  }
}
