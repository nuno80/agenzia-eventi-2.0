'use client'

import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import type { AgendaSessionDTO } from '@/lib/dal/agenda'
import { SessionCard } from './SessionCard'
import { SessionForm } from './SessionForm'

interface AgendaTimelineProps {
  eventId: string
  sessions: AgendaSessionDTO[]
  speakers: { id: string; name: string }[]
}

// Sortable wrapper for SessionCard
function SortableSessionItem({
  session,
  onEdit,
}: {
  session: AgendaSessionDTO
  onEdit: (session: AgendaSessionDTO) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: session.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-4">
      <SessionCard session={session} onEdit={onEdit} />
    </div>
  )
}

export function AgendaTimeline({ eventId, sessions, speakers }: AgendaTimelineProps) {
  const [items, setItems] = useState<AgendaSessionDTO[]>(sessions)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<AgendaSessionDTO | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    setItems(sessions)
  }, [sessions])

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, AgendaSessionDTO[]> = {}
    items.forEach((session) => {
      const dateKey = format(new Date(session.startTime), 'yyyy-MM-dd')
      if (!grouped[dateKey]) grouped[dateKey] = []
      grouped[dateKey].push(session)
    })
    return grouped
  }, [items])

  const sortedDates = Object.keys(sessionsByDate).sort()

  // Sensors for drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
    setActiveId(null)
  }

  const handleCreate = () => {
    setEditingSession(null)
    setIsFormOpen(true)
  }

  const handleEdit = (session: AgendaSessionDTO) => {
    setEditingSession(session)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Programma</h2>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Aggiungi Sessione
        </Button>
      </div>

      {sortedDates.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed bg-gray-50 text-gray-500">
          <p>Nessuna sessione programmata</p>
          <Button variant="link" onClick={handleCreate}>
            Inizia aggiungendo una sessione
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {sortedDates.map((date) => (
            <div key={date} className="space-y-4">
              <div className="sticky top-0 z-10 bg-white py-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {format(new Date(date), 'EEEE d MMMM yyyy', { locale: it })}
                </h3>
              </div>

              <SortableContext
                items={sessionsByDate[date].map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {sessionsByDate[date].map((session) => (
                    <SortableSessionItem key={session.id} session={session} onEdit={handleEdit} />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}

          <DragOverlay>
            {activeId ? (
              <SessionCard session={sessions.find((s) => s.id === activeId)!} onEdit={() => {}} />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <SessionForm
        eventId={eventId}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        sessionToEdit={editingSession}
        speakers={speakers}
      />
    </div>
  )
}
