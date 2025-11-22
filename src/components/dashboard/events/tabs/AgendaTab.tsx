import { getEventAgenda } from '@/lib/dal/agenda'
import { getEventWithServices } from '@/lib/dal/events'
import { getSpeakersByEvent } from '@/lib/dal/speakers'
import { getAllStaff } from '@/lib/dal/staff'
import { AgendaTimeline } from '../agenda/AgendaTimeline'

interface AgendaTabProps {
  eventId: string
}

export async function AgendaTab({ eventId }: AgendaTabProps) {
  const [sessions, speakers, eventWithServices, staff] = await Promise.all([
    getEventAgenda(eventId),
    getSpeakersByEvent(eventId),
    getEventWithServices(eventId),
    getAllStaff(),
  ])

  const speakersList = speakers.map((s) => ({
    id: s.id,
    name: `${s.firstName} ${s.lastName}`,
  }))

  const servicesList =
    eventWithServices?.services.map((s) => ({
      id: s.id,
      name: s.serviceName,
    })) || []

  const staffList = staff
    .filter((s) => s.isActive)
    .map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      role: s.role,
    }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Agenda</h2>
        <p className="text-muted-foreground">
          Gestisci il programma dell'evento, le sessioni e i relatori.
        </p>
      </div>

      <AgendaTimeline
        eventId={eventId}
        sessions={sessions}
        speakers={speakersList}
        services={servicesList}
        staff={staffList}
      />
    </div>
  )
}
