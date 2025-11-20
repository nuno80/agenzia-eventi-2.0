import { desc, eq } from 'drizzle-orm'
import { cache } from 'react'
import { db } from '@/db'
import { services } from '@/db/libsql-schemas/events'

export const getServicesByEventId = cache(async (eventId: string) => {
  try {
    const data = await db.query.services.findMany({
      where: eq(services.eventId, eventId),
      orderBy: [desc(services.createdAt)],
    })
    return data
  } catch (error) {
    console.error('Failed to fetch services:', error)
    throw new Error('Failed to fetch services')
  }
})

export const getServiceById = cache(async (serviceId: string) => {
  try {
    const data = await db.query.services.findFirst({
      where: eq(services.id, serviceId),
    })
    return data
  } catch (error) {
    console.error('Failed to fetch service:', error)
    throw new Error('Failed to fetch service')
  }
})

export const getServiceStats = cache(async (eventId: string) => {
  try {
    const allServices = await getServicesByEventId(eventId)

    const totalEstimatedCost = allServices.reduce((acc, curr) => {
      return acc + (curr.finalPrice || curr.quotedPrice || 0)
    }, 0)

    const confirmedCount = allServices.filter(
      (s) => s.contractStatus === 'contracted' || s.contractStatus === 'delivered'
    ).length

    const pendingCount = allServices.filter(
      (s) => s.contractStatus === 'requested' || s.contractStatus === 'quoted'
    ).length

    return {
      totalEstimatedCost,
      confirmedCount,
      pendingCount,
      totalCount: allServices.length,
    }
  } catch (error) {
    console.error('Failed to fetch service stats:', error)
    throw new Error('Failed to fetch service stats')
  }
})
