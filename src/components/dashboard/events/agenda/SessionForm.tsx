'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { createSession, updateSession } from '@/actions/agenda'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import type { AgendaSessionDTO } from '@/lib/dal/agenda'
import { cn } from '@/lib/utils'

// Schema matching the server action validation
const formSchema = z.object({
  title: z.string().min(3, 'Il titolo deve avere almeno 3 caratteri'),
  description: z.string().optional(),
  date: z.date(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato ora non valido'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato ora non valido'),
  sessionType: z.enum([
    'keynote',
    'talk',
    'workshop',
    'panel',
    'break',
    'networking',
    'other',
  ]),
  room: z.string().optional(),
  location: z.string().optional(),
  speakerId: z.string().optional(),
  maxAttendees: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface SessionFormProps {
  eventId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionToEdit?: AgendaSessionDTO | null
  speakers: { id: string; name: string }[]
}

export function SessionForm({
  eventId,
  open,
  onOpenChange,
  sessionToEdit,
  speakers,
}: SessionFormProps) {
  const { toast } = useToast()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: sessionToEdit?.title || '',
      description: sessionToEdit?.description || '',
      date: sessionToEdit ? new Date(sessionToEdit.startTime) : new Date(),
      startTime: sessionToEdit ? format(new Date(sessionToEdit.startTime), 'HH:mm') : '09:00',
      endTime: sessionToEdit ? format(new Date(sessionToEdit.endTime), 'HH:mm') : '10:00',
      sessionType: sessionToEdit?.sessionType || 'talk',
      room: sessionToEdit?.room || '',
      location: sessionToEdit?.location || '',
      speakerId: sessionToEdit?.speakerId || 'none',
      maxAttendees: sessionToEdit?.maxAttendees?.toString() || '',
    },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: FormValues) {
    try {
      // Combine date and time
      const startDateTime = new Date(values.date)
      const [startHour, startMinute] = values.startTime.split(':')
      startDateTime.setHours(Number(startHour), Number(startMinute))

      const endDateTime = new Date(values.date)
      const [endHour, endMinute] = values.endTime.split(':')
      endDateTime.setHours(Number(endHour), Number(endMinute))

      const formData = new FormData()
      formData.append('eventId', eventId)
      formData.append('title', values.title)
      if (values.description) formData.append('description', values.description)
      formData.append('startTime', startDateTime.toISOString())
      formData.append('endTime', endDateTime.toISOString())
      formData.append('sessionType', values.sessionType)
      if (values.room) formData.append('room', values.room)
      if (values.location) formData.append('location', values.location)
      if (values.speakerId && values.speakerId !== 'none') formData.append('speakerId', values.speakerId)
      if (values.maxAttendees) formData.append('maxAttendees', values.maxAttendees)

      let result
      if (sessionToEdit) {
        formData.append('id', sessionToEdit.id)
        formData.append('status', sessionToEdit.status)
        result = await updateSession(null, formData)
      } else {
        result = await createSession(null, formData)
      }

      if (result.error) {
        toast({
          variant: "destructive",
          title: "Errore",
          description: result.error,
        })
        if (result.details) {
          console.error('Validation details:', result.details)
        }
      } else {
        toast({
          title: "Successo",
          description: sessionToEdit ? 'Sessione aggiornata' : 'Sessione creata',
        })
        onOpenChange(false)
        form.reset()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Si è verificato un errore imprevisto",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{sessionToEdit ? 'Modifica Sessione' : 'Nuova Sessione'}</DialogTitle>
          <DialogDescription>
            Inserisci i dettagli della sessione dell'evento.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolo</FormLabel>
                  <FormControl>
                    <Input placeholder="Titolo della sessione" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sessionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="keynote">Keynote</SelectItem>
                        <SelectItem value="talk">Talk</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="panel">Panel</SelectItem>
                        <SelectItem value="break">Pausa</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="other">Altro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="speakerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relatore</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona relatore" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nessuno</SelectItem>
                        {speakers.map((speaker) => (
                          <SelectItem key={speaker.id} value={speaker.id}>
                            {speaker.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: it })
                            ) : (
                              <span>Seleziona data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inizio</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fine</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="room"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sala/Stanza</FormLabel>
                    <FormControl>
                      <Input placeholder="Es. Sala A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxAttendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capienza Max</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Opzionale" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrizione</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Dettagli della sessione..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annulla
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {sessionToEdit ? 'Salva Modifiche' : 'Crea Sessione'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
