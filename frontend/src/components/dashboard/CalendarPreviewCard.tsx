import React from 'react';
import { Calendar, Clock, BookOpen, FileText, Brain } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

interface CalendarEvent {
  id: number;
  title: string;
  type: 'assignment' | 'quiz' | 'module' | 'exam';
  start_date: string;
  end_date: string;
  module_name: string;
  description?: string;
}

interface CalendarPreviewCardProps {
  events: CalendarEvent[];
  loading: boolean;
}

const CalendarPreviewCard: React.FC<CalendarPreviewCardProps> = ({ events, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const today = new Date();
  const upcomingEvents = events
    .filter(event => new Date(event.start_date) >= today)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 5);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'quiz':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'module':
        return <BookOpen className="w-4 h-4 text-green-500" />;
      case 'exam':
        return <Brain className="w-4 h-4 text-red-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'quiz':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      case 'module':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'exam':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getTimeUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours < 1) {
      return diffMinutes > 0 ? `${diffMinutes}m` : 'Now';
    }
    if (diffHours < 24) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ${diffHours % 24}h`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
          <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Calendar</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {upcomingEvents.length} upcoming events
          </p>
        </div>
      </div>

      {/* Today's Date */}
      <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <div className="text-center">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {today.toLocaleDateString('en-US', { day: 'numeric' })}
          </div>
          <div className="text-xs text-indigo-600 dark:text-indigo-400">
            {today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Event List */}
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <div key={event.id} className={`flex items-start gap-3 p-3 rounded-lg border ${getEventColor(event.type)}`}>
              <div className="flex-shrink-0 mt-0.5">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {event.title}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded">
                    {event.type}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate">
                  {event.module_name}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(event.start_date)}</span>
                  </div>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">
                    {getTimeUntil(event.start_date)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No upcoming events</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Your schedule is clear!
            </p>
          </div>
        )}
      </div>

      {events.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">
            View full calendar
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarPreviewCard;
