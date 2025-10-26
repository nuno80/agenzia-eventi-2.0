// ============================================================================
// EVENT FILTERS COMPONENT
// ============================================================================
// FILE: src/components/dashboard/events/EventFilters.tsx
//
// PURPOSE: Component to filter events by various criteria
// FEATURES:
// - Search by name/location
// - Filter by status
// - Filter by type
// - Filter by date range
// ============================================================================

'use client'

import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { CalendarIcon, Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function EventFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Get current filter values from URL
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'all'
  const type = searchParams.get('type') || 'all'
  const fromDate = searchParams.get('fromDate')
    ? new Date(searchParams.get('fromDate')!)
    : undefined
  const toDate = searchParams.get('toDate') ? new Date(searchParams.get('toDate')!) : undefined

  // Local state for form inputs
  const [searchValue, setSearchValue] = useState(search)
  const [statusValue, setStatusValue] = useState(status)
  const [typeValue, setTypeValue] = useState(type)
  const [fromDateValue, setFromDateValue] = useState<Date | undefined>(fromDate)
  const [toDateValue, setToDateValue] = useState<Date | undefined>(toDate)

  // Apply filters
  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams()
      if (searchValue) params.set('search', searchValue)
      if (statusValue && statusValue !== 'all') params.set('status', statusValue)
      if (typeValue && typeValue !== 'all') params.set('type', typeValue)
      if (fromDateValue) params.set('fromDate', fromDateValue.toISOString())
      if (toDateValue) params.set('toDate', toDateValue.toISOString())

      router.push(`/eventi?${params.toString()}`)
    })
  }

  // Reset filters
  const resetFilters = () => {
    setSearchValue('')
    setStatusValue('all')
    setTypeValue('all')
    setFromDateValue(undefined)
    setToDateValue(undefined)

    startTransition(() => {
      router.push('/eventi')
    })
  }

  // Check if any filters are active
  const hasActiveFilters =
    searchValue ||
    (statusValue && statusValue !== 'all') ||
    (typeValue && typeValue !== 'all') ||
    fromDateValue ||
    toDateValue

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Cerca per nome o luogo..."
            className="pl-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <Select value={statusValue} onValueChange={setStatusValue}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli stati</SelectItem>
            <SelectItem value="draft">Bozza</SelectItem>
            <SelectItem value="upcoming">In arrivo</SelectItem>
            <SelectItem value="active">Attivo</SelectItem>
            <SelectItem value="completed">Completato</SelectItem>
            <SelectItem value="cancelled">Annullato</SelectItem>
          </SelectContent>
        </Select>

        {/* Type filter */}
        <Select value={typeValue} onValueChange={setTypeValue}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i tipi</SelectItem>
            <SelectItem value="congresso_medico">Congresso Medico</SelectItem>
            <SelectItem value="conferenza_aziendale">Conferenza Aziendale</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="fiera">Fiera</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end">
        {/* Date range filters */}
        <div className="flex flex-wrap gap-4">
          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full md:w-[200px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fromDateValue ? (
                    format(fromDateValue, 'dd MMM yyyy', { locale: it })
                  ) : (
                    <span className="text-gray-500">Data inizio</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fromDateValue}
                  onSelect={setFromDateValue}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full md:w-[200px] justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {toDateValue ? (
                    format(toDateValue, 'dd MMM yyyy', { locale: it })
                  ) : (
                    <span className="text-gray-500">Data fine</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={toDateValue}
                  onSelect={setToDateValue}
                  initialFocus
                  disabled={(date) => {
                    // Disable dates before fromDate
                    return fromDateValue ? date < fromDateValue : false
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-2 ml-auto">
          {hasActiveFilters && (
            <Button variant="outline" onClick={resetFilters} disabled={isPending}>
              <X className="h-4 w-4 mr-2" />
              Resetta
            </Button>
          )}

          <Button onClick={applyFilters} disabled={isPending}>
            {isPending ? 'Applicazione...' : 'Applica Filtri'}
          </Button>
        </div>
      </div>
    </div>
  )
}
