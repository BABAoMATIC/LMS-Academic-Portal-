import React from 'react';
import { Bell, MessageCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

interface NotificationsPreviewCardProps {
  notifications: Notification[];
  loading: boolean;
  onNotificationUpdate?: () => void;
}

const NotificationsPreviewCard: React.FC<NotificationsPreviewCardProps> = ({ 
  notifications, 
  loading, 
  onNotificationUpdate 
}) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const recentNotifications = notifications.slice(0, 5);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const handleMarkAsRead = (notificationId: number) => {
    // TODO: Implement mark as read functionality
    console.log('Mark as read:', notificationId);
    onNotificationUpdate?.();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <Bell className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {unreadNotifications.length} unread
            </p>
          </div>
        </div>
        {unreadNotifications.length > 0 && (
          <button
            onClick={() => {
              // TODO: Implement mark all as read
              console.log('Mark all as read');
              onNotificationUpdate?.();
            }}
            className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {notifications.length > 0 ? (
          recentNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${
                notification.is_read 
                  ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700' 
                  : getNotificationColor(notification.type)
              } ${!notification.is_read ? 'ring-2 ring-orange-200 dark:ring-orange-800' : ''}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className={`text-sm font-medium truncate ${
                    notification.is_read 
                      ? 'text-gray-600 dark:text-gray-400' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {notification.title}
                  </h4>
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                    >
                      Mark read
                    </button>
                  )}
                </div>
                <p className={`text-xs line-clamp-2 mb-2 ${
                  notification.is_read 
                    ? 'text-gray-500 dark:text-gray-500' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {notification.message}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                  <span>{getTimeAgo(notification.created_at)}</span>
                  {notification.action_url && (
                    <button className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
                      View details
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No notifications</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              You're all caught up!
            </p>
          </div>
        )}
      </div>

      {notifications.length > 5 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
            View all {notifications.length} notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPreviewCard;
