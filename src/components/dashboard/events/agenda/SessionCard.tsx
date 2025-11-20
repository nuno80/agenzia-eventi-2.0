'use client'

import { format } from 'date-fns'
import { Clock, MapPin, MoreVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { deleteSession } from '@/actions/agenda'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import type { AgendaSessionDTO } from '@/lib/dal/agenda'
import { cn } from '@/lib/utils'

interface SessionCardProps {
  session: AgendaSessionDTO
  onEdit: (session: AgendaSessionDTO) => void
}

const typeColors: Record<string, string> = {
  keynote: 'bg-purple-100 text-purple-800 border-purple-200',
  talk: 'bg-blue-100 text-blue-800 border-blue-200',
  workshop: 'bg-orange-100 text-orange-800 border-orange-200',
  panel: 'bg-green-100 text-green-800 border-green-200',
  break: 'bg-gray-100 text-gray-800 border-gray-200',
  networking: 'bg-pink-100 text-pink-800 border-pink-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200',
}

const typeLabels: Record<string, string> = {
  keynote: 'Keynote',
  talk: 'Talk',
  workshop: 'Workshop',
  panel: 'Panel',
  break: 'Pausa',
  networking: 'Networking',
  other: 'Altro',
}

export function SessionCard({ session, onEdit }: SessionCardProps) {
  const [_isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questa sessione?')) return

    setIsDeleting(true)
    try {
      const result = await deleteSession(session.id, session.eventId)
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Errore',
          description: result.error,
        })
      } else {
        toast({
          title: 'Successo',
          description: 'Sessione eliminata',
        })
      }
    } catch (_error) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: "Errore durante l'eliminazione",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="group relative flex gap-4 rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
      {/* Time Column */}
      <div className="flex w-24 flex-col items-center justify-center border-r pr-4 text-center">
        <div className="text-lg font-bold text-gray-900">
          {format(new Date(session.startTime), 'HH:mm')}
        </div>
        <div className="text-xs text-gray-500">{format(new Date(session.endTime), 'HH:mm')}</div>
        <div className="mt-2 flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
          <Clock className="h-3 w-3" />
          {session.duration}m
        </div>
      </div>

      {/* Content Column */}
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Badge
              variant="outline"
              className={cn('mb-2 border', typeColors[session.sessionType] || typeColors.other)}
            >
              {typeLabels[session.sessionType] || session.sessionType}
            </Badge>
            <h3 className="font-semibold text-gray-900">{session.title}</h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(session)}>Modifica</DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {session.description && (
          <p className="line-clamp-2 text-sm text-gray-600">{session.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-gray-600">
          {session.room && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{session.room}</span>
            </div>
          )}

          {session.speaker && (
            <div className="flex items-center gap-2 rounded-full bg-gray-50 pl-1 pr-3 py-1 border">
              <Avatar className="h-5 w-5">
                <AvatarImage src={session.speaker.photoUrl || undefined} />
                <AvatarFallback className="text-[10px]">
                  {session.speaker.firstName[0]}
                  {session.speaker.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">
                {session.speaker.firstName} {session.speaker.lastName}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
