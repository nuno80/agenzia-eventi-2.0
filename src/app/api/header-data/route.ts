/**
 * FILE: src/app/api/header-data/route.ts
 * TYPE: API Route
 *
 * PURPOSE: Provides data for the Header component
 * - Organization name from settings
 * - Recent notifications (deadlines, payments)
 *
 * USAGE: Called by Header component on mount
 */

import { NextResponse } from 'next/server'
import { db } from '@/db'
import { getUrgentDeadlines } from '@/lib/dal/deadlines'
import { getAllPendingPayments, getOverduePayments } from '@/lib/dal/staff-assignments'

interface HeaderNotification {
  id: string
  title: string
  message: string
  time: string
  unread: boolean
  type: 'deadline' | 'payment' | 'info'
  link?: string
}

export async function GET() {
  try {
    // Get organization settings
    const settings = await db.query.organizationSettings.findFirst()

    // Get urgent deadlines
    let deadlines: Awaited<ReturnType<typeof getUrgentDeadlines>> = []
    try {
      deadlines = await getUrgentDeadlines()
    } catch {
      // Ignore if deadlines fetch fails
    }

    // Get payment notifications
    let overduePayments: Awaited<ReturnType<typeof getOverduePayments>> = []
    let pendingPayments: Awaited<ReturnType<typeof getAllPendingPayments>> = []
    try {
      overduePayments = await getOverduePayments()
      pendingPayments = await getAllPendingPayments()
    } catch {
      // Ignore if payments fetch fails
    }

    // Build notifications array
    const notifications: HeaderNotification[] = []

    // Add deadline notifications
    for (const deadline of deadlines.slice(0, 3)) {
      const daysUntil = Math.ceil(
        (new Date(deadline.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      notifications.push({
        id: `deadline-${deadline.id}`,
        title: daysUntil < 0 ? 'Scadenza superata!' : 'Scadenza imminente',
        message: `${deadline.title} - ${deadline.event?.title || 'Evento'}`,
        time: daysUntil < 0 ? `${Math.abs(daysUntil)} giorni fa` : `tra ${daysUntil} giorni`,
        unread: daysUntil <= 3,
        type: 'deadline',
        link: deadline.event?.id ? `/eventi/${deadline.event.id}/overview` : undefined,
      })
    }

    // Add overdue payment notifications
    for (const payment of overduePayments.slice(0, 2)) {
      notifications.push({
        id: `payment-${payment.id}`,
        title: 'Pagamento scaduto',
        message: `${payment.staff?.firstName} ${payment.staff?.lastName} - €${payment.paymentAmount}`,
        time: 'Scaduto',
        unread: true,
        type: 'payment',
        link: payment.eventId ? `/eventi/${payment.eventId}/staff` : undefined,
      })
    }

    // Add pending payment notifications (not overdue, but due soon)
    for (const payment of pendingPayments.slice(0, 2)) {
      const daysUntil = payment.paymentDueDate
        ? Math.ceil(
            (new Date(payment.paymentDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          )
        : 0
      if (daysUntil > 0 && daysUntil <= 7) {
        notifications.push({
          id: `payment-pending-${payment.id}`,
          title: 'Pagamento in scadenza',
          message: `${payment.staff?.firstName} ${payment.staff?.lastName} - €${payment.paymentAmount}`,
          time: `tra ${daysUntil} giorni`,
          unread: daysUntil <= 3,
          type: 'payment',
          link: payment.eventId ? `/eventi/${payment.eventId}/staff` : undefined,
        })
      }
    }

    // Sort by unread first, limit to 5
    notifications.sort((a, b) => (b.unread ? 1 : 0) - (a.unread ? 1 : 0))
    const limitedNotifications = notifications.slice(0, 5)

    return NextResponse.json({
      organizationName: settings?.organizationName || 'EventHub',
      organizationEmail: settings?.contactEmail || null,
      notifications: limitedNotifications,
    })
  } catch (error) {
    console.error('[API] Failed to get header data:', error)
    return NextResponse.json({
      organizationName: 'EventHub',
      organizationEmail: null,
      notifications: [],
    })
  }
}
