import { z } from 'zod'

export const createSponsorSchema = z.object({
  companyName: z.string().min(1, "Il nome dell'azienda è obbligatorio"),
  contactPerson: z.string().optional().nullable(),
  email: z.string().email('Email non valida'),
  phone: z.string().optional().nullable(),
  sponsorshipLevel: z.enum(['platinum', 'gold', 'silver', 'bronze', 'partner']),
  sponsorshipAmount: z.coerce.number().min(0, "L'importo deve essere positivo"),
  contractSigned: z.boolean().default(false),
  contractDate: z.date().optional().nullable(),
  paymentStatus: z.enum(['pending', 'partial', 'paid']).default('pending'),
  paymentDate: z.date().optional().nullable(),
  websiteUrl: z.string().url('URL non valido').optional().nullable().or(z.literal('')),
  description: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const updateSponsorSchema = createSponsorSchema.partial()
