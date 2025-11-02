"use client"

/**
 * FILE: src/components/dashboard/staff/StaffAssignmentModal.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: StaffAssignmentModal
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Gestisce stato di apertura/chiusura modale
 * - Gestisce form interattivo con react-hook-form
 * - Invoca Server Action (createAssignment) e mostra toast
 *
 * PROPS:
 * - staff: { id: string; firstName: string; lastName: string; role: string }
 * - events: { id: string; title: string; startDate?: Date | string; endDate?: Date | string }[]
 * - defaultEventId?: string
 */

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarClock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from '@/components/ui/use-toast'
import { createAssignment } from '@/app/actions/staff-assignments'
import {
  createStaffAssignmentSchema,
  type CreateStaffAssignmentInput,
} from '@/lib/validations/staff-assignments'

// Local form shape for RHF. We'll coerce string -> Date where needed on submit.
// We reuse Zod schema via resolver but allow strings for datetime inputs.

type FormValues = Omit<CreateStaffAssignmentInput, 'startTime' | 'endTime' | 'paymentDueDate'> & {
  startTime: string
  endTime: string
  paymentDueDate?: string | null
}

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

  const eventOptions = useMemo(
    () => events.map((e) => ({ id: e.id, label: e.title })),
    [events]
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(createStaffAssignmentSchema),
    defaultValues: {
      eventId: defaultEventId ?? (eventOptions[0]?.id || ''),
      staffId: staff.id,
      startTime: '',
      endTime: '',
      assignmentStatus: 'requested',
      paymentAmount: null,
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

      // Coercions for server action schema
      const payload: Record<string, unknown> = {
        ...values,
        startTime: values.startTime ? new Date(values.startTime) : new Date(),
        endTime: values.endTime ? new Date(values.endTime) : new Date(),
        paymentDueDate: values.paymentDueDate ? new Date(values.paymentDueDate) : null,
        // Ensure numbers
        paymentAmount:
          typeof values.paymentAmount === 'string'
            ? Number.parseFloat(values.paymentAmount as unknown as string)
            : values.paymentAmount ?? null,
      }

      const res = await createAssignment(payload)
      if (res.success) {
        toast({ title: 'Assegnazione creata', description: res.message })
        setOpen(false)
        form.reset()
      } else {
        toast({
          title: 'Errore',
          description: res.message,
          // @ts-expect-error toast supports variant via classNames; keeping simple
        })
        if (res.errors) {
          // Map first error per field into form
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
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Nuova assegnazione</h2>
              <p className="text-sm text-gray-600">
                {staff.lastName} {staff.firstName} • {staff.role.replace('_', ' ')}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Evento */}
                <FormField
                  control={form.control}
                  name={"eventId" as any}
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

                {/* Date/ora inizio-fine */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={"startTime" as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inizio</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={"endTime" as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fine</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Status assegnazione */}
                <FormField
                  control={form.control}
                  name={"assignmentStatus" as any}
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

                {/* Pagamento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={"paymentAmount" as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Importo pagamento (EUR)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Es. 150.00"
                            value={field.value as unknown as string}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={"paymentTerms" as any}
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

                {/* Scadenza pagamento (visibile se custom) */}
                {form.watch('paymentTerms') === 'custom' && (
                  <FormField
                    control={form.control}
                    name={"paymentDueDate" as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scadenza pagamento</FormLabel>
                        <FormControl>
                          <Input type="date" value={(field.value as string | null) ?? ''} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Note fattura */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={"invoiceNumber" as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numero fattura (opz.)</FormLabel>
                        <FormControl>
                          <Input placeholder="Es. 2025-INV-001" value={(field.value as string | null) ?? ''} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={"invoiceUrl" as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL fattura (opz.)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." value={(field.value as string | null) ?? ''} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                    Annulla
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Salvataggio  a</span>
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
