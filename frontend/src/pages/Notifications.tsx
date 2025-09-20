import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Filter,
  Search,
  Eye,
  EyeOff,
  MessageSquare,
  FileText,
  Award,
  BookOpen,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

interface Notification {
  id: number;
  title?: string;
  message: string;
  type: string;
  created_at?: string;
  timestamp?: string;
  is_read?: boolean;
  read?: boolean;
  related_id?: number;
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false); // Set to false for demo
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter state
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const notificationsData = await apiService.getUserNotifications(user!.id);
      setNotifications(notificationsData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshNotifications = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchNotifications();
    } finally {
      setRefreshing(false);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Mock data for demo
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: 1,
        title: "New Assignment Posted",
        message: "Mathematics Assignment 2 has been posted. Due date: February 15th, 2024.",
        type: "assignment",
        created_at: "2024-01-28T10:30:00Z",
        is_read: false
      },
      {
        id: 2,
        title: "Quiz Results Available",
        message: "Your Physics Quiz results are now available. Score: 85/100",
        type: "grade",
        created_at: "2024-01-27T14:15:00Z",
        is_read: false
      },
      {
        id: 3,
        title: "Module Update",
        message: "New learning materials have been added to the Computer Science module.",
        type: "module",
        created_at: "2024-01-26T09:45:00Z",
        is_read: true
      },
      {
        id: 4,
        title: "Feedback Received",
        message: "Your English Essay has received feedback from the instructor.",
        type: "feedback",
        created_at: "2024-01-25T16:20:00Z",
        is_read: true
      },
      {
        id: 5,
        title: "Reminder: Upcoming Deadline",
        message: "Reminder: Literature Analysis assignment is due in 3 days.",
        type: "reminder",
        created_at: "2024-01-24T11:00:00Z",
        is_read: false
      },
      {
        id: 6,
        title: "Achievement Unlocked",
        message: "Congratulations! You've completed 10 assignments this month.",
        type: "achievement",
        created_at: "2024-01-23T13:30:00Z",
        is_read: true
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (user?.id) {
        refreshNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, refreshNotifications]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await apiService.markNotificationSeen(notificationId, user!.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsSeen(user!.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await apiService.deleteNotification(notificationId, user!.id);
      
      // Remove from local state
      setNotifications(prev => 
        prev.filter(notif => notif.id !== notificationId)
      );
    } catch (err: any) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      try {
        await apiService.clearAllNotifications(user!.id);
        setNotifications([]);
      } catch (err: any) {
        console.error('Error clearing all notifications:', err);
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return <Award className="h-5 w-5 text-purple-500" />;
      case 'assignment':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'grade':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'feedback':
        return <MessageSquare className="h-5 w-5 text-yellow-500" />;
      case 'module':
        return <BookOpen className="h-5 w-5 text-indigo-500" />;
      case 'resource':
        return <BookOpen className="h-5 w-5 text-teal-500" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'achievement':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'general':
        return <Bell className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const isRead = notification.is_read || notification.read || false;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'read' && isRead) ||
      (statusFilter === 'unread' && !isRead);
    const matchesSearch = (notification.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (notification.message || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const types = Array.from(new Set(notifications.map(n => n.type)));
  const unreadCount = notifications.filter(n => !(n.is_read || n.read || false)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  className="mt-3 bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm hover:bg-red-200"
                  onClick={fetchNotifications}
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        {/* Header */}
        <div className="notifications-header">
          <div className="header-content">
            <div className="header-info">
              <h1>Notifications</h1>
              <p>
                You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="header-actions">
              <button
                onClick={refreshNotifications}
                disabled={refreshing}
                className="header-button refresh"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="header-button mark-read"
                >
                  <Eye className="h-4 w-4" />
                  Mark All Read
                </button>
              )}
              
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="header-button clear-all"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="notifications-filters">
          <div className="filters-grid">
            {/* Search */}
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              {types.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>

            {/* Results Count */}
            <div className="results-count">
              {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
              >
                <div className="card-content">
                  {/* Icon */}
                  <div className="card-icon">
                    {getTypeIcon(notification.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="card-main">
                    <div className="card-header">
                      <h3 className={`card-title ${!(notification.is_read || notification.read || false) ? 'unread' : ''}`}>
                        {notification.title || notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                      </h3>
                      
                      <span className={`type-badge ${notification.type}`}>
                        {notification.type}
                      </span>
                      
                      {!(notification.is_read || notification.read || false) && (
                        <span className="new-badge">
                          New
                        </span>
                      )}
                    </div>
                    
                    <p className="card-message">{notification.message}</p>
                    
                    <div className="card-timestamp">
                      <Clock className="timestamp-icon" />
                      {formatDate(notification.created_at || notification.timestamp || new Date().toISOString())}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="card-actions">
                    {!(notification.is_read || notification.read || false) ? (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="action-button mark-read"
                        title="Mark as read"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="action-button mark-unread"
                        title="Mark as unread"
                      >
                        <EyeOff className="h-4 w-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="action-button delete"
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="notifications-empty">
              <Bell className="empty-icon" />
              <h3 className="empty-title">No notifications found</h3>
              <p className="empty-description">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'You\'re all caught up! Check back later for new updates.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
