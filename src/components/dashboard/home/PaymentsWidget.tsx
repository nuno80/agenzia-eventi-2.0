/**
 * FILE: src/components/dashboard/home/PaymentsWidget.tsx
 * COMPONENT: PaymentsWidget
 * TYPE: Server Component
 */

import { AlertTriangle, CheckCircle, Clock, Wallet } from 'lucide-react'
import { getPaymentStats } from '@/lib/dal/staff-assignments'

export async function PaymentsWidget() {
  const stats = await getPaymentStats()

  const items = [
    {
      label: 'Pagati',
      value: stats.paid,
      icon: CheckCircle,
      bg: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-700',
    },
    {
      label: 'In pagamento',
      value: stats.pending,
      icon: Wallet,
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-700',
    },
    {
      label: 'In scadenza (< 30g)',
      value: stats.dueSoon,
      icon: Clock,
      bg: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-700',
    },
    {
      label: 'Scaduti',
      value: stats.overdue,
      icon: AlertTriangle,
      bg: 'bg-red-50',
      iconColor: 'text-red-600',
      textColor: 'text-red-700',
    },
  ] as const

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Pagamenti Staff</h2>
        <a href="/persone/staff" className="text-sm text-blue-600 hover:text-blue-700">
          Vedi dettagli
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-lg border border-gray-100 p-4">
              <div
                className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center mb-3`}
              >
                <Icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
              <div className={`text-sm font-medium ${item.textColor}`}>{item.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
