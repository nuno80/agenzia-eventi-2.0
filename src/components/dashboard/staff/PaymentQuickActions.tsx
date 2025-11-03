'use client'

/**
 * FILE: src/components/dashboard/staff/PaymentQuickActions.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: PaymentQuickActions
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Triggera Server Actions (markPaid, postponePayment)
 * - Gestisce stato UI e input utente
 */

import { CalendarClock, CheckCircle2, XCircle } from 'lucide-react'
import { useState, useTransition } from 'react'
import { cancelPayment, markPaid, postponePayment } from '@/app/actions/staff-assignments'
import { Button } from '@/components/ui/button'

interface Props {
  assignmentId: string
  currentDueDate?: Date | string | null
  isPaid?: boolean
  compact?: boolean
}

export function PaymentQuickActions({ assignmentId, currentDueDate, isPaid = false, compact = true }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showPostpone, setShowPostpone] = useState(false)
  const [newDueDate, setNewDueDate] = useState<string>(
    currentDueDate ? new Date(currentDueDate).toISOString().slice(0, 10) : ''
  )
  const [reason, setReason] = useState('')

  const handleMarkPaid = () => {
    startTransition(async () => {
      await markPaid({ assignmentId, paymentDate: new Date(), paymentNotes: undefined })
    })
  }

  const handlePostpone = () => {
    if (!newDueDate) return
    startTransition(async () => {
      await postponePayment({ assignmentId, newDueDate: new Date(newDueDate), reason })
      setShowPostpone(false)
      setReason('')
    })
  }

  return (
    <div className={compact ? 'flex items-center gap-2' : 'space-y-2'}>
      {isPaid ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700"
          onClick={() =>
            startTransition(async () => {
              await cancelPayment({ assignmentId, reason: undefined })
            })
          }
          disabled={isPending}
        >
          <XCircle className="w-4 h-4 mr-1" />
          <span className="sr-only sm:not-sr-only">Cancella pagamento</span>
        </Button>
      ) : (
        <>
          <Button type="button" variant="ghost" size="sm" onClick={handleMarkPaid} disabled={isPending}>
            <CheckCircle2 className="w-4 h-4 mr-1 text-green-600" />
            <span className="sr-only sm:not-sr-only">Segna pagato</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPostpone((v) => !v)}
            disabled={isPending}
          >
            <CalendarClock className="w-4 h-4 mr-1 text-blue-600" />
            <span className="sr-only sm:not-sr-only">Posticipa</span>
          </Button>

          {showPostpone && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-xs"
              />
              <input
                type="text"
                placeholder="Motivo (opzionale)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 text-xs"
              />
              <Button type="button" size="sm" onClick={handlePostpone} disabled={isPending || !newDueDate}>
                Conferma
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
