/**
 * FILE: src/components/dashboard/home/StatsOverview.tsx
 * 
 * COMPONENT: StatsOverview
 * TYPE: Server Component
 * 
 * WHY SERVER:
 * - Display-only component showing statistics
 * - No interactivity needed
 * - Receives computed stats as props
 * 
 * PROPS:
 * - stats: EventStats object with counts by status
 * 
 * FEATURES:
 * - Grid of stat cards (responsive: 1/2/4 columns)
 * - Color-coded by status
 * - Icons for visual clarity
 * - Total events, upcoming, ongoing, completed
 * 
 * USAGE:
 * const stats = await getEventStats();
 * <StatsOverview stats={stats} />
 */

import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Users,
  PlayCircle
} from 'lucide-react';

interface EventStats {
  total: number;
  draft: number;
  planning: number;
  open: number;
  ongoing: number;
  completed: number;
  cancelled: number;
  upcoming: number;
  past: number;
}

interface StatsOverviewProps {
  stats: EventStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      label: 'Totale Eventi',
      value: stats.total,
      icon: Calendar,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600',
      description: 'Tutti gli eventi',
    },
    {
      label: 'In Corso',
      value: stats.ongoing,
      icon: PlayCircle,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-600',
      description: 'Eventi attivi ora',
    },
    {
      label: 'Prossimi Eventi',
      value: stats.upcoming,
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-600',
      description: 'Eventi futuri',
    },
    {
      label: 'Completati',
      value: stats.completed,
      icon: CheckCircle,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-600',
      description: 'Eventi terminati',
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Panoramica
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          
          return (
            <div
              key={card.label}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Icon */}
              <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              
              {/* Value */}
              <div className="mb-1">
                <div className={`text-3xl font-bold ${card.textColor}`}>
                  {card.value}
                </div>
              </div>
              
              {/* Label */}
              <div className="text-sm font-medium text-gray-900 mb-1">
                {card.label}
              </div>
              
              {/* Description */}
              <div className="text-xs text-gray-500">
                {card.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional stats bar */}
      <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <StatBadge 
            label="Aperti alle iscrizioni" 
            value={stats.open} 
            color="green" 
          />
          <StatBadge 
            label="In pianificazione" 
            value={stats.planning} 
            color="blue" 
          />
          <StatBadge 
            label="Bozze" 
            value={stats.draft} 
            color="gray" 
          />
          {stats.cancelled > 0 && (
            <StatBadge 
              label="Annullati" 
              value={stats.cancelled} 
              color="red" 
            />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Small stat badge component
 */
function StatBadge({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: number; 
  color: 'green' | 'blue' | 'gray' | 'red';
}) {
  const colorClasses = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    gray: 'bg-gray-100 text-gray-700',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${colorClasses[color]}`}>
        {value}
      </span>
    </div>
  );
}