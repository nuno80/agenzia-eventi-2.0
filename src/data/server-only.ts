// src/data/server-only.ts
// This file ensures that all DAL modules are only used on the server
import 'server-only'
import { cache } from 'react'

// Export utility functions for authorization and other server-only operations
// Using React.cache() for deduplication of calls within a single render pass
export const requireUser = cache(async () => {
  // Placeholder for user authentication logic
  // This will be implemented with the actual authentication provider (e.g., Clerk)
  throw new Error('User authentication not implemented')
})

export const requireAdminUser = cache(async () => {
  // Placeholder for admin user authentication logic
  const _user = await requireUser()
  // Add admin check logic here
  throw new Error('Admin authorization not implemented')
})
