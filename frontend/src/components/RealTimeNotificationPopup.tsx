import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Star, MessageCircle, BookOpen, Award } from 'lucide-react';
import notificationService from '../services/notificationService';

interface NotificationPopup {
  id: string;
  type: 'assignment_submitted' | 'quiz_completed' | 'assignment_graded' | 'quiz_graded' | 'feedback_provided' | 'assignment_created' | 'quiz_created';
  title: string;
  message: string;
  data: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

const RealTimeNotificationPopup: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationPopup[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Subscribe to all notification types
    const unsubscribe = notificationService.subscribe('all', (notification) => {
      const popupNotification: NotificationPopup = {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        timestamp: notification.timestamp,
        priority: notification.priority
      };

      setNotifications(prev => [popupNotification, ...prev.slice(0, 4)]); // Keep only 5 most recent
      setIsVisible(true);

      // Auto-hide after delay based on priority
      const delay = notification.priority === 'urgent' ? 10000 : 
                   notification.priority === 'high' ? 8000 : 
                   notification.priority === 'medium' ? 6000 : 4000;
      
      setTimeout(() => {
        setIsVisible(false);
      }, delay);
    });

    return unsubscribe;
  }, []);

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = `w-6 h-6 ${
      priority === 'urgent' ? 'text-red-500' :
      priority === 'high' ? 'text-orange-500' :
      priority === 'medium' ? 'text-blue-500' : 'text-green-500'
    }`;

    switch (type) {
      case 'assignment_submitted':
        return <BookOpen className={iconClass} />;
      case 'quiz_completed':
        return <Award className={iconClass} />;
      case 'assignment_graded':
      case 'quiz_graded':
        return <CheckCircle className={iconClass} />;
      case 'feedback_provided':
        return <MessageCircle className={iconClass} />;
      case 'assignment_created':
      case 'quiz_created':
        return <AlertCircle className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-green-500 bg-green-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">URGENT</span>;
      case 'high':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">HIGH</span>;
      case 'medium':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">MEDIUM</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">LOW</span>;
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notifications.length === 1) {
      setIsVisible(false);
    }
  };

  const dismissAll = () => {
    setNotifications([]);
    setIsVisible(false);
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`relative transform transition-all duration-300 ease-in-out border-l-4 shadow-lg rounded-lg p-4 ${getPriorityColor(notification.priority)}`}
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          {/* Close button */}
          <button
            onClick={() => dismissNotification(notification.id)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Notification content */}
          <div className="flex items-start space-x-3 pr-6">
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type, notification.priority)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {notification.title}
                </h4>
                {getPriorityBadge(notification.priority)}
              </div>
              
              <p className="text-sm text-gray-700 mb-2">
                {notification.message}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {notification.timestamp.toLocaleTimeString()}
                </span>
                
                {/* Action buttons based on notification type */}
                <div className="flex space-x-2">
                  {notification.type === 'assignment_graded' && (
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      View Feedback
                    </button>
                  )}
                  {notification.type === 'quiz_graded' && (
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      View Results
                    </button>
                  )}
                  {notification.type === 'feedback_provided' && (
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      Read Feedback
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar for auto-dismiss */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"
              style={{
                animation: 'shrink 4s linear forwards'
              }}
            />
          </div>
        </div>
      ))}

      {/* Dismiss all button */}
      {notifications.length > 1 && (
        <div className="text-center">
          <button
            onClick={dismissAll}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium"
          >
            Dismiss All
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default RealTimeNotificationPopup;
