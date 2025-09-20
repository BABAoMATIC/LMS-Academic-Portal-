import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Star, 
  TrendingUp,
  Calendar,
  User,
  MessageCircle,
  Download,
  Eye,
  Edit,
  Trash2,
  Send,
  Award,
  Target,
  Zap
} from 'lucide-react';
import '../styles/enhanced-styles.css';

interface AssignmentStatus {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  submission_date?: string;
  grade?: number;
  max_marks: number;
  feedback?: string;
  file_path?: string;
  file_name?: string;
  file_type?: string;
  file_size?: string;
}

interface EnhancedAssignmentStatusProps {
  assignment: AssignmentStatus;
  onViewDetails?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onPreview?: () => void;
  onSubmit?: () => void;
  onViewFeedback?: () => void;
}

const EnhancedAssignmentStatus: React.FC<EnhancedAssignmentStatusProps> = ({
  assignment,
  onViewDetails,
  onEdit,
  onDelete,
  onDownload,
  onPreview,
  onSubmit,
  onViewFeedback
}) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
    animateProgress();
    checkOverdue();
  }, [assignment]);

  const animateProgress = () => {
    const duration = 1500;
    const steps = 60;
    const targetProgress = getProgressValue();
    const increment = targetProgress / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetProgress) {
        setProgressValue(targetProgress);
        clearInterval(timer);
      } else {
        setProgressValue(Math.floor(current));
      }
    }, duration / steps);
  };

  const checkOverdue = () => {
    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    setIsOverdue(now > dueDate && assignment.status === 'pending');
  };

  const getProgressValue = () => {
    switch (assignment.status) {
      case 'pending': return 25;
      case 'submitted': return 75;
      case 'graded': return 100;
      case 'late': return 25;
      default: return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'submitted': return 'text-blue-600 bg-blue-100';
      case 'graded': return 'text-green-600 bg-green-100';
      case 'late': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'submitted': return <Upload className="w-5 h-5" />;
      case 'graded': return <CheckCircle className="w-5 h-5" />;
      case 'late': return <AlertCircle className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getGradeColor = (grade?: number, maxMarks?: number) => {
    if (!grade || !maxMarks) return 'text-gray-600';
    const percentage = (grade / maxMarks) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = () => {
    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `${diffDays} days remaining`;
  };

  return (
    <div className={`enhanced-card ${showAnimation ? 'animate-fade-in-up' : ''} ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}>
      {/* Header */}
      <div className="enhanced-flex enhanced-flex--between mb-4">
        <div className="flex-1">
          <h3 className="enhanced-heading enhanced-heading--h4 mb-2">
            {assignment.title}
          </h3>
          <p className="enhanced-text enhanced-text--small mb-3">
            {assignment.description}
          </p>
          <div className="enhanced-flex gap-4 text-sm">
            <div className="enhanced-flex gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Due: {formatDate(assignment.due_date)}</span>
            </div>
            <div className="enhanced-flex gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                {getTimeRemaining()}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={`enhanced-badge ${getStatusColor(assignment.status)} mb-2`}>
            <div className="enhanced-flex gap-2">
              {getStatusIcon(assignment.status)}
              <span className="capitalize">{assignment.status}</span>
            </div>
          </div>
          {assignment.grade && (
            <div className={`text-2xl font-bold ${getGradeColor(assignment.grade, assignment.max_marks)}`}>
              {assignment.grade}/{assignment.max_marks}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="enhanced-flex enhanced-flex--between mb-2">
          <span className="enhanced-text enhanced-text--small">Progress</span>
          <span className="enhanced-text enhanced-text--small">{progressValue}%</span>
        </div>
        <div className="enhanced-progress">
          <div 
            className="enhanced-progress__bar"
            style={{ width: `${progressValue}%` }}
          ></div>
        </div>
      </div>

      {/* Submission Details */}
      {assignment.status !== 'pending' && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Submission Details</h4>
          <div className="enhanced-grid enhanced-grid--2 gap-4">
            <div>
              <span className="enhanced-text enhanced-text--small text-gray-600">Submitted:</span>
              <p className="font-medium">{assignment.submission_date ? formatDate(assignment.submission_date) : 'N/A'}</p>
            </div>
            {assignment.file_name && (
              <div>
                <span className="enhanced-text enhanced-text--small text-gray-600">File:</span>
                <p className="font-medium">{assignment.file_name}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grade and Feedback */}
      {assignment.status === 'graded' && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="enhanced-flex enhanced-flex--between mb-3">
            <h4 className="font-semibold text-green-900">Grade & Feedback</h4>
            <div className={`text-3xl font-bold ${getGradeColor(assignment.grade, assignment.max_marks)}`}>
              {assignment.grade}/{assignment.max_marks}
            </div>
          </div>
          {assignment.feedback && (
            <p className="enhanced-text text-green-800 mb-3">
              {assignment.feedback}
            </p>
          )}
          <button
            onClick={onViewFeedback}
            className="enhanced-btn enhanced-btn--success"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            View Full Feedback
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="enhanced-flex gap-3 flex-wrap">
        {assignment.status === 'pending' && (
          <button
            onClick={onSubmit}
            className="enhanced-btn enhanced-btn--primary"
          >
            <Upload className="w-4 h-4 mr-2" />
            Submit Assignment
          </button>
        )}
        
        {assignment.file_path && (
          <>
            <button
              onClick={onDownload}
              className="enhanced-btn enhanced-btn--outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
            <button
              onClick={onPreview}
              className="enhanced-btn enhanced-btn--outline"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
          </>
        )}

        <button
          onClick={onViewDetails}
          className="enhanced-btn enhanced-btn--outline"
        >
          <FileText className="w-4 h-4 mr-2" />
          View Details
        </button>

        {assignment.status === 'pending' && (
          <>
            <button
              onClick={onEdit}
              className="enhanced-btn enhanced-btn--outline"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="enhanced-btn enhanced-btn--outline text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
          </>
        )}
      </div>

      {/* Overdue Warning */}
      {isOverdue && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
          <div className="enhanced-flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800 font-medium">
              This assignment is overdue! Please submit as soon as possible.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAssignmentStatus;
