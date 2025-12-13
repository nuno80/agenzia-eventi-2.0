/**
 * FILE: src/app/(dashboard)/page.tsx
 *
 * PURPOSE: Redirect root dashboard route to /dashboard
 */

import { redirect } from 'next/navigation'

export default function DashboardRootPage() {
  redirect('/dashboard')
}
