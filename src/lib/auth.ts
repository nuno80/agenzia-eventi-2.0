/**
 * FILE: src/lib/auth.ts
 * TYPE: Server-side Auth Configuration
 *
 * PURPOSE: Better Auth configuration with Drizzle adapter for Turso/LibSQL
 *
 * USAGE:
 * - Server-side: import { auth } from "@/lib/auth"
 * - API routes: auth.handler
 * - Server components: auth.api.getSession()
 */

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/db'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite', // LibSQL/Turso uses SQLite dialect
  }),

  // Email/Password authentication
  emailAndPassword: {
    enabled: true,
    // Custom validation if needed
    // minPasswordLength: 8
  },

  // Social providers (configure in .env)
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },

  // Custom user fields
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'user',
      },
    },
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes cache
    },
  },

  // Callbacks
  callbacks: {
    async onUserCreated(user) {
      console.log('[BetterAuth] New user created:', user.email)
    },
  },
})

// Export auth types
export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
