import React from 'react';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

interface Submission {
  id: number;
  assignment_title?: string;
  title?: string;
  module_name: string;
  submitted_at: string;
  status: 'submitted' | 'graded' | 'late';
  grade?: number;
  max_points?: number;
  feedback?: string;
}

interface SubmissionsPreviewCardProps {
  submissions: Submission[];
  loading: boolean;
}

const SubmissionsPreviewCard: React.FC<SubmissionsPreviewCardProps> = ({ submissions, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const gradedSubmissions = submissions.filter(s => s.status === 'graded');
  const pendingSubmissions = submissions.filter(s => s.status === 'submitted');
  const lateSubmissions = submissions.filter(s => s.status === 'late');

  const getStatusIcon = (submission: Submission) => {
    switch (submission.status) {
      case 'graded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'submitted':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'late':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (submission: Submission) => {
    switch (submission.status) {
      case 'graded':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'submitted':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'late':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getGradeColor = (grade: number, maxPoints: number) => {
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
          <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Submissions</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {submissions.length} total submissions
          </p>
        </div>
      </div>

      {/* Submission Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {gradedSubmissions.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Graded</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {pendingSubmissions.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {lateSubmissions.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Late</div>
        </div>
      </div>

      {/* Submission List */}
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {submissions.length > 0 ? (
          submissions.slice(0, 3).map((submission) => (
            <div key={submission.id} className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor(submission)}`}>
              <div className="flex-shrink-0">
                {getStatusIcon(submission)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {submission.assignment_title || submission.title}
                  </h4>
                  {submission.status === 'graded' && submission.grade !== undefined && submission.max_points && (
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getGradeColor(submission.grade, submission.max_points)} bg-opacity-20`}>
                      {submission.grade}/{submission.max_points}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span className="truncate">{submission.module_name}</span>
                  <span className="font-medium">{getTimeAgo(submission.submitted_at)}</span>
                </div>
                {submission.feedback && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                    {submission.feedback}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No submissions yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Submit your first assignment to see it here
            </p>
          </div>
        )}
      </div>

      {submissions.length > 3 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors">
            View all {submissions.length} submissions
          </button>
        </div>
      )}
    </div>
  );
};

export default SubmissionsPreviewCard;
