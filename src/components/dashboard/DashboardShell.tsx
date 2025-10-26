// ============================================================================
// DASHBOARD SHELL COMPONENT
// ============================================================================
// FILE: src/components/dashboard/DashboardShell.tsx
//
// PURPOSE: Container component for dashboard pages
// FEATURES:
// - Consistent padding and layout for dashboard pages
// - Title and description display
// - Optional actions slot
// ============================================================================

import type { ReactNode } from 'react'

type DashboardShellProps = {
  children: ReactNode
  title?: string
  description?: string
  actions?: ReactNode
}

export function DashboardShell({ children, title, description, actions }: DashboardShellProps) {
  return (
    <div className="flex-1 space-y-6 p-6">
      {(title || description || actions) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
