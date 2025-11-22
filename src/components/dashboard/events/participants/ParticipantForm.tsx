/**
 * FILE: src/components/dashboard/events/participants/ParticipantForm.tsx
 *
 * COMPONENT: ParticipantForm
 * TYPE: Client Component
 *
 * WHY CLIENT:
 * - Form state management
 * - Input validation
 * - Server action calls
 *
 * PROPS:
 * - eventId: string - Event ID
 * - participant?: Participant - For edit mode
 * - onSuccess?: () => void - Callback after success
 * - onCancel?: () => void - Callback on cancel
 *
 * FEATURES:
 * - Create/Edit mode
 * - Form validation
 * - Loading states
 * - Error handling
 *
 * USAGE:
 * <ParticipantForm eventId={eventId} onSuccess={() => setOpen(false)} />
 */

'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createParticipant, updateParticipant } from '@/app/actions/participant-crud'
import { Button } from '@/components/ui/button'
import type { Participant } from '@/db'

interface ParticipantFormProps {
  eventId: string
  participant?: Participant
  onSuccess?: () => void
  onCancel?: () => void
}

export function ParticipantForm({
  eventId,
  participant,
  onSuccess,
  onCancel,
}: ParticipantFormProps) {
  const isEdit = !!participant
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)

    const data = {
      eventId,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      jobTitle: formData.get('jobTitle') as string,
      registrationStatus: formData.get('registrationStatus') as
        | 'pending'
        | 'confirmed'
        | 'cancelled'
        | 'waitlist',
      ticketType: formData.get('ticketType') as string,
      ticketPrice: Number.parseFloat(formData.get('ticketPrice') as string) || 0,
      paymentStatus: formData.get('paymentStatus') as 'pending' | 'paid' | 'refunded' | 'free',
      dietaryRequirements: formData.get('dietaryRequirements') as string,
      specialNeeds: formData.get('specialNeeds') as string,
      notes: formData.get('notes') as string,
    }

    try {
      const result = isEdit
        ? await updateParticipant({ id: participant.id, ...data })
        : await createParticipant(data)

      if (result.success) {
        toast.success(
          isEdit ? 'Participant updated successfully' : 'Participant created successfully'
        )
        onSuccess?.()
      } else {
        toast.error(result.error || 'Operation failed')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Info */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              defaultValue={participant?.firstName}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              defaultValue={participant?.lastName}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              defaultValue={participant?.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              defaultValue={participant?.phone || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Professional Info */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Professional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              defaultValue={participant?.company || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              name="jobTitle"
              defaultValue={participant?.jobTitle || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Registration & Ticket */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Registration & Ticket</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="registrationStatus"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Registration Status
            </label>
            <select
              id="registrationStatus"
              name="registrationStatus"
              defaultValue={participant?.registrationStatus || 'pending'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="waitlist">Waitlist</option>
            </select>
          </div>

          <div>
            <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              id="paymentStatus"
              name="paymentStatus"
              defaultValue={participant?.paymentStatus || 'pending'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="free">Free</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label htmlFor="ticketType" className="block text-sm font-medium text-gray-700 mb-1">
              Ticket Type
            </label>
            <input
              type="text"
              id="ticketType"
              name="ticketType"
              placeholder="e.g., Standard, VIP, Speaker"
              defaultValue={participant?.ticketType || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Ticket Price (€)
            </label>
            <input
              type="number"
              id="ticketPrice"
              name="ticketPrice"
              min="0"
              step="0.01"
              defaultValue={participant?.ticketPrice || 0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="dietaryRequirements"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Dietary Requirements
            </label>
            <input
              type="text"
              id="dietaryRequirements"
              name="dietaryRequirements"
              placeholder="e.g., Vegetarian, Gluten-free"
              defaultValue={participant?.dietaryRequirements || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="specialNeeds" className="block text-sm font-medium text-gray-700 mb-1">
              Special Needs
            </label>
            <input
              type="text"
              id="specialNeeds"
              name="specialNeeds"
              placeholder="e.g., Wheelchair access"
              defaultValue={participant?.specialNeeds || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={participant?.notes || ''}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? 'Saving...' : isEdit ? 'Update Participant' : 'Create Participant'}
        </Button>
      </div>
    </form>
  )
}
