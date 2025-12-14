/**
 * FILE: src/app/(dashboard)/dashboard/page.tsx
 *
 * PAGE: Dashboard Home
 * TYPE: Server Component
 *
 * PURPOSE: Simple starter dashboard with welcome message
 */

export const metadata = {
  title: 'Dashboard | My App',
  description: 'Welcome to your dashboard',
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Benvenuto nella tua dashboard</p>
      </div>

      {/* Welcome Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🚀</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Starter Kit Pronto!</h2>
          <p className="text-gray-600 mb-6">
            Questo è il tuo punto di partenza. Aggiungi widget, grafici e funzionalità secondo le
            tue necessità.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-1">📁 Files</h3>
              <p className="text-sm text-gray-600">Gestione file con Vercel Blob</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-1">🔐 Auth</h3>
              <p className="text-sm text-gray-600">Better Auth pronto (opt-in)</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-1">🗄️ Database</h3>
              <p className="text-sm text-gray-600">Drizzle ORM + Turso</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
