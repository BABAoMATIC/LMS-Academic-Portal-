import React, { useState, useEffect } from 'react';
import { Bell, Clock, AlertTriangle, CheckCircle, X, Settings, Calendar, BookOpen, MessageCircle } from 'lucide-react';
import reminderService from '../services/reminderService';

interface Reminder {
  id: string;
  type: 'assignment_deadline' | 'quiz_attempt' | 'feedback_available' | 'upcoming_event';
  title: string;
  message: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  userId: number;
  relatedId?: number;
  createdAt: string;
}

const ReminderCenter: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load initial reminders
    setReminders(reminderService.getReminders());

    // Set up interval to refresh reminders
    const interval = setInterval(() => {
      setReminders(reminderService.getReminders());
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'low':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'assignment_deadline':
        return <BookOpen className="w-4 h-4" />;
      case 'quiz_attempt':
        return <AlertTriangle className="w-4 h-4" />;
      case 'feedback_available':
        return <MessageCircle className="w-4 h-4" />;
      case 'upcoming_event':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assignment_deadline':
        return 'text-blue-600 bg-blue-100';
      case 'quiz_attempt':
        return 'text-purple-600 bg-purple-100';
      case 'feedback_available':
        return 'text-green-600 bg-green-100';
      case 'upcoming_event':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleMarkAsRead = (reminderId: string) => {
    reminderService.markAsRead(reminderId);
    setReminders(reminderService.getReminders());
  };

  const handleMarkAllAsRead = () => {
    reminderService.markAllAsRead();
    setReminders(reminderService.getReminders());
  };

  const filteredReminders = reminders.filter(reminder => {
    switch (filter) {
      case 'unread':
        return !reminder.isRead;
      case 'urgent':
        return reminder.priority === 'urgent';
      default:
        return true;
    }
  });

  const unreadCount = reminders.filter(r => !r.isRead).length;
  const urgentCount = reminders.filter(r => r.priority === 'urgent').length;

  return (
    <div className="relative">
      {/* Reminder Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Reminder Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Reminders</h3>
                {unreadCount > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-2 mt-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({reminders.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'unread' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('urgent')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === 'urgent' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Urgent ({urgentCount})
              </button>
            </div>
          </div>

          {/* Reminders List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredReminders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-semibold mb-2">No reminders</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="p-2">
                {filteredReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      reminder.isRead 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-white border-blue-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(reminder.type)}`}>
                        {getTypeIcon(reminder.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-semibold ${reminder.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                            {reminder.title}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                            {reminder.priority}
                          </span>
                        </div>
                        
                        <p className={`text-sm mb-2 ${reminder.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                          {reminder.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeAgo(reminder.createdAt)}
                          </div>
                          
                          {!reminder.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(reminder.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {reminders.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
                <span className="text-xs text-gray-500">
                  {filteredReminders.length} of {reminders.length} reminders
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReminderCenter;
