/**
 * FILE: src/lib/utils.ts
 *
 * PURPOSE: Utility functions used across the application
 *
 * FUNCTIONS:
 * - cn(): Merge Tailwind classes with conflict resolution
 * - formatCurrency(): Format numbers as EUR currency
 * - formatDate(): Format dates for Italian locale
 * - getPriorityColor(): Get color for priority badges
 * - getStatusColor(): Get color for status badges
 * - getDaysUntil(): Calculate days until a date
 * - getEventProgress(): Calculate event progress percentage
 *
 * USAGE:
 * import { cn, formatCurrency } from '@/lib/utils';
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 * Uses clsx for conditional classes and tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number as EUR currency
 * @param amount - Number to format
 * @returns Formatted string (e.g., "€ 1.234,56")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

/**
 * Format date for Italian locale
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('it-IT', options).format(d)
}

/**
 * Format date and time for Italian locale
 * @param date - Date to format
 * @returns Formatted datetime string
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Format date and time in short compact style for Italian locale
 * Example: "02 nov. 2025 | 15:18"
 */
export function formatDateTimeShort(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  const day = new Intl.DateTimeFormat('it-IT', { day: '2-digit' }).format(d)
  let month = new Intl.DateTimeFormat('it-IT', { month: 'short' }).format(d)
  // Ensure lower-case and trailing dot as per design (nov.)
  month = month.toLowerCase()
  if (!month.endsWith('.')) month = `${month}.`
  const year = new Intl.DateTimeFormat('it-IT', { year: 'numeric' }).format(d)
  const time = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false }).format(d)
  return `${day} ${month} ${year} | ${time}`
}

/**
 * Get Tailwind color classes for priority levels
 * @param priority - Priority level
 * @returns Object with bg, text, and border color classes
 */
export function toRoleLabel(role: string): string {
  if (!role) return ''
  if (role === 'av_tech') return 'Tecnico AV'
  return role.replace('_', ' ')
}

/**
 * Convert a string to Title Case (words capitalized), preserving separators
 * Examples: "gold" -> "Gold", "very important" -> "Very Important"
 */
export function toTitleCase(input: string): string {
  if (!input) return ''
  return input
    .toLowerCase()
    .split(/([\s\-_/]+)/) // keep separators
    .map((chunk) =>
      /[a-zA-ZÀ-ÖØ-öø-ÿ]/.test(chunk) ? chunk.charAt(0).toUpperCase() + chunk.slice(1) : chunk
    )
    .join('')
}

export function getPriorityColor(priority: string) {
  const colors = {
    low: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
      badge: 'bg-gray-100 text-gray-700',
    },
    medium: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-300',
      badge: 'bg-blue-100 text-blue-700',
    },
    high: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-300',
      badge: 'bg-orange-100 text-orange-700',
    },
    urgent: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      badge: 'bg-red-100 text-red-700',
    },
  }

  return colors[priority as keyof typeof colors] || colors.medium
}

/**
 * Get Tailwind color classes for event status
 * @param status - Event status
 * @returns Object with bg, text, and border color classes
 */
export function getStatusColor(status: string) {
  const colors = {
    draft: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
      badge: 'bg-gray-100 text-gray-700',
    },
    planning: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-300',
      badge: 'bg-blue-100 text-blue-700',
    },
    open: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
      badge: 'bg-green-100 text-green-700',
    },
    ongoing: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-300',
      badge: 'bg-yellow-100 text-yellow-700',
    },
    completed: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-300',
      badge: 'bg-purple-100 text-purple-700',
    },
    cancelled: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      badge: 'bg-red-100 text-red-700',
    },
  }

  return colors[status as keyof typeof colors] || colors.draft
}

/**
 * Calculate days until a date
 * @param date - Target date
 * @returns Number of days (negative if past, positive if future)
 */
export function getDaysUntil(date: Date | string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Reset time for accurate day calculation

  const target = typeof date === 'string' ? new Date(date) : date
  target.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Format days until message
 * @param date - Target date
 * @returns Human-readable string (e.g., "Tra 5 giorni", "Oggi", "Scaduto 2 giorni fa")
 */
export function formatDaysUntil(date: Date | string): string {
  const days = getDaysUntil(date)

  if (days === 0) return 'Oggi'
  if (days === 1) return 'Domani'
  if (days === -1) return 'Ieri'
  if (days > 0) return `Tra ${days} giorni`
  return `Scaduto ${Math.abs(days)} giorni fa`
}

/**
 * Calculate event progress percentage
 * Based on current date vs start/end dates
 * @param startDate - Event start date
 * @param endDate - Event end date
 * @returns Progress percentage (0-100)
 */
export function getEventProgress(startDate: Date | string, endDate: Date | string): number {
  const now = new Date()
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate

  if (now < start) return 0
  if (now > end) return 100

  const total = end.getTime() - start.getTime()
  const elapsed = now.getTime() - start.getTime()

  return Math.round((elapsed / total) * 100)
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3)}...`
}

/**
 * Capitalize first letter of string
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export function capitalize(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Format payment status label
 * @param status - Payment status
 * @returns Italian label
 */
export function getPaymentStatusLabel(status: string): string {
  const labels = {
    pending: 'In attesa',
    paid: 'Pagato',
    refunded: 'Rimborsato',
    free: 'Gratuito',
    partial: 'Parziale',
  }

  return labels[status as keyof typeof labels] || status
}

/**
 * Format registration status label
 * @param status - Registration status
 * @returns Italian label
 */
export function getRegistrationStatusLabel(status: string): string {
  const labels = {
    pending: 'In attesa',
    confirmed: 'Confermato',
    cancelled: 'Annullato',
    waitlist: "Lista d'attesa",
  }

  return labels[status as keyof typeof labels] || status
}

// ================================
// Staff Assignments - Payment utils
// ================================

export type PaymentTerms = 'immediate' | '30_days' | '60_days' | '90_days'
export type AssignmentStatus = 'requested' | 'confirmed' | 'declined' | 'completed' | 'cancelled'
export type PaymentStatus = 'not_due' | 'pending' | 'overdue' | 'paid'

/**
 * Calculate payment due date based on end time and terms
 * - immediate: same day as endTime
 * - 30/60/90_days: add N days to endTime
 */
export function calculatePaymentDueDate(
  endTime: Date | null | undefined,
  terms: PaymentTerms
): Date {
  const base = new Date(endTime ?? new Date())
  base.setHours(0, 0, 0, 0)

  switch (terms) {
    case 'immediate':
      return base
    case '30_days': {
      const d = new Date(base)
      d.setDate(d.getDate() + 30)
      return d
    }
    case '60_days': {
      const d = new Date(base)
      d.setDate(d.getDate() + 60)
      return d
    }
    case '90_days': {
      const d = new Date(base)
      d.setDate(d.getDate() + 90)
      return d
    }
    default:
      return base
  }
}

/**
 * Determine current payment status.
 * Rules:
 * - If paymentDate exists => 'paid'
 * - If assignment is cancelled/declined => 'not_due'
 * - If no dueDate => 'not_due'
 * - If today > dueDate => 'overdue', else 'pending'
 */
export function calculatePaymentStatus(
  dueDate: Date | null,
  paymentDate: Date | null,
  assignmentStatus: AssignmentStatus
): PaymentStatus {
  if (paymentDate) return 'paid'
  if (assignmentStatus === 'cancelled' || assignmentStatus === 'declined') return 'not_due'
  if (!dueDate) return 'not_due'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (today.getTime() > dueDate.getTime()) return 'overdue'
  return 'pending'
}
