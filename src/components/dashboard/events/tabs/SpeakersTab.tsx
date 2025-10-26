// ============================================================================
// SPEAKERS TAB COMPONENT
// ============================================================================
// FILE: src/components/dashboard/events/tabs/SpeakersTab.tsx
//
// PURPOSE: Display and manage speakers for an event
// FEATURES:
// - List of speakers with key information
// - Add, edit, delete speakers
// - Speaker details with bio and session info
// ============================================================================

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Mail, Phone, Globe, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Mock data for speakers - in a real app, this would come from an API call
type Speaker = {
  id: string
  name: string
  role: string
  organization: string
  bio: string
  email: string
  phone?: string
  website?: string
  imageUrl?: string
  sessions?: { title: string; time: string }[]
}

type SpeakersTabProps = {
  eventId: string
}

export function SpeakersTab({ eventId }: SpeakersTabProps) {
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Mock data - in a real app, this would be fetched from an API
  const [speakers, setSpeakers] = useState<Speaker[]>([
    {
      id: '1',
      name: 'Prof. Alessandro Bianchi',
      role: 'Primario di Cardiologia',
      organization: 'Ospedale San Raffaele, Milano',
      bio: 'Il Prof. Bianchi è un cardiologo di fama internazionale con oltre 20 anni di esperienza clinica e di ricerca. Ha pubblicato più di 100 articoli scientifici ed è specializzato in cardiologia interventistica.',
      email: 'alessandro.bianchi@sanraffaele.it',
      phone: '+39 02 1234 5678',
      website: 'www.alessandrobianchi.it',
      imageUrl: '/images/speakers/alessandro-bianchi.jpg',
      sessions: [
        { title: 'Innovazioni nella cardiologia interventistica', time: '10:00 - 11:30' },
        { title: 'Panel: Il futuro della cardiologia', time: '15:00 - 16:30' },
      ],
    },
    {
      id: '2',
      name: 'Dott.ssa Maria Rossi',
      role: 'Direttore Ricerca Clinica',
      organization: 'Istituto Nazionale Tumori, Roma',
      bio: 'La Dott.ssa Rossi è una ricercatrice oncologica con focus sulle terapie innovative per i tumori del sistema nervoso. Ha coordinato numerosi trial clinici internazionali.',
      email: 'maria.rossi@int.it',
      phone: '+39 06 8765 4321',
      sessions: [{ title: 'Terapie personalizzate in oncologia', time: '14:00 - 15:30' }],
    },
  ])

  // Handle adding a new speaker
  const handleAddSpeaker = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // In a real app, this would be a server action or API call
    const newSpeaker: Speaker = {
      id: `${speakers.length + 1}`,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      organization: formData.get('organization') as string,
      bio: formData.get('bio') as string,
      email: formData.get('email') as string,
      phone: (formData.get('phone') as string) || undefined,
      website: (formData.get('website') as string) || undefined,
    }

    setSpeakers([...speakers, newSpeaker])
    setIsAddDialogOpen(false)

    toast({
      title: 'Relatore aggiunto',
      description: `${newSpeaker.name} è stato aggiunto come relatore.`,
    })
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Relatori</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Relatore
        </Button>
      </div>

      {speakers.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-gray-50">
          <p className="text-gray-500">Nessun relatore aggiunto per questo evento.</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi il primo relatore
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {speakers.map((speaker) => (
            <Card key={speaker.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    {speaker.imageUrl && <AvatarImage src={speaker.imageUrl} alt={speaker.name} />}
                    <AvatarFallback>{getInitials(speaker.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{speaker.name}</CardTitle>
                    <CardDescription>{speaker.role}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Azioni</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil className="h-4 w-4 mr-2" /> Modifica
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" /> Rimuovi
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-700 mb-2">{speaker.organization}</p>
                <p className="text-sm text-gray-600 line-clamp-3">{speaker.bio}</p>

                {speaker.sessions && speaker.sessions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Sessioni</h4>
                    <ul className="space-y-1">
                      {speaker.sessions.map((session, index) => (
                        <li key={index} className="text-sm">
                          <span className="font-medium">{session.title}</span>
                          <span className="text-gray-500"> - {session.time}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 flex flex-wrap gap-3">
                <Button variant="outline" size="sm" className="h-8">
                  <Mail className="h-3.5 w-3.5 mr-1" />
                  {speaker.email}
                </Button>
                {speaker.phone && (
                  <Button variant="outline" size="sm" className="h-8">
                    <Phone className="h-3.5 w-3.5 mr-1" />
                    {speaker.phone}
                  </Button>
                )}
                {speaker.website && (
                  <Button variant="outline" size="sm" className="h-8">
                    <Globe className="h-3.5 w-3.5 mr-1" />
                    {speaker.website}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Speaker Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aggiungi Relatore</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli del relatore per questo evento.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSpeaker}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" name="name" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Ruolo</Label>
                <Input id="role" name="role" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="organization">Organizzazione</Label>
                <Input id="organization" name="organization" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea id="bio" name="bio" rows={3} required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Telefono</Label>
                <Input id="phone" name="phone" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">Sito web</Label>
                <Input id="website" name="website" />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annulla
              </Button>
              <Button type="submit">Aggiungi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
