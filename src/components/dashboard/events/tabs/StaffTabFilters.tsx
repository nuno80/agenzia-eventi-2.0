'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toRoleLabel } from '@/lib/utils'

export function StaffTabFilters({ roles }: { roles: string[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const role = sp.get('role') || ''
  const astatus = sp.get('astatus') || ''
  const pstatus = sp.get('pstatus') || ''

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <select
        className="border rounded px-3 py-2 text-sm"
        value={role}
        onChange={(e) => update('role', e.target.value)}
      >
        <option value="">Tutti i ruoli</option>
        {roles.map((r) => (
          <option key={r} value={r}>
            {toRoleLabel(r)}
          </option>
        ))}
      </select>

      <select
        className="border rounded px-3 py-2 text-sm"
        value={astatus}
        onChange={(e) => update('astatus', e.target.value)}
      >
        <option value="">Tutti gli stati</option>
        <option value="requested">Richiesta</option>
        <option value="confirmed">Confermato</option>
        <option value="declined">Rifiutato</option>
        <option value="completed">Completato</option>
        <option value="cancelled">Annullato</option>
      </select>

      <select
        className="border rounded px-3 py-2 text-sm"
        value={pstatus}
        onChange={(e) => update('pstatus', e.target.value)}
      >
        <option value="">Tutti i pagamenti</option>
        <option value="paid">Pagato</option>
        <option value="pending">Da pagare</option>
        <option value="overdue">Scaduto</option>
        <option value="not_due">Pagamento da verificare</option>
      </select>
    </div>
  )
}
