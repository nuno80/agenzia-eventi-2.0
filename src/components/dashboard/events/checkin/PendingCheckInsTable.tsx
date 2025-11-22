/**
 * FILE: src/components/dashboard/events/checkin/PendingCheckInsTable.tsx
 *
 * COMPONENT: PendingCheckInsTable
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Handles manual check-in button clicks
 * - Manages loading states
 * - Shows toast notifications
 *
 * PROPS:
 * - participants: Participant[] - Pending participants
 * - eventId: string - Event ID
 *
 * FEATURES:
 * - Table of pending check-ins
 * - Manual check-in button per row
 * - Search functionality
 *
 * USAGE:
 * <PendingCheckInsTable participants={pending} eventId={event.id} />
 */

'use client'

import { Search, UserCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { manualCheckIn } from '@/app/actions/participants'
import { Button } from '@/components/ui/button'
import type { Participant } from '@/db/libsql-schemas/events'

interface PendingCheckInsTableProps {
  participants: Participant[]
  eventId: string
}

export function PendingCheckInsTable({ participants, eventId }: PendingCheckInsTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  // Filter participants by search
  const filteredParticipants = participants.filter(
    (p) =>
      p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.company?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle manual check-in
  const handleCheckIn = async (participantId: string) => {
    setProcessingIds((prev) => new Set(prev).add(participantId))

    try {
      const result = await manualCheckIn({
        participantId,
        eventId,
        method: 'manual',
      })

      if (result.success) {
        toast.success(`Check-in successful: ${result.data?.participantName}`)
      } else {
        toast.error(result.error || 'Check-in failed')
      }
    } catch (error) {
      console.error('Manual check-in error:', error)
      toast.error('Error processing check-in')
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev)
        next.delete(participantId)
        return next
      })
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header with Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Pending Check-ins ({filteredParticipants.length})
          </h3>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search participants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ticket
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredParticipants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {searchQuery ? 'No participants found' : 'All participants checked in! 🎉'}
                </td>
              </tr>
            ) : (
              filteredParticipants.map((participant) => (
                <tr key={participant.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {participant.firstName} {participant.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{participant.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{participant.company || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {participant.ticketType || '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      onClick={() => handleCheckIn(participant.id)}
                      disabled={processingIds.has(participant.id)}
                      className="gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      {processingIds.has(participant.id) ? 'Processing...' : 'Check In'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
