// ============================================================================
// EVENT FORM COMPONENT
// ============================================================================
// FILE: src/components/dashboard/events/EventForm.tsx
//
// PURPOSE: Form for creating and editing events
// FEATURES:
// - Form validation with Zod
// - Date pickers
// - Form submission handling
// - Error handling and feedback
// ============================================================================

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createEvent, updateEvent } from '@/app/actions/events'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import type { Event } from '@/db/libsql-schemas/events'

// Define the form schema using Zod
const eventFormSchema = z.object({
  name: z.string().min(3, { message: 'Il nome deve contenere almeno 3 caratteri' }),
  type: z.enum(['congresso_medico', 'conferenza_aziendale', 'workshop', 'fiera'], {
    message: 'Seleziona un tipo di evento',
  }),
  description: z.string().optional(),
  location: z.string().min(1, { message: 'Inserisci la location' }),
  startDate: z.date({
    message: 'Seleziona una data di inizio',
  }),
  endDate: z.date(),
  capacity: z.number().int().positive(),
  budget: z.number().nonnegative(),
  status: z.enum(['draft', 'upcoming', 'active', 'completed', 'cancelled'], {
    message: 'Seleziona uno stato',
  }),
})

type EventFormValues = z.infer<typeof eventFormSchema>

type EventFormProps = {
  event?: Event
  isEditing?: boolean
}

export function EventForm({ event, isEditing = false }: EventFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Define default values for the form
  const defaultValues: Partial<EventFormValues> = {
    name: event?.name || '',
    type: event?.type || 'conferenza_aziendale',
    description: event?.description || '',
    location: event?.location || '',
    startDate: event?.startDate ? new Date(event.startDate) : undefined,
    endDate: event?.endDate ? new Date(event.endDate) : undefined,
    capacity: event?.capacity,
    budget: event?.budget,
    status: event?.status as 'draft' | 'upcoming' | 'active' | 'completed' | 'cancelled' || 'draft',
  }

  // Initialize the form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
  })

  // Initialize dates after component mounts to avoid Next.js 16 error
  useEffect(() => {
    if (!initialized) {
      // Set default dates if they're not already set
      if (!form.getValues('startDate')) {
        form.setValue('startDate', new Date())
      }
      if (!form.getValues('endDate')) {
        form.setValue('endDate', new Date(new Date().setDate(new Date().getDate() + 1)))
      }
      if (!form.getValues('capacity')) {
        form.setValue('capacity', 100)
      }
      if (form.getValues('budget') === undefined) {
        form.setValue('budget', 0)
      }
      setInitialized(true)
    }
  }, [initialized, form])

  // Handle form submission
  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true)

    try {
      if (isEditing && event) {
        // Update existing event
        await updateEvent({
          id: event.id,
          ...data,
        })

        toast({
          title: 'Evento aggiornato',
          description: "L'evento è stato aggiornato con successo.",
        })
      } else {
        // Create new event
        await createEvent(data)

        toast({
          title: 'Evento creato',
          description: "L'evento è stato creato con successo.",
        })
      }

      // Redirect to events list
      router.push('/eventi')
      router.refresh()
    } catch (error) {
      console.error('Error submitting event form:', error)

      toast({
        title: 'Errore',
        description: "Si è verificato un errore durante il salvataggio dell'evento.",
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome evento*</FormLabel>
                <FormControl>
                  <Input placeholder="Inserisci il nome dell'evento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Event Type */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo evento*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="congresso_medico">Congresso Medico</SelectItem>
                    <SelectItem value="conferenza_aziendale">Conferenza Aziendale</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="fiera">Fiera</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Event Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel>Descrizione</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Inserisci una descrizione dell'evento"
                    className="min-h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Event Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Luogo</FormLabel>
                <FormControl>
                  <Input placeholder="Inserisci il luogo dell'evento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Event Start Date */}
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data inizio*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={'outline'} className={'w-full pl-3 text-left font-normal'}>
                        {field.value ? format(field.value, 'PPP') : <span>Seleziona una data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Event End Date */}
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data fine</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={'outline'} className={'w-full pl-3 text-left font-normal'}>
                        {field.value ? format(field.value, 'PPP') : <span>Seleziona una data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < (form.watch('startDate') || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Opzionale. Se l'evento dura un solo giorno, lascia vuoto.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Event Capacity */}
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacità</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Numero massimo di partecipanti"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value !== '' ? parseInt(e.target.value) : 0)
                    }
                  />
                </FormControl>
                <FormDescription>Lascia vuoto per capacità illimitata.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Event Budget */}
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Budget in €"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value !== '' ? parseFloat(e.target.value) : 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Event Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stato*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona uno stato" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Bozza</SelectItem>
                    <SelectItem value="upcoming">In Arrivo</SelectItem>
                    <SelectItem value="active">Attivo</SelectItem>
                    <SelectItem value="completed">Completato</SelectItem>
                    <SelectItem value="cancelled">Annullato</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Annulla
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvataggio...' : isEditing ? 'Aggiorna evento' : 'Crea evento'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
