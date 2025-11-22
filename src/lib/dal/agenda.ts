/**
 * DATA ACCESS LAYER: Agenda
 *
 * PURPOSE:
 * - Centralize all database queries for agenda/sessions
 * - Use React cache() to deduplicate requests
 * - Provide type-safe data fetching
 */

import { asc, eq } from 'drizzle-orm'
import { cache } from 'react'
import { agenda, db } from '@/db'

// ============================================================================
// DTO TYPES
// ============================================================================

export type AgendaSessionDTO = {
  id: string
  eventId: string
  title: string
  description: string | null
  startTime: Date
  endTime: Date
  duration: number | null
  sessionType: 'keynote' | 'talk' | 'workshop' | 'panel' | 'break' | 'networking' | 'other'
  room: string | null
  location: string | null
  speakerId: string | null
  speaker: {
    id: string
    firstName: string
    lastName: string
    photoUrl: string | null
    company: string | null
    jobTitle: string | null
  } | null
  maxAttendees: number | null
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  services: {
    serviceId: string
    service: {
      serviceName: string
    }
  }[]
  staff: {
    staffId: string
    sessionRole: string | null
    staff: {
      id: string
      firstName: string
      lastName: string
      role: string
      photoUrl: string | null
    }
  }[]
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all sessions for an event
 * Ordered by start time
 */
export const getEventAgenda = cache(async (eventId: string): Promise<AgendaSessionDTO[]> => {
  const rows = await db.query.agenda.findMany({
    where: eq(agenda.eventId, eventId),
    orderBy: [asc(agenda.startTime)],
    with: {
      speaker: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          photoUrl: true,
          company: true,
          jobTitle: true,
        },
      },
      services: {
        columns: {
          serviceId: true,
        },
        with: {
          service: {
            columns: {
              serviceName: true,
            },
          },
        },
      },
      staff: {
        columns: {
          staffId: true,
          sessionRole: true,
        },
        with: {
          staff: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
              photoUrl: true,
            },
          },
        },
      },
    },
  })

  return rows as AgendaSessionDTO[]
})

/**
 * Get single session by ID
 */
export const getSessionById = cache(async (sessionId: string): Promise<AgendaSessionDTO | null> => {
  const session = await db.query.agenda.findFirst({
    where: eq(agenda.id, sessionId),
    with: {
      speaker: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          photoUrl: true,
          company: true,
          jobTitle: true,
        },
      },
      services: {
        columns: {
          serviceId: true,
        },
        with: {
          service: {
            columns: {
              serviceName: true,
            },
          },
        },
      },
      staff: {
        columns: {
          staffId: true,
          sessionRole: true,
        },
        with: {
          staff: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
              photoUrl: true,
            },
          },
        },
      },
    },
  })

  return (session as AgendaSessionDTO) || null
})

/**
 * Get sessions for a specific speaker
 */
export const getSpeakerSessions = cache(async (speakerId: string): Promise<AgendaSessionDTO[]> => {
  const rows = await db.query.agenda.findMany({
    where: eq(agenda.speakerId, speakerId),
    orderBy: [asc(agenda.startTime)],
    with: {
      speaker: {
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          photoUrl: true,
          company: true,
          jobTitle: true,
        },
      },
      services: {
        columns: {
          serviceId: true,
        },
        with: {
          service: {
            columns: {
              serviceName: true,
            },
          },
        },
      },
      staff: {
        columns: {
          staffId: true,
          sessionRole: true,
        },
        with: {
          staff: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
              photoUrl: true,
            },
          },
        },
      },
    },
  })

  return rows as AgendaSessionDTO[]
})
