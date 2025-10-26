// ============================================================================
// SPONSORS TAB COMPONENT
// ============================================================================
// FILE: src/components/dashboard/events/tabs/SponsorsTab.tsx
//
// PURPOSE: Display and manage sponsors for an event
// FEATURES:
// - List of sponsors with key information
// - Add, edit, delete sponsors
// - Sponsor details with contribution info
// ============================================================================

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Plus, Building, Euro, ExternalLink, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Mock data for sponsors - in a real app, this would come from an API call
type Sponsor = {
  id: string
  name: string
  type: 'platinum' | 'gold' | 'silver' | 'bronze'
  contribution: number
  contactName: string
  contactEmail: string
  contactPhone?: string
  website?: string
  logo?: string
  notes?: string
}

type SponsorsTabProps = {
  eventId: string
}

export function SponsorsTab({ eventId }: SponsorsTabProps) {
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Mock data - in a real app, this would be fetched from an API
  const [sponsors, setSponsors] = useState<Sponsor[]>([
    {
      id: '1',
      name: 'MediTech Solutions',
      type: 'platinum',
      contribution: 15000,
      contactName: 'Roberto Ferrari',
      contactEmail: 'r.ferrari@meditech.it',
      contactPhone: '+39 02 9876 5432',
      website: 'www.meditech.it',
      logo: '/images/sponsors/meditech.svg',
      notes: "Richiede stand di 6x4m nell'area espositiva principale.",
    },
    {
      id: '2',
      name: 'BioPharm Italia',
      type: 'gold',
      contribution: 10000,
      contactName: 'Alessandra Conti',
      contactEmail: 'a.conti@biopharm.it',
      contactPhone: '+39 06 1234 5678',
      website: 'www.biopharm.it',
      logo: '/images/sponsors/biopharm.svg',
    },
    {
      id: '3',
      name: 'HealthCare Innovations',
      type: 'silver',
      contribution: 5000,
      contactName: 'Marco Verdi',
      contactEmail: 'm.verdi@hcinnovations.it',
      website: 'www.hcinnovations.it',
    },
  ])

  // Handle adding a new sponsor
  const handleAddSponsor = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // In a real app, this would be a server action or API call
    const newSponsor: Sponsor = {
      id: `${sponsors.length + 1}`,
      name: formData.get('name') as string,
      type: formData.get('type') as Sponsor['type'],
      contribution: Number(formData.get('contribution')),
      contactName: formData.get('contactName') as string,
      contactEmail: formData.get('contactEmail') as string,
      contactPhone: (formData.get('contactPhone') as string) || undefined,
      website: (formData.get('website') as string) || undefined,
      notes: (formData.get('notes') as string) || undefined,
    }

    setSponsors([...sponsors, newSponsor])
    setIsAddDialogOpen(false)

    toast({
      title: 'Sponsor aggiunto',
      description: `${newSponsor.name} è stato aggiunto come sponsor.`,
    })
  }

  // Get sponsor type badge
  const SponsorTypeBadge = ({ type }: { type: Sponsor['type'] }) => {
    const typeConfig = {
      platinum: { label: 'Platinum', variant: 'default' as const },
      gold: { label: 'Gold', variant: 'warning' as const },
      silver: { label: 'Silver', variant: 'secondary' as const },
      bronze: { label: 'Bronze', variant: 'outline' as const },
    }

    const config = typeConfig[type]

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  // Calculate total contributions
  const totalContributions = sponsors.reduce((sum, sponsor) => sum + sponsor.contribution, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Sponsor</h2>
          <p className="text-gray-500">
            {sponsors.length} sponsor · €{totalContributions.toLocaleString('it-IT')} totali
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Sponsor
        </Button>
      </div>

      {sponsors.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-gray-50">
          <p className="text-gray-500">Nessuno sponsor aggiunto per questo evento.</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi il primo sponsor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsors.map((sponsor) => (
            <Card key={sponsor.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div>
                  <h3 className="font-semibold">{sponsor.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <SponsorTypeBadge type={sponsor.type} />
                    <span className="text-sm font-medium">
                      €{sponsor.contribution.toLocaleString('it-IT')}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Azioni</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil className="h-4 w-4 mr-2" /> Modifica
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" /> Rimuovi
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{sponsor.contactName}</p>
                      <p className="text-sm text-gray-500">{sponsor.contactEmail}</p>
                      {sponsor.contactPhone && (
                        <p className="text-sm text-gray-500">{sponsor.contactPhone}</p>
                      )}
                    </div>
                  </div>

                  {sponsor.notes && <p className="text-sm text-gray-600 mt-2">{sponsor.notes}</p>}
                </div>
              </CardContent>
              {sponsor.website && (
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a
                      href={
                        sponsor.website.startsWith('http')
                          ? sponsor.website
                          : `https://${sponsor.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
                      Visita sito web
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add Sponsor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aggiungi Sponsor</DialogTitle>
            <DialogDescription>
              Inserisci i dettagli dello sponsor per questo evento.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSponsor}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome azienda</Label>
                <Input id="name" name="name" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Livello di sponsorizzazione</Label>
                <Select name="type" defaultValue="silver">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona livello" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platinum">Platinum</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contribution">Contributo (€)</Label>
                <Input id="contribution" name="contribution" type="number" min="0" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contactName">Nome contatto</Label>
                <Input id="contactName" name="contactName" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contactEmail">Email contatto</Label>
                <Input id="contactEmail" name="contactEmail" type="email" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Telefono contatto</Label>
                <Input id="contactPhone" name="contactPhone" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="website">Sito web</Label>
                <Input id="website" name="website" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Note</Label>
                <Textarea id="notes" name="notes" rows={3} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annulla
              </Button>
              <Button type="submit">Aggiungi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
