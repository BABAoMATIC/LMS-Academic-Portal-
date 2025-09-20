import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Notification } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import '../TeacherDashboard.css';
import './EnhancedNotificationCenter.css';

interface NotificationCenterProps {}

const NotificationCenter: React.FC<NotificationCenterProps> = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/teacher/${user?.id}/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await axios.post(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update local state
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post(`/api/teacher/${user?.id}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return '📝';
      case 'quiz':
        return '🧠';
      case 'feedback':
        return '💬';
      case 'submission':
        return '📤';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'quiz':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'feedback':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'submission':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesReadStatus = !showUnreadOnly || !notification.read;
    return matchesType && matchesReadStatus;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="notification-center-container">
      <div className="notification-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Notifications</h2>
            <p className="text-purple-100 mt-1">
              Stay updated with student activities and submissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-purple-100">
              {unreadCount} unread
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all duration-300 text-sm font-medium"
              >
                Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="notification-filters">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="assignment">Assignments</option>
            <option value="quiz">Quizzes</option>
            <option value="feedback">Feedback</option>
            <option value="submission">Submissions</option>
            <option value="general">General</option>
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Show unread only
            </span>
          </label>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredNotifications.length} of {notifications.length} notifications
          </p>
        </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filterType !== 'all' || showUnreadOnly ? 'Try adjusting your filters' : 'You\'re all caught up!'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${!notification.read ? 'unread' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`notification-type-badge ${getNotificationColor(notification.type)}`}>
                      {notification.type}
                    </span>
                    {!notification.read && (
                      <span className="notification-unread-dot"></span>
                    )}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(notification.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-gray-900 dark:text-white mb-3">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>📅 {new Date(notification.timestamp).toLocaleTimeString()}</span>
                      {notification.read && (
                        <span className="text-green-600 dark:text-green-400">✓ Read</span>
                      )}
                    </div>

                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="notification-btn-mark"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      <div className="notification-overview">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Notification Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="notification-stat">
            <div className="notification-stat-number text-blue-600 dark:text-blue-400">
              {notifications.length}
            </div>
            <div className="notification-stat-label">Total</div>
          </div>
          <div className="notification-stat">
            <div className="notification-stat-number text-yellow-600 dark:text-yellow-400">
              {unreadCount}
            </div>
            <div className="notification-stat-label">Unread</div>
          </div>
          <div className="notification-stat">
            <div className="notification-stat-number text-green-600 dark:text-green-400">
              {notifications.filter(n => n.type === 'submission').length}
            </div>
            <div className="notification-stat-label">Submissions</div>
          </div>
          <div className="notification-stat">
            <div className="notification-stat-number text-purple-600 dark:text-purple-400">
              {notifications.filter(n => n.type === 'assignment').length}
            </div>
            <div className="notification-stat-label">Assignments</div>
          </div>
          <div className="notification-stat">
            <div className="notification-stat-number text-orange-600 dark:text-orange-400">
              {notifications.filter(n => n.type === 'quiz').length}
            </div>
            <div className="notification-stat-label">Quizzes</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
