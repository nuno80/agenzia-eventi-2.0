/**
 * FILE: src/app/(dashboard)/eventi/[id]/[tab]/page.tsx
 * 
 * PAGE: Event Detail with Tabs
 * TYPE: Server Component (async)
 * 
 * WHY SERVER:
 * - Fetches event data from database
 * - Dynamic route with [id] and [tab] params
 * - Uses Suspense for progressive loading
 * 
 * ROUTE PARAMS:
 * - id: string - Event ID
 * - tab: string - Tab slug (overview, partecipanti, relatori, etc.)
 * 
 * DATA SOURCES:
 * - getEventById(id): Fetch event data
 * - getEventWithParticipants(id): For participant count
 * - getEventWithSpeakers(id): For speaker count
 * - getEventWithSponsors(id): For sponsor count
 * 
 * PATTERN:
 * - Server Component fetches data
 * - EventHeader shows event info (Server)
 * - EventTabs for navigation (Client)
 * - Tab content based on [tab] param (Server)
 * 
 * VALID TABS:
 * - overview, partecipanti, relatori, sponsor, agenda,
 *   servizi, budget, comunicazioni, sondaggi, checkin
 * 
 * USAGE:
 * /eventi/[id]/overview → Shows Overview tab
 * /eventi/[id]/partecipanti → Shows Participants tab (when created)
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { 
  getEventById, 
  getEventWithParticipants,
  getEventWithSpeakers,
  getEventWithSponsors
} from '@/lib/dal/events';
import { EventHeader } from '@/components/dashboard/events/EventHeader';
import { EventTabs } from '@/components/dashboard/events/EventTabs';
import { OverviewTab } from '@/components/dashboard/events/tabs/OverviewTab';
import { ParticipantsTab } from '@/components/dashboard/events/tabs/ParticipantsTab';
import { Loader2 } from 'lucide-react';

// Define valid tab values
const VALID_TABS = [
  'overview',
  'partecipanti',
  'relatori',
  'sponsor',
  'agenda',
  'servizi',
  'budget',
  'comunicazioni',
  'sondaggi',
  'checkin',
] as const;

type ValidTab = typeof VALID_TABS[number];

interface PageProps {
  params: Promise<{
    id: string;
    tab: string;
  }>;
}

/**
 * Main Event Detail Page
 */
export default async function EventDetailPage({ params }: PageProps) {
  const { id, tab } = await params;

  // Validate tab parameter
  if (!VALID_TABS.includes(tab as ValidTab)) {
    notFound();
  }

  // Fetch event data
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <EventHeader event={event} />

      {/* Navigation Tabs */}
      <EventTabs eventId={id} currentTab={tab} />

      {/* Tab Content with Suspense */}
      <Suspense fallback={<TabContentSkeleton />}>
        <TabContent eventId={id} tab={tab as ValidTab} />
      </Suspense>
    </div>
  );
}

/**
 * Tab Content Component
 * Renders different content based on active tab
 */
async function TabContent({ eventId, tab }: { eventId: string; tab: ValidTab }) {
  switch (tab) {
    case 'overview':
      return <OverviewTabContent eventId={eventId} />;
    
    case 'partecipanti':
      return <ParticipantsTab eventId={eventId} />;
    
    case 'relatori':
      return <PlaceholderTab title="Relatori" />;
    
    case 'sponsor':
      return <PlaceholderTab title="Sponsor" />;
    
    case 'agenda':
      return <PlaceholderTab title="Agenda" />;
    
    case 'servizi':
      return <PlaceholderTab title="Servizi" />;
    
    case 'budget':
      return <PlaceholderTab title="Budget" />;
    
    case 'comunicazioni':
      return <PlaceholderTab title="Comunicazioni" />;
    
    case 'sondaggi':
      return <PlaceholderTab title="Sondaggi" />;
    
    case 'checkin':
      return <PlaceholderTab title="Check-in" />;
    
    default:
      return <PlaceholderTab title="Tab non implementato" />;
  }
}

/**
 * Overview Tab Content with Data
 * Fetches counts for participants, speakers, sponsors
 */
async function OverviewTabContent({ eventId }: { eventId: string }) {
  // Fetch data in parallel
  const [event, eventWithParticipants, eventWithSpeakers, eventWithSponsors] = 
    await Promise.all([
      getEventById(eventId),
      getEventWithParticipants(eventId),
      getEventWithSpeakers(eventId),
      getEventWithSponsors(eventId),
    ]);

  if (!event) {
    notFound();
  }

  const participantsCount = eventWithParticipants?.participants?.length || 0;
  const speakersCount = eventWithSpeakers?.speakers?.length || 0;
  const sponsorsCount = eventWithSponsors?.sponsors?.length || 0;

  return (
    <OverviewTab
      event={event}
      participantsCount={participantsCount}
      speakersCount={speakersCount}
      sponsorsCount={sponsorsCount}
    />
  );
}

/**
 * Placeholder Tab Component
 * For tabs not yet implemented
 */
function PlaceholderTab({ title }: { title: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600">
          Questa sezione è in fase di sviluppo e sarà disponibile a breve.
        </p>
      </div>
    </div>
  );
}

/**
 * Loading Skeleton for Tab Content
 */
function TabContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Description skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-3" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded w-16 mb-1" />
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Details skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return {
      title: 'Evento non trovato',
    };
  }

  return {
    title: `${event.title} | EventHub Dashboard`,
    description: event.description || event.tagline || `Gestisci ${event.title}`,
  };
}