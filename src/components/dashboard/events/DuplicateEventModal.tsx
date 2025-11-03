'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { Copy, Loader2, Search } from 'lucide-react'
import { listEventsForDuplicate, duplicateEvent } from '@/app/actions/events'
import { Button } from '@/components/ui/button'

type EventOption = {
  id: string
  title: string
  startDate: Date | string | null
  endDate: Date | string | null
  year: number
}

export function DuplicateEventModal() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [options, setOptions] = useState<EventOption[]>([])
  const [search, setSearch] = useState('')
  const [year, setYear] = useState<number | ''>('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Load options when modal opens or filters change (debounced search)
  useEffect(() => {
    if (!open) return

    const controller = new AbortController()
    const t = setTimeout(() => {
      startTransition(async () => {
        const list = await listEventsForDuplicate({ search, year: typeof year === 'number' ? year : undefined })
        setOptions(list)
      })
    }, 250)

    return () => {
      controller.abort()
      clearTimeout(t)
    }
  }, [open, search, year])

  const years = useMemo(() => {
    const set = new Set<number>()
    for (const o of options) if (o.year) set.add(o.year)
    return Array.from(set).sort((a, b) => b - a)
  }, [options])

  const handleDuplicate = () => {
    if (!selectedId) return
    startTransition(async () => {
      const result = await duplicateEvent(selectedId)
      if (result.success && result.data?.id) {
        window.location.href = `/eventi/${result.data.id}/edit`
      } else {
        alert(result.message)
      }
    })
  }

  return (
    <>
      <Button type="button" variant="default" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setOpen(true)}>
        <Copy className="w-4 h-4 mr-2" /> Duplica evento
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Duplica evento</h3>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700">×</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cerca per nome evento"
                    className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm"
                  />
                </div>
                <select
                  className="border rounded-lg px-3 py-2 text-sm"
                  value={year}
                  onChange={(e) => setYear(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Tutti gli anni</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="max-h-80 overflow-auto border rounded-lg">
                {isPending && options.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-600">Caricamento…</div>
                ) : options.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-600">Nessun evento trovato</div>
                ) : (
                  <ul className="divide-y">
                    {options.map((o) => (
                      <li key={o.id} className="flex items-center justify-between p-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name="eventToDuplicate"
                            value={o.id}
                            checked={selectedId === o.id}
                            onChange={() => setSelectedId(o.id)}
                          />
                          <span className="font-medium">{o.title}</span>
                          <span className="text-xs text-gray-500">({o.year})</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="p-6 border-t flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annulla</Button>
              <Button type="button" onClick={handleDuplicate} disabled={!selectedId || isPending}>
                {isPending ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Duplico…</>) : 'Duplica'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
