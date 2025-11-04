/**
 * FILE: src/components/dashboard/staff/PaymentStatusBadge.tsx
 *
 * VERSION: 1.0
 *
 * COMPONENT: PaymentStatusBadge
 * TYPE: Server Component
 *
 * WHY SERVER:
 * - Presentational only; calcoli puri lato server
 * - Nessuno stato/effetto client
 *
 * PROPS:
 * - paymentTerms: 'custom' | 'immediate' | '30_days' | '60_days' | '90_days'
 * - paymentDueDate: Date | string | null
 * - paymentDate: Date | string | null
 * - assignmentStatus: 'requested' | 'confirmed' | 'declined' | 'completed' | 'cancelled'
 * - endTime: Date | string // usato per calcolare la dueDate quando non è custom
 * - className?: string
 * - showIcon?: boolean (default true)
 * - showTooltip?: boolean (default true)
 *
 * FEATURES:
 * - Colori coerenti per stati: paid (verde), pending (giallo/blu), overdue (rosso), not_due (grigio)
 * - Testo contestuale: label + giorni residui o info scadenza
 * - Usa util di pagamento centralizzate (utils.ts)
 */

import { CheckCircle2, Clock, Hourglass, MinusCircle } from 'lucide-react'
import type { AssignmentStatus, PaymentTerms } from '@/lib/utils'
import {
  calculatePaymentDueDate,
  calculatePaymentStatus,
  cn,
  formatDate,
  formatDaysUntil,
} from '@/lib/utils'

export type PaymentState = 'not_due' | 'pending' | 'overdue' | 'paid'

interface Props {
  paymentTerms: 'custom' | PaymentTerms
  paymentDueDate: Date | string | null
  paymentDate: Date | string | null
  assignmentStatus: AssignmentStatus
  endTime: Date | string
  className?: string
  showIcon?: boolean
  showTooltip?: boolean
}

function getColors(state: PaymentState) {
  switch (state) {
    case 'paid':
      return { bg: 'bg-green-100', text: 'text-green-700', ring: 'ring-green-200' }
    case 'overdue':
      return { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-200' }
    case 'pending':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'ring-yellow-200' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', ring: 'ring-gray-200' }
  }
}

export function PaymentStatusBadge({
  paymentTerms,
  paymentDueDate,
  paymentDate,
  assignmentStatus,
  endTime,
  className,
  showIcon = true,
  showTooltip = true,
}: Props) {
  // Normalizza date
  const dueDate: Date | null = (() => {
    if (paymentTerms === 'custom') {
      return paymentDueDate ? new Date(paymentDueDate) : null
    }
    return calculatePaymentDueDate(new Date(endTime), paymentTerms)
  })()

  const paidAt = paymentDate ? new Date(paymentDate) : null
  const state = calculatePaymentStatus(dueDate, paidAt, assignmentStatus)
  const colors = getColors(state)

  const Icon =
    state === 'paid'
      ? CheckCircle2
      : state === 'overdue'
        ? MinusCircle
        : state === 'pending'
          ? Hourglass
          : Clock

  // Tooltip/secondary text
  let secondary: string | null = null
  if (state === 'paid' && paidAt) secondary = `Pagato il ${formatDate(paidAt)}`
  else if (state === 'pending' && dueDate)
    secondary = `Scadenza ${formatDate(dueDate)} · ${formatDaysUntil(dueDate)}`
  else if (state === 'overdue' && dueDate) secondary = `Scaduto ${formatDaysUntil(dueDate)}`

  const labelMap: Record<PaymentState, string> = {
    paid: 'Pagato',
    pending: 'Da pagare',
    overdue: 'Scaduto',
    not_due: 'Pagamento da verificare',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ring-1',
        colors.bg,
        colors.text,
        colors.ring,
        className
      )}
      title={showTooltip && secondary ? secondary : undefined}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      <span>{labelMap[state]}</span>
      {secondary && <span className="hidden sm:inline text-[11px] opacity-80">{secondary}</span>}
    </span>
  )
}
