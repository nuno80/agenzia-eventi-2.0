/**
 * FILE: src/lib/auth-client.ts
 * TYPE: Client-side Auth
 *
 * PURPOSE: Better Auth client for React components
 *
 * USAGE:
 * import { authClient } from "@/lib/auth-client"
 * const { data: session } = authClient.useSession()
 */

import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
})

// Export hooks for convenience
export const { signIn, signUp, signOut, useSession, getSession } = authClient
