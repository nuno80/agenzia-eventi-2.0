/**
 * FILE: src/components/dashboard/settings/ProfileSettings.tsx
 * TYPE: Client Component
 * WHY: Interactive form for profile settings with database persistence
 *
 * FEATURES:
 * - Form with validation
 * - Database persistence via server actions
 * - Toast notifications
 * - Logo upload placeholder
 * - Accepts initial settings from server
 */

'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { updateProfileSettings } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import type { ProfileSettings } from '@/lib/validations/settings'

interface ProfileSettingsFormProps {
  initialSettings: ProfileSettings
}

export function ProfileSettingsForm({ initialSettings }: ProfileSettingsFormProps) {
  const [settings, setSettings] = useState<ProfileSettings>(initialSettings)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await updateProfileSettings(formData)

      if (result.success && result.data) {
        setSettings(result.data)
        toast.success('Impostazioni salvate con successo')
      } else if (!result.success) {
        toast.error(result.error || 'Errore durante il salvataggio')
      }
    } catch (_error) {
      toast.error('Errore durante il salvataggio')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informazioni Organizzazione</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Name */}
          <div>
            <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
              Nome Organizzazione *
            </label>
            <input
              type="text"
              id="organizationName"
              name="organizationName"
              required
              defaultValue={settings.organizationName}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Contact Email */}
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
              Email Contatto *
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              required
              defaultValue={settings.contactEmail}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
              Telefono
            </label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              defaultValue={settings.contactPhone}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700">
              Sito Web
            </label>
            <input
              type="url"
              id="website"
              name="website"
              placeholder="https://esempio.it"
              defaultValue={settings.website}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Indirizzo
            </label>
            <input
              type="text"
              id="address"
              name="address"
              defaultValue={settings.address}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* City & Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                Città
              </label>
              <input
                type="text"
                id="city"
                name="city"
                defaultValue={settings.city}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Paese
              </label>
              <input
                type="text"
                id="country"
                name="country"
                defaultValue={settings.country}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
              Fuso Orario
            </label>
            <select
              id="timezone"
              name="timezone"
              defaultValue={settings.timezone}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="Europe/Rome">Europa/Roma (GMT+1)</option>
              <option value="Europe/London">Europa/Londra (GMT+0)</option>
              <option value="America/New_York">America/New York (GMT-5)</option>
              <option value="America/Los_Angeles">America/Los Angeles (GMT-8)</option>
            </select>
          </div>

          {/* Language */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              Lingua
            </label>
            <select
              id="language"
              name="language"
              defaultValue={settings.language}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="it">Italiano</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Logo Upload Placeholder */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Logo</label>
            <div className="mt-1 flex items-center space-x-4">
              <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt="Logo"
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-3xl">🏢</span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                <p>Upload logo disponibile dopo integrazione vercel-blob</p>
              </div>
            </div>
            <input type="hidden" name="logoUrl" value={settings.logoUrl} />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
