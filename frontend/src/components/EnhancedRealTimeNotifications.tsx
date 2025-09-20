import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Star, 
  MessageCircle, 
  FileText, 
  Award,
  TrendingUp,
  Clock,
  X,
  Eye,
  Trash2,
  Filter,
  Search,
  Settings,
  Zap,
  Heart,
  ThumbsUp
} from 'lucide-react';
import '../styles/enhanced-styles.css';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'achievement';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'assignment' | 'quiz' | 'feedback' | 'system' | 'achievement';
  actionUrl?: string;
  actionText?: string;
}

interface EnhancedRealTimeNotificationsProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onNotificationClick: (notification: Notification) => void;
}

const EnhancedRealTimeNotifications: React.FC<EnhancedRealTimeNotificationsProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  onNotificationClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnimations, setShowAnimations] = useState(false);

  useEffect(() => {
    setShowAnimations(true);
  }, []);

  const getNotificationIcon = (type: string, category: string) => {
    if (category === 'achievement') return <Award className="w-5 h-5" />;
    if (category === 'assignment') return <FileText className="w-5 h-5" />;
    if (category === 'quiz') return <TrendingUp className="w-5 h-5" />;
    if (category === 'feedback') return <MessageCircle className="w-5 h-5" />;
    
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'border-red-500 bg-red-50';
    if (priority === 'high') return 'border-orange-500 bg-orange-50';
    
    switch (type) {
      case 'success': return 'border-green-500 bg-green-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'error': return 'border-red-500 bg-red-50';
      case 'achievement': return 'border-purple-500 bg-purple-50';
      default: return 'border-blue-500 bg-blue-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <Zap className="w-4 h-4 text-red-600" />;
      case 'high': return <Star className="w-4 h-4 text-orange-600" />;
      case 'medium': return <Clock className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notification.read) ||
                         (filter === 'urgent' && notification.priority === 'urgent');
    
    const matchesSearch = searchTerm === '' ||
                         notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
        {urgentCount > 0 && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-bounce"></div>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-fade-in-down">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="enhanced-flex enhanced-flex--between mb-4">
              <h2 className="enhanced-heading enhanced-heading--h4">Notifications</h2>
              <div className="enhanced-flex gap-2">
                <button
                  onClick={onMarkAllAsRead}
                  className="enhanced-btn enhanced-btn--outline"
                  disabled={unreadCount === 0}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark All Read
                </button>
                <button
                  onClick={onClearAll}
                  className="enhanced-btn enhanced-btn--outline text-red-600 border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="enhanced-input pl-10 w-full"
                />
              </div>
              <div className="enhanced-flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`enhanced-btn ${filter === 'all' ? 'enhanced-btn--primary' : 'enhanced-btn--outline'}`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`enhanced-btn ${filter === 'unread' ? 'enhanced-btn--primary' : 'enhanced-btn--outline'}`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setFilter('urgent')}
                  className={`enhanced-btn ${filter === 'urgent' ? 'enhanced-btn--primary' : 'enhanced-btn--outline'}`}
                >
                  Urgent ({urgentCount})
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No notifications found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-all duration-200 cursor-pointer ${
                      showAnimations ? 'animate-fade-in-up' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => onNotificationClick(notification)}
                  >
                    <div className={`border-l-4 p-3 rounded-r-lg ${getNotificationColor(notification.type, notification.priority)}`}>
                      <div className="enhanced-flex enhanced-flex--between mb-2">
                        <div className="enhanced-flex gap-2">
                          {getNotificationIcon(notification.type, notification.category)}
                          <h3 className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notification.title}
                          </h3>
                        </div>
                        <div className="enhanced-flex gap-2">
                          {getPriorityIcon(notification.priority)}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <p className={`enhanced-text enhanced-text--small mb-3 ${
                        notification.read ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      <div className="enhanced-flex enhanced-flex--between">
                        <span className="enhanced-text enhanced-text--small text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        <div className="enhanced-flex gap-2">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsRead(notification.id);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(notification.id);
                            }}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {notification.actionText && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNotificationClick(notification);
                          }}
                          className="mt-2 enhanced-btn enhanced-btn--primary"
                        >
                          {notification.actionText}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="enhanced-flex enhanced-flex--between">
              <span className="enhanced-text enhanced-text--small text-gray-600">
                {filteredNotifications.length} notifications
              </span>
              <button className="enhanced-text enhanced-text--small text-blue-600 hover:text-blue-800">
                View All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedRealTimeNotifications;
