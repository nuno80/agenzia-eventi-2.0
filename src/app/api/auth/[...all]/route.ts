/**
 * FILE: src/app/api/auth/[...all]/route.ts
 * TYPE: API Route Handler
 *
 * PURPOSE: Catch-all route for Better Auth endpoints
 * Handles: /api/auth/sign-in, /api/auth/sign-up, /api/auth/sign-out, etc.
 *
 * USAGE: Automatically handles all auth-related API requests
 */

import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/lib/auth'

export const { GET, POST } = toNextJsHandler(auth.handler)
