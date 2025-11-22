/**
 * PAGE: Files Dashboard Page
 * TYPE: Server Component
 *
 * USAGE: Renders the FileManager client component within the dashboard layout
 */

import { Suspense } from 'react'
import FileManager from '@/components/FileManager'

export default function FilesDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Gestione File</h1>
        <p className="text-muted-foreground">Carica e gestisci i file e documenti del sistema.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <Suspense fallback={<div>Caricamento...</div>}>
          <FileManager />
        </Suspense>
      </div>
    </div>
  )
}
