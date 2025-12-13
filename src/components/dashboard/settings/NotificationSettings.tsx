/**
 * FILE: src/components/dashboard/settings/NotificationSettings.tsx
 * TYPE: Client Component
 * WHY: Interactive form for notification preferences with database persistence
 *
 * FEATURES:
 * - Toggle switches for notifications
 * - Slider for deadline days
 * - Database persistence via server actions
 * - Accepts initial settings from server
 */

'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { updateNotificationSettings } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import type { NotificationSettings } from '@/lib/validations/settings'

interface NotificationSettingsFormProps {
  initialSettings: NotificationSettings
}

export function NotificationSettingsForm({ initialSettings }: NotificationSettingsFormProps) {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await updateNotificationSettings(formData)

      if (result.success && result.data) {
        setSettings(result.data)
        toast.success('Preferenze notifiche salvate')
      } else if (!result.success) {
        toast.error(result.error || 'Errore durante il salvataggio')
      }
    } catch (_error) {
      toast.error('Errore durante il salvataggio')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggle = (field: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preferenze Notifiche</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-900">
                Notifiche Email
              </label>
              <p className="text-sm text-gray-500">Ricevi notifiche via email</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.emailNotifications}
              onClick={() => handleToggle('emailNotifications')}
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                ${settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
            <input
              type="hidden"
              name="emailNotifications"
              value={settings.emailNotifications.toString()}
            />
          </div>

          {/* Deadline Notification Days */}
          <div>
            <label
              htmlFor="deadlineNotificationDays"
              className="block text-sm font-medium text-gray-900"
            >
              Anticipo Notifiche Scadenze: {settings.deadlineNotificationDays} giorni
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Ricevi notifiche X giorni prima della scadenza
            </p>
            <input
              type="range"
              id="deadlineNotificationDays"
              name="deadlineNotificationDays"
              min="1"
              max="30"
              value={settings.deadlineNotificationDays}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  deadlineNotificationDays: Number(e.target.value),
                }))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 giorno</span>
              <span>30 giorni</span>
            </div>
          </div>

          {/* Payment Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="paymentNotifications" className="text-sm font-medium text-gray-900">
                Notifiche Pagamenti
              </label>
              <p className="text-sm text-gray-500">Avvisi per pagamenti in scadenza</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.paymentNotifications}
              onClick={() => handleToggle('paymentNotifications')}
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                ${settings.paymentNotifications ? 'bg-blue-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${settings.paymentNotifications ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
            <input
              type="hidden"
              name="paymentNotifications"
              value={settings.paymentNotifications.toString()}
            />
          </div>

          {/* Registration Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="notifyOnRegistration" className="text-sm font-medium text-gray-900">
                Notifiche Registrazioni
              </label>
              <p className="text-sm text-gray-500">Avviso per nuove registrazioni</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.notifyOnRegistration}
              onClick={() => handleToggle('notifyOnRegistration')}
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                ${settings.notifyOnRegistration ? 'bg-blue-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${settings.notifyOnRegistration ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
            <input
              type="hidden"
              name="notifyOnRegistration"
              value={settings.notifyOnRegistration.toString()}
            />
          </div>

          {/* Check-in Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="notifyOnCheckIn" className="text-sm font-medium text-gray-900">
                Notifiche Check-in
              </label>
              <p className="text-sm text-gray-500">Avviso per ogni check-in</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.notifyOnCheckIn}
              onClick={() => handleToggle('notifyOnCheckIn')}
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                ${settings.notifyOnCheckIn ? 'bg-blue-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${settings.notifyOnCheckIn ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
            <input
              type="hidden"
              name="notifyOnCheckIn"
              value={settings.notifyOnCheckIn.toString()}
            />
          </div>

          {/* Sponsor Payment Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="notifyOnSponsorPayment" className="text-sm font-medium text-gray-900">
                Notifiche Pagamenti Sponsor
              </label>
              <p className="text-sm text-gray-500">Avviso per pagamenti sponsor</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.notifyOnSponsorPayment}
              onClick={() => handleToggle('notifyOnSponsorPayment')}
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                ${settings.notifyOnSponsorPayment ? 'bg-blue-600' : 'bg-gray-200'}
              `}
            >
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${settings.notifyOnSponsorPayment ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
            <input
              type="hidden"
              name="notifyOnSponsorPayment"
              value={settings.notifyOnSponsorPayment.toString()}
            />
          </div>

          {/* Weekly Digest */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label htmlFor="weeklyDigest" className="text-sm font-medium text-gray-900">
                  Digest Settimanale
                </label>
                <p className="text-sm text-gray-500">Riepilogo settimanale via email</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.weeklyDigest}
                onClick={() => handleToggle('weeklyDigest')}
                className={`
                  relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                  ${settings.weeklyDigest ? 'bg-blue-600' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                    ${settings.weeklyDigest ? 'translate-x-5' : 'translate-x-0'}
                  `}
                />
              </button>
              <input type="hidden" name="weeklyDigest" value={settings.weeklyDigest.toString()} />
            </div>

            {settings.weeklyDigest && (
              <div>
                <label htmlFor="digestDay" className="block text-sm font-medium text-gray-700">
                  Giorno Invio
                </label>
                <select
                  id="digestDay"
                  name="digestDay"
                  value={settings.digestDay}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      digestDay: e.target.value as 'monday' | 'friday',
                    }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="monday">Lunedì</option>
                  <option value="friday">Venerdì</option>
                </select>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Salvataggio...' : 'Salva Preferenze'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
