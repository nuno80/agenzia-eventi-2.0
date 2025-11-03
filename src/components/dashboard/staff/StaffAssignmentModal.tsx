'use client'

/**
 * FILE: src/components/dashboard/staff/StaffAssignmentModal.tsx
 * VERSION: 1.3
 * COMPONENT: StaffAssignmentModal (Client)
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarClock, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createAssignment } from '@/app/actions/staff-assignments'
import { Button } from '@/components/ui/button'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { assignmentStatusEnum, paymentTermsEnum } from '@/lib/validations/staff-assignments'

const uiSchema = z
  .object({
    eventId: z.string().min(1),
    staffId: z.string().min(1),
    startTime: z.string().min(1),
    endTime: z.string().min(1),
    assignmentStatus: assignmentStatusEnum,
    paymentAmount: z.union([z.string(), z.literal('')]).nullable(),
    paymentTerms: paymentTermsEnum,
    paymentDueDate: z.string().nullable().optional(),
    paymentNotes: z.string().nullable().optional(),
    invoiceNumber: z.string().nullable().optional(),
    invoiceUrl: z.string().nullable().optional(),
  })
  .refine((d) => new Date(d.endTime).getTime() >= new Date(d.startTime).getTime(), {
    message: 'La data di fine deve essere successiva alla data di inizio',
    path: ['endTime'],
  })

type FormValues = z.infer<typeof uiSchema>

interface StaffAssignmentModalProps {
  staff: { id: string; firstName: string; lastName: string; role: string }
  events: { id: string; title: string; startDate?: Date | string; endDate?: Date | string }[]
  defaultEventId?: string
  triggerVariant?: 'link' | 'button'
}

export function StaffAssignmentModal({
  staff,
  events,
  defaultEventId,
  triggerVariant = 'link',
}: StaffAssignmentModalProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const eventOptions = useMemo(() => events.map((e) => ({ id: e.id, label: e.title })), [events])

  const form = useForm<FormValues>({
    resolver: zodResolver(uiSchema),
    defaultValues: {
      eventId: defaultEventId ?? (eventOptions[0]?.id || ''),
      staffId: staff.id,
      startTime: '',
      endTime: '',
      assignmentStatus: 'requested',
      paymentAmount: '',
      paymentTerms: 'custom',
      paymentDueDate: null,
      paymentNotes: null,
      invoiceNumber: null,
      invoiceUrl: null,
    },
    mode: 'onBlur',
  })

  async function onSubmit(values: FormValues) {
    try {
      setSubmitting(true)

      const parsedAmount =
        values.paymentAmount === '' || values.paymentAmount === null
          ? null
          : Number.isNaN(Number.parseFloat(values.paymentAmount as string))
            ? null
            : Number.parseFloat(values.paymentAmount as string)

      const payload: Record<string, unknown> = {
        eventId: values.eventId,
        staffId: values.staffId,
        startTime: values.startTime ? new Date(values.startTime) : new Date(),
        endTime: values.endTime ? new Date(values.endTime) : new Date(),
        assignmentStatus: values.assignmentStatus,
        paymentAmount: parsedAmount,
        paymentTerms: values.paymentTerms,
        paymentDueDate: values.paymentDueDate ? new Date(values.paymentDueDate) : null,
        paymentNotes: values.paymentNotes ?? null,
        invoiceNumber: values.invoiceNumber ?? null,
        invoiceUrl: values.invoiceUrl ?? null,
      }

      const res = await createAssignment(payload)
      if (res.success) {
        toast({ title: 'Assegnazione creata', description: res.message })
        setOpen(false)
        form.reset()
      } else {
        toast({ title: 'Errore', description: res.message })
        if (res.errors) {
          Object.entries(res.errors).forEach(([name, msgs]) => {
            form.setError(name as keyof FormValues, { message: msgs?.[0] || 'Campo non valido' })
          })
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const Trigger = (
    <Button
      type="button"
      variant={triggerVariant === 'link' ? 'link' : 'default'}
      className={triggerVariant === 'link' ? 'text-blue-600 hover:text-blue-700' : ''}
      onClick={() => setOpen(true)}
    >
      <CalendarClock className="w-4 h-4" />
      <span>Assegna a evento</span>
    </Button>
  )

  return (
    <>
      {Trigger}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Chiudi modale"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Nuova assegnazione</h2>
              <p className="text-sm text-gray-600">
                {staff.lastName} {staff.firstName} • {staff.role.replace('_', ' ')}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="eventId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evento</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona evento" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventOptions.map((e) => (
                              <SelectItem key={e.id} value={e.id}>
                                {e.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inizio</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
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
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="assignmentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status assegnazione</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="requested">Richiesta</SelectItem>
                            <SelectItem value="confirmed">Confermata</SelectItem>
                            <SelectItem value="declined">Rifiutata</SelectItem>
                            <SelectItem value="completed">Completata</SelectItem>
                            <SelectItem value="cancelled">Cancellata</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Importo pagamento (EUR)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Es. 150.00"
                            value={field.value ?? ''}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Termini pagamento</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="custom">Personalizzato</SelectItem>
                              <SelectItem value="immediate">Immediato</SelectItem>
                              <SelectItem value="30_days">30 giorni</SelectItem>
                              <SelectItem value="60_days">60 giorni</SelectItem>
                              <SelectItem value="90_days">90 giorni</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch('paymentTerms') === 'custom' && (
                  <FormField
                    control={form.control}
                    name="paymentDueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scadenza pagamento</FormLabel>
                        <FormControl>
                          <Input type="date" value={field.value ?? ''} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numero fattura (opz.)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Es. 2025-INV-001"
                            value={field.value ?? ''}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="invoiceUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL fattura (opz.)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://..."
                            value={field.value ?? ''}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={submitting}
                  >
                    Annulla
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Salvataggio…</span>
                      </>
                    ) : (
                      <span>Salva assegnazione</span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </>
  )
}

export default StaffAssignmentModal
