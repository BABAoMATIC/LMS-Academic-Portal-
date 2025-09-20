import React, { useState, useEffect } from 'react';
import { CheckCircle, X, FileText, User, Clock } from 'lucide-react';
import socketService from '../services/socket';
import { useAuth } from '../contexts/AuthContext';

interface SubmissionNotificationProps {
  onClose: () => void;
}

interface SubmissionData {
  submission: {
    id: number;
    student_id: number;
    assignment_id: number;
    file_path: string;
    version: number;
    timestamp: string;
    comments?: string;
    metadata?: {
      original_filename: string;
      file_size: number;
      file_type: string;
    };
  };
  assignment: {
    id: number;
    title: string;
    deadline: string;
  };
  student: {
    id: number;
    name: string;
    email: string;
  };
  message: string;
}

const SubmissionNotification: React.FC<SubmissionNotificationProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<SubmissionData[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'teacher') {
      // Listen for new submission notifications
      const handleNewSubmission = (data: SubmissionData) => {
        setNotifications(prev => [data, ...prev]);
        
        // Auto-remove notification after 10 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.submission.id !== data.submission.id));
        }, 10000);
      };

      socketService.on('new_submission', handleNewSubmission);

      return () => {
        socketService.off('new_submission', handleNewSubmission);
      };
    }
  }, [user?.role]);

  const removeNotification = (submissionId: number) => {
    setNotifications(prev => prev.filter(n => n.submission.id !== submissionId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (user?.role !== 'teacher' || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => (
        <div
          key={notification.submission.id}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-slide-in"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">New Submission</h4>
                <p className="text-sm text-gray-600">{notification.assignment.title}</p>
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.submission.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{notification.student.name}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{formatTimestamp(notification.submission.timestamp)}</span>
            </div>

            {notification.submission.metadata && (
              <div className="bg-gray-50 rounded-md p-2">
                <p className="text-gray-700">
                  <strong>File:</strong> {notification.submission.metadata.original_filename}
                </p>
                <p className="text-gray-600">
                  <strong>Size:</strong> {formatFileSize(notification.submission.metadata.file_size)}
                </p>
                <p className="text-gray-600">
                  <strong>Version:</strong> {notification.submission.version}
                </p>
              </div>
            )}

            {notification.submission.comments && (
              <div className="bg-blue-50 rounded-md p-2">
                <p className="text-blue-800 text-sm">
                  <strong>Comments:</strong> {notification.submission.comments}
                </p>
              </div>
            )}
          </div>

          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => {
                // Navigate to submissions page or open submission details
                window.location.href = `/teacher/submissions/${notification.submission.assignment_id}`;
                removeNotification(notification.submission.id);
              }}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Review Submission
            </button>
            <button
              onClick={() => removeNotification(notification.submission.id)}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubmissionNotification;
