import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Clock, BookOpen, FileText, MessageSquare } from 'lucide-react';
import notificationService, { NotificationData } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

interface RealTimeNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const RealTimeNotificationCenter: React.FC<RealTimeNotificationCenterProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Connect to notification service
    notificationService.connect(user.id, user.role);

    // Subscribe to all notifications
    const unsubscribe = notificationService.subscribeToAllNotifications((notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50 notifications
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
      }
    });

    // Request notification permission
    notificationService.requestNotificationPermission();

    return () => {
      unsubscribe();
    };
  }, [user]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const removeNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment_submitted':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'assignment_graded':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'assignment_created':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'quiz_completed':
        return <BookOpen className="w-5 h-5 text-orange-600" />;
      case 'quiz_graded':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'quiz_created':
        return <BookOpen className="w-5 h-5 text-purple-600" />;
      case 'feedback_provided':
        return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'border-red-200 bg-red-50';
    if (priority === 'high') return 'border-orange-200 bg-orange-50';
    if (priority === 'medium') return 'border-blue-200 bg-blue-50';
    return 'border-gray-200 bg-gray-50';
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Bell className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No notifications yet</p>
                <p className="text-sm">You'll see real-time updates here</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${getNotificationColor(notification.type, notification.priority)} ${
                      !notification.read ? 'ring-2 ring-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        {notification.priority === 'urgent' && (
                          <div className="flex items-center mt-2 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Urgent
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 hover:bg-white rounded-full transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircle className="w-4 h-4 text-gray-400 hover:text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="p-1 hover:bg-white rounded-full transition-colors"
                          title="Remove notification"
                        >
                          <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${notificationService.isSocketConnected() ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>
                  {notificationService.isSocketConnected() ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <span>
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeNotificationCenter;
