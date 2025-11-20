import { Suspense } from 'react'
import { ServiceList } from '@/components/dashboard/events/services/ServiceList'
import { ServiceStats } from '@/components/dashboard/events/services/ServiceStats'
import { getServiceStats, getServicesByEventId } from '@/data/services'
import { getBudgetCategoriesByEvent } from '@/lib/dal/budget'

interface ServicesTabProps {
  eventId: string
}

export async function ServicesTab({ eventId }: ServicesTabProps) {
  const services = await getServicesByEventId(eventId)
  const stats = await getServiceStats(eventId)
  const budgetCategories = await getBudgetCategoriesByEvent(eventId)

  return (
    <div className="space-y-6">
      <Suspense fallback={<div>Caricamento statistiche...</div>}>
        <ServiceStats stats={stats} />
      </Suspense>

      <Suspense fallback={<div>Caricamento servizi...</div>}>
        <ServiceList eventId={eventId} services={services} budgetCategories={budgetCategories} />
      </Suspense>
    </div>
  )
}
