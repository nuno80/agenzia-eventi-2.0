import EventManagementDashboard from '@/components/dashboard/EventManagementDashboard'

export const metadata = {
  title: 'Dashboard - Event Management System',
  description: 'Admin dashboard for managing events, participants, and budgets',
  keywords: 'event management, dashboard, admin panel',
  openGraph: {
    title: 'Event Management Dashboard',
    description: 'Admin dashboard for managing events, participants, and budgets',
    type: 'website',
    locale: 'it_IT',
    url: 'https://tuosito.it',
  },
}

export default function Home() {
  return (
    <div>
      <EventManagementDashboard />
    </div>
  )
}
