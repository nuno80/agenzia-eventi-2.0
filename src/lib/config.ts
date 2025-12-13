/**
 * FILE: src/lib/config.ts
 * TYPE: Configuration
 *
 * PURPOSE: Application configuration flags
 *
 * USAGE:
 * import { config } from '@/lib/config'
 * if (config.auth.enabled) { ... }
 */

export const config = {
  /**
   * Application metadata
   */
  app: {
    name: 'My App',
    description: 'Your application description',
  },

  /**
   * Authentication configuration
   *
   * Set enabled to true to activate route protection.
   * When disabled (default), all routes are accessible without login.
   *
   * To enable:
   * 1. Configure .env.local with auth credentials
   * 2. Set enabled: true below
   * 3. Run `pnpm db:push` to create auth tables
   * 4. Restart the dev server
   */
  auth: {
    enabled: false,
  },
} as const
