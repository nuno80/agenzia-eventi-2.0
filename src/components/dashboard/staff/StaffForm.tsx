'use client'
/**
 * FILE: src/components/dashboard/staff/StaffForm.tsx
 *
 * VERSION: 1.3
 *
 * COMPONENT: StaffForm
 * TYPE: Client Component
 */

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createStaffSchema } from '@/lib/validations/staff'
import { createStaff, updateStaff } from '@/app/actions/staff'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const formSchema = createStaffSchema.extend({
  // Helper field per input testuale di tags (stringa comma-separated)
  tagsText: z.string().optional().nullable(),
})

// IMPORTANT: use the INPUT type for react-hook-form values
// because zodResolver expects schema INPUT (pre-transform) types.
export type StaffFormValues = z.input<typeof formSchema>

interface StaffFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Partial<StaffFormValues & { id?: string; tagsText?: string }>
  onSuccess?: (staffId?: string) => void
}

export function StaffForm({ mode, defaultValues, onSuccess }: StaffFormProps) {
  const [submitting, setSubmitting] = useState(false)

  const initialValues = useMemo<StaffFormValues>(() => {
    const base: StaffFormValues = {
      firstName: defaultValues?.firstName ?? '',
      lastName: defaultValues?.lastName ?? '',
      email: defaultValues?.email ?? '',
      phone: (defaultValues as any)?.phone ?? '',
      photoUrl: (defaultValues as any)?.photoUrl ?? '',
      role: (defaultValues?.role as StaffFormValues['role']) ?? 'hostess',
      specialization: (defaultValues as any)?.specialization ?? '',
      hourlyRate: (defaultValues as any)?.hourlyRate ?? null,
      preferredPaymentMethod: (defaultValues as any)?.preferredPaymentMethod ?? '',
      isActive: (defaultValues as any)?.isActive ?? true,
      // Schema INPUT expects tags as string[] | null | undefined
      // We use tagsText for UI, so leave tags undefined by default
      tags: Array.isArray((defaultValues as any)?.tags) ? ((defaultValues as any).tags as string[]) : undefined,
      notes: (defaultValues as any)?.notes ?? '',
      tagsText: Array.isArray((defaultValues as any)?.tags)
        ? ((defaultValues as any).tags as string[]).join(', ')
        : (defaultValues as any)?.tagsText ?? '',
    }
    return base
  }, [defaultValues])

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
    mode: 'onSubmit',
  })

  async function onSubmit(values: StaffFormValues) {
    setSubmitting(true)
    try {
      // Prepara FormData per server action
      const fd = new FormData()
      Object.entries(values).forEach(([key, val]) => {
        if (key === 'tagsText') return
        if (val === undefined) return
        if (val === null) return
        if (Array.isArray(val)) {
          fd.append(key, JSON.stringify(val))
        } else {
          fd.append(key, String(val))
        }
      })
      // Se tagsText presente e non abbiamo già un array tags, convertilo e append come tags
      if (values.tagsText && !(Array.isArray(values.tags) && values.tags.length)) {
        const arr = values.tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
        if (arr.length) fd.set('tags', JSON.stringify(arr))
      }

      let result
      if (mode === 'create') {
        result = await createStaff(fd)
      } else {
        const id = (defaultValues as { id?: string } | undefined)?.id
        if (!id) {
          form.setError('root', { type: 'manual', message: 'ID non presente per aggiornamento' })
          return
        }
        result = await updateStaff(id, fd)
      }

      if (result?.success) {
        onSuccess?.((result.data as any)?.id)
      } else if (result?.errors) {
        // Mappa errori Zod sui campi
        const errs = result.errors
        Object.entries(errs).forEach(([name, messages]) => {
          const msg = messages?.[0] ?? 'Campo non valido'
          // @ts-expect-error name proviene da backend, si assume corrisponda ai campi
          form.setError(name, { message: msg })
        })
      } else if (result?.message) {
        form.setError('root', { type: 'manual', message: result.message })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Es. Mario" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cognome</FormLabel>
                <FormControl>
                  <Input placeholder="Es. Rossi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="mario.rossi@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefono</FormLabel>
                <FormControl>
                  <Input placeholder="+39 ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ruolo</FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona ruolo" />
                    </SelectTrigger>
                    <SelectContent>
                      {['hostess','steward','driver','av_tech','photographer','videographer','security','catering','cleaning','other'].map((r) => (
                        <SelectItem key={r} value={r}>
                          {r.replace('_',' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specialization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specializzazione</FormLabel>
                <FormControl>
                  <Input placeholder="Es. Audio, accrediti, ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tariffa oraria (€)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Es. 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredPaymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metodo di pagamento preferito</FormLabel>
                <FormControl>
                  <Input placeholder="Es. Bonifico, contanti, ..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="photoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Foto URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="tagsText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tag (separati da virgola)</FormLabel>
                <FormControl>
                  <Input placeholder="es. inglese, audio, vip" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stato</FormLabel>
                <FormControl>
                  <Select value={String(field.value)} onValueChange={(v) => field.onChange(v === 'true')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Attivo</SelectItem>
                      <SelectItem value="false">Inattivo</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <textarea className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-28" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root?.message && (
          <div className="text-sm text-red-600">{form.formState.errors.root.message}</div>
        )}

        <div className="flex items-center justify-end gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Salvataggio…' : mode === 'create' ? 'Crea' : 'Salva modifiche'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
