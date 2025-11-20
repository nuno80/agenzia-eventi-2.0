'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createBudgetItem, deleteBudgetItem, updateBudgetItem } from '@/app/actions/budget'
import { db } from '@/db'
import { services } from '@/db/libsql-schemas/events'

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const serviceSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  serviceName: z.string().min(3, 'Service name must be at least 3 characters'),
  serviceType: z.enum([
    'catering',
    'av_equipment',
    'photography',
    'videography',
    'transport',
    'security',
    'cleaning',
    'printing',
    'other',
  ]),
  providerName: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  contractStatus: z.enum(['requested', 'quoted', 'contracted', 'delivered']).default('requested'),
  quotedPrice: z.number().min(0).optional().nullable(),
  finalPrice: z.number().min(0).optional().nullable(),
  deliveryDate: z
    .string()
    .optional()
    .nullable()
    .transform((str) => (str ? new Date(str) : null)),
  deliveryTime: z.string().optional(),
  paymentStatus: z.enum(['pending', 'paid']).default('pending'),
  description: z.string().optional(),
  requirements: z.string().optional(),
  notes: z.string().optional(),
  budgetCategoryId: z.string().optional(),
})

export type ServiceFormData = z.infer<typeof serviceSchema>

// ============================================================================
// ACTIONS
// ============================================================================

export async function createService(_prevState: any, formData: FormData) {
  const rawData: Record<string, any> = {
    eventId: formData.get('eventId'),
    serviceName: formData.get('serviceName'),
    serviceType: formData.get('serviceType'),
    providerName: formData.get('providerName') || undefined,
    contactPerson: formData.get('contactPerson') || undefined,
    email: formData.get('email') || undefined,
    phone: formData.get('phone') || undefined,
    contractStatus: formData.get('contractStatus') || 'requested',
    quotedPrice: formData.get('quotedPrice') ? Number(formData.get('quotedPrice')) : null,
    finalPrice: formData.get('finalPrice') ? Number(formData.get('finalPrice')) : null,
    deliveryDate: formData.get('deliveryDate') || null,
    deliveryTime: formData.get('deliveryTime') || undefined,
    paymentStatus: formData.get('paymentStatus') || 'pending',
    description: formData.get('description') || undefined,
    requirements: formData.get('requirements') || undefined,
    notes: formData.get('notes') || undefined,
    budgetCategoryId: formData.get('budgetCategoryId') || undefined,
  }

  const validated = serviceSchema.safeParse(rawData)

  if (!validated.success) {
    console.log('Create Service Validation failed:', validated.error.flatten())
    return { error: 'Validation failed', details: validated.error.flatten() }
  }

  try {
    // 1. Create Budget Item if category is selected
    let budgetItemId: string | null = null

    if (validated.data.budgetCategoryId) {
      const budgetResult = await createBudgetItem(
        validated.data.budgetCategoryId,
        validated.data.eventId,
        {
          description: validated.data.serviceName,
          estimatedCost: validated.data.finalPrice || validated.data.quotedPrice || 0,
          actualCost: validated.data.finalPrice || undefined,
          status: validated.data.contractStatus === 'delivered' ? 'invoiced' : 'planned',
          vendor: validated.data.providerName,
        }
      )

      if (budgetResult.success && budgetResult.data?.id) {
        budgetItemId = budgetResult.data.id as string
      } else {
        console.error('Failed to create budget item:', budgetResult)
        // Continue creating service even if budget fails, but log it
      }
    }

    // 2. Create Service
    await db.insert(services).values({
      ...validated.data,
      budgetItemId,
    })

    revalidatePath(`/eventi/${validated.data.eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to create service:', error)
    return { error: 'Failed to create service' }
  }
}

export async function updateService(_prevState: any, formData: FormData) {
  const id = formData.get('id') as string
  if (!id) return { error: 'Service ID is required' }

  const rawData: Record<string, any> = {
    eventId: formData.get('eventId'),
    serviceName: formData.get('serviceName'),
    serviceType: formData.get('serviceType'),
    providerName: formData.get('providerName') || undefined,
    contactPerson: formData.get('contactPerson') || undefined,
    email: formData.get('email') || undefined,
    phone: formData.get('phone') || undefined,
    contractStatus: formData.get('contractStatus') || undefined,
    quotedPrice: formData.get('quotedPrice') ? Number(formData.get('quotedPrice')) : null,
    finalPrice: formData.get('finalPrice') ? Number(formData.get('finalPrice')) : null,
    deliveryDate: formData.get('deliveryDate') || null,
    deliveryTime: formData.get('deliveryTime') || undefined,
    paymentStatus: formData.get('paymentStatus') || undefined,
    description: formData.get('description') || undefined,
    requirements: formData.get('requirements') || undefined,
    notes: formData.get('notes') || undefined,
    budgetCategoryId: formData.get('budgetCategoryId') || undefined,
  }

  const validated = serviceSchema.safeParse(rawData)

  if (!validated.success) {
    console.log('Update Service Validation failed:', validated.error.flatten())
    return { error: 'Validation failed', details: validated.error.flatten() }
  }

  try {
    // 1. Get existing service to check for budget link
    const existingService = await db.query.services.findFirst({
      where: eq(services.id, id),
    })

    if (!existingService) return { error: 'Service not found' }

    let budgetItemId = existingService.budgetItemId

    // 2. Handle Budget Item
    // Case A: Create new budget item if requested and none exists
    if (validated.data.budgetCategoryId && !budgetItemId) {
      const budgetResult = await createBudgetItem(
        validated.data.budgetCategoryId,
        validated.data.eventId,
        {
          description: validated.data.serviceName,
          estimatedCost: validated.data.finalPrice || validated.data.quotedPrice || 0,
          actualCost: validated.data.finalPrice || undefined,
          status: validated.data.contractStatus === 'delivered' ? 'invoiced' : 'planned',
          vendor: validated.data.providerName,
        }
      )
      if (budgetResult.success && budgetResult.data?.id) {
        budgetItemId = budgetResult.data.id as string
      }
    }
    // Case B: Update existing budget item
    else if (budgetItemId) {
      await updateBudgetItem(budgetItemId, {
        description: validated.data.serviceName,
        estimatedCost: validated.data.finalPrice || validated.data.quotedPrice || 0,
        actualCost: validated.data.finalPrice || undefined,
        vendor: validated.data.providerName,
      })
    }

    // 3. Update Service
    await db
      .update(services)
      .set({
        ...validated.data,
        budgetItemId,
      })
      .where(eq(services.id, id))

    revalidatePath(`/eventi/${validated.data.eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update service:', error)
    return { error: 'Failed to update service' }
  }
}

export async function deleteService(id: string, eventId: string) {
  if (!id) return { error: 'Service ID is required' }

  try {
    // 1. Get service to find budget item
    const service = await db.query.services.findFirst({
      where: eq(services.id, id),
    })

    if (service?.budgetItemId) {
      // 2. Delete budget item (if exists)
      await deleteBudgetItem(service.budgetItemId)
    }

    // 3. Delete service
    await db.delete(services).where(eq(services.id, id))
    revalidatePath(`/eventi/${eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete service:', error)
    return { error: 'Failed to delete service' }
  }
}

export async function updateServiceStatus(id: string, eventId: string, status: string) {
  if (!id) return { error: 'Service ID is required' }

  try {
    // @ts-expect-error - status type check handled by runtime or UI
    await db.update(services).set({ contractStatus: status }).where(eq(services.id, id))
    revalidatePath(`/eventi/${eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update service status:', error)
    return { error: 'Failed to update service status' }
  }
}
