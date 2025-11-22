'use client'

import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { deleteSponsor } from '@/app/actions/sponsors'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Sponsor } from '@/db'
import { toTitleCase } from '@/lib/utils'
import { SponsorForm } from './SponsorForm'

interface SponsorListProps {
  eventId: string
  sponsors: Sponsor[]
}

export function SponsorList({ eventId, sponsors }: SponsorListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null)

  const handleDelete = (id: string) => {
    if (
      !confirm(
        'Sei sicuro di voler eliminare questo sponsor? Verrà eliminata anche la voce di budget associata.'
      )
    )
      return

    startTransition(async () => {
      await deleteSponsor(id)
      router.refresh()
    })
  }

  const levelLabel = (lvl: string) => toTitleCase(lvl.replace('_', ' '))

  const money = (v: number) =>
    new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(v)

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Aggiungi Sponsor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuovo Sponsor</DialogTitle>
            </DialogHeader>
            <SponsorForm
              eventId={eventId}
              onSuccess={() => setIsAddOpen(false)}
              onCancel={() => setIsAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs text-gray-500 border-b">
                <th className="py-3 px-4">Azienda</th>
                <th className="py-3 px-4">Livello</th>
                <th className="py-3 px-4">Contratto</th>
                <th className="py-3 px-4">Pagamento</th>
                <th className="py-3 px-4 text-right">Importo</th>
                <th className="py-3 px-4 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sponsors.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{s.companyName}</div>
                    <div className="text-xs text-gray-500">
                      {[s.contactPerson || null, s.email].filter(Boolean).join(' · ')}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-[11px] font-medium border border-gray-200">
                      {levelLabel(s.sponsorshipLevel)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        s.contractSigned
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.contractSigned ? 'Firmato' : 'Non firmato'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        s.paymentStatus === 'paid'
                          ? 'bg-green-50 text-green-700'
                          : s.paymentStatus === 'partial'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {s.paymentStatus === 'paid'
                        ? 'Pagato'
                        : s.paymentStatus === 'partial'
                          ? 'Parziale'
                          : 'Da pagare'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">{money(s.sponsorshipAmount)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingSponsor(s)}
                      >
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-red-600"
                        onClick={() => handleDelete(s.id)}
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {sponsors.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Nessuno sponsor presente. Clicca su "Aggiungi Sponsor" per iniziare.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingSponsor} onOpenChange={(open) => !open && setEditingSponsor(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifica Sponsor</DialogTitle>
          </DialogHeader>
          {editingSponsor && (
            <SponsorForm
              eventId={eventId}
              initialData={editingSponsor}
              onSuccess={() => setEditingSponsor(null)}
              onCancel={() => setEditingSponsor(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
