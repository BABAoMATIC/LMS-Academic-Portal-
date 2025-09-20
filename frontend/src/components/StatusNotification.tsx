import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, X } from 'lucide-react';
import statusService, { StatusUpdate } from '../services/statusService';

interface StatusNotificationProps {
  userId: number;
  userRole: 'student' | 'teacher';
}

interface NotificationItem {
  id: string;
  type: 'assignment_status_update' | 'quiz_status_update' | 'assignment_graded' | 'quiz_graded';
  data: StatusUpdate;
  timestamp: Date;
}

const StatusNotification: React.FC<StatusNotificationProps> = ({ userId, userRole }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    // Subscribe to status update events
    const unsubscribeAssignmentStatus = statusService.on('assignment_status_update', (data: StatusUpdate) => {
      if (data.student_id === userId || userRole === 'teacher') {
        addNotification('assignment_status_update', data);
      }
    });

    const unsubscribeQuizStatus = statusService.on('quiz_status_update', (data: StatusUpdate) => {
      if (data.student_id === userId || userRole === 'teacher') {
        addNotification('quiz_status_update', data);
      }
    });

    const unsubscribeAssignmentGraded = statusService.on('assignment_graded', (data: StatusUpdate) => {
      if (data.student_id === userId || userRole === 'teacher') {
        addNotification('assignment_graded', data);
      }
    });

    const unsubscribeQuizGraded = statusService.on('quiz_graded', (data: StatusUpdate) => {
      if (data.student_id === userId || userRole === 'teacher') {
        addNotification('quiz_graded', data);
      }
    });

    return () => {
      unsubscribeAssignmentStatus();
      unsubscribeQuizStatus();
      unsubscribeAssignmentGraded();
      unsubscribeQuizGraded();
    };
  }, [userId, userRole]);

  const addNotification = (type: NotificationItem['type'], data: StatusUpdate) => {
    const notification: NotificationItem = {
      id: `${type}_${data.assignment_id || data.quiz_id}_${Date.now()}`,
      type,
      data,
      timestamp: new Date()
    };

    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep only last 5 notifications

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'assignment_status_update':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'quiz_status_update':
        return <Clock className="w-5 h-5 text-purple-600" />;
      case 'assignment_graded':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'quiz_graded':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: NotificationItem['type']) => {
    switch (type) {
      case 'assignment_status_update':
        return 'border-blue-200 bg-blue-50';
      case 'quiz_status_update':
        return 'border-purple-200 bg-purple-50';
      case 'assignment_graded':
        return 'border-green-200 bg-green-50';
      case 'quiz_graded':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'graded':
        return 'Graded';
      case 'attempted':
        return 'Attempted';
      case 'not_attempted':
        return 'Not Attempted';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm p-4 rounded-lg border shadow-lg animate-slide-in ${getNotificationColor(notification.type)}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {notification.type.includes('assignment') ? 'Assignment' : 'Quiz'} Update
                </p>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {notification.data.message}
              </p>
              {notification.data.marks_obtained !== undefined && (
                <p className="text-xs text-gray-500 mt-1">
                  Score: {notification.data.marks_obtained}/{notification.data.total_marks} 
                  ({notification.data.percentage?.toFixed(1)}%)
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatusNotification;
