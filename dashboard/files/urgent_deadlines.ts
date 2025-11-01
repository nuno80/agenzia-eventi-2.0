/**
 * FILE: src/components/dashboard/home/UrgentDeadlines.tsx
 * 
 * COMPONENT: UrgentDeadlines
 * TYPE: Server Component
 * 
 * WHY SERVER:
 * - Display-only component, no interactivity
 * - Receives data as props from parent
 * - Can be cached and streamed
 * 
 * PROPS:
 * - deadlines: Array of Deadline objects with event relation
 * 
 * FEATURES:
 * - Shows overdue deadlines in red alert
 * - Shows urgent (next 7 days) in yellow alert
 * - Displays days until/overdue with color coding
 * - Links to event details
 * 
 * USAGE:
 * const deadlines = await getUrgentDeadlines();
 * <UrgentDeadlines deadlines={deadlines} />
 */

import Link from 'next/link';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { formatDaysUntil, getDaysUntil, getPriorityColor } from '@/lib/utils';

type DeadlineWithEvent = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assignedTo: string | null;
  category: string | null;
  event: {
    id: string;
    title: string;
  };
};

interface UrgentDeadlinesProps {
  deadlines: DeadlineWithEvent[];
}

export function UrgentDeadlines({ deadlines }: UrgentDeadlinesProps) {
  // Separate overdue and upcoming deadlines
  const overdueDeadlines = deadlines.filter(d => getDaysUntil(d.dueDate) < 0);
  const upcomingDeadlines = deadlines.filter(d => getDaysUntil(d.dueDate) >= 0);

  if (deadlines.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Scadenze Urgenti
          </h2>
        </div>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            Nessuna scadenza urgente al momento
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Ottimo lavoro! 🎉
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-orange-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Scadenze Urgenti
          </h2>
          {deadlines.length > 0 && (
            <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {deadlines.length}
            </span>
          )}
        </div>
      </div>

      {/* Overdue Section */}
      {overdueDeadlines.length > 0 && (
        <div className="mb-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-2">
                  Scadenze Superate ({overdueDeadlines.length})
                </h3>
                <div className="space-y-2">
                  {overdueDeadlines.map((deadline) => (
                    <DeadlineItem key={deadline.id} deadline={deadline} isOverdue />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Section */}
      {upcomingDeadlines.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Prossime Scadenze
          </h3>
          <div className="space-y-2">
            {upcomingDeadlines.map((deadline) => (
              <DeadlineItem key={deadline.id} deadline={deadline} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual deadline item component
 */
function DeadlineItem({ 
  deadline, 
  isOverdue = false 
}: { 
  deadline: DeadlineWithEvent;
  isOverdue?: boolean;
}) {
  const daysUntil = getDaysUntil(deadline.dueDate);
  const priorityColors = getPriorityColor(deadline.priority);
  
  return (
    <div className={`
      flex items-start justify-between p-3 rounded-lg border transition-colors
      ${isOverdue 
        ? 'bg-red-50 border-red-200 hover:bg-red-100' 
        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
      }
    `}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {deadline.title}
          </h4>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${priorityColors.badge}`}>
            {deadline.priority}
          </span>
        </div>
        
        <p className="text-xs text-gray-600 mb-1.5 line-clamp-1">
          {deadline.description || 'Nessuna descrizione'}
        </p>
        
        <div className="flex items-center space-x-3 text-xs text-gray-500">
          <Link 
            href={`/eventi/${deadline.event.id}/overview`}
            className="hover:text-blue-600 hover:underline font-medium"
          >
            {deadline.event.title}
          </Link>
          
          {deadline.assignedTo && (
            <>
              <span className="text-gray-300">•</span>
              <span>{deadline.assignedTo}</span>
            </>
          )}
          
          {deadline.category && (
            <>
              <span className="text-gray-300">•</span>
              <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                {deadline.category}
              </span>
            </>
          )}
        </div>
      </div>
      
      <div className="ml-4 flex-shrink-0 text-right">
        <div className={`
          text-xs font-semibold px-2 py-1 rounded
          ${isOverdue 
            ? 'bg-red-100 text-red-700' 
            : daysUntil === 0 
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-blue-100 text-blue-700'
          }
        `}>
          {formatDaysUntil(deadline.dueDate)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {new Date(deadline.dueDate).toLocaleDateString('it-IT', { 
            day: 'numeric', 
            month: 'short' 
          })}
        </div>
      </div>
    </div>
  );
}