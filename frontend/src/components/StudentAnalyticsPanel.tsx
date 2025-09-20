import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { 
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  BookOpen,
  FileText,
  Award,
  Target,
  MessageSquare,
  Edit3,
  Send,
  X,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface StudentAnalytics {
  student_info: {
    id: number;
    name: string;
    email: string;
    course: string;
    student_id: string;
  };
  kpis: {
    total_quizzes: number;
    total_assignments: number;
    modules_completed: number;
    total_modules: number;
    completion_percentage: number;
    gpa: number;
  };
  quiz_performance: {
    timeline: Array<{
      date: string;
      score: number;
      title: string;
      subject: string;
    }>;
    by_subject: Record<string, number>;
  };
  assignment_performance: Array<{
    title: string;
    subject: string;
    grade: number | null;
    submitted_at: string;
    feedback: string | null;
  }>;
  module_progress: Array<{
    id: number;
    name: string;
    description: string;
    progress_percentage: number;
    is_completed: boolean;
  }>;
}

interface RecentActivity {
  recent_activity: Array<{
    id: number;
    type: 'assignment' | 'quiz';
    title: string;
    subject: string;
    grade?: number;
    score?: number;
    feedback?: string;
    date: string;
  }>;
}

interface StudentAnalyticsPanelProps {
  studentId: number;
  onClose: () => void;
}

const StudentAnalyticsPanel: React.FC<StudentAnalyticsPanelProps> = ({ 
  studentId, 
  onClose 
}) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showRemarksForm, setShowRemarksForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [remarksText, setRemarksText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [analyticsData, recentData] = await Promise.all([
        apiService.getStudentAnalytics(studentId),
        apiService.getStudentRecentSubmissions(studentId)
      ]);
      
      setAnalytics(analyticsData);
      setRecentActivity(recentData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (studentId) {
      fetchAnalyticsData();
    }
  }, [studentId, fetchAnalyticsData]);

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) return;
    
    try {
      setSubmitting(true);
      
      await apiService.addStudentFeedback(studentId, {
        teacher_id: user!.id,
        feedback_text: feedbackText.trim(),
        feedback_type: 'general'
      });
      
      setFeedbackText('');
      setShowFeedbackForm(false);
      await fetchAnalyticsData(); // Refresh data
      
      alert('Feedback submitted successfully!');
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitRemarks = async () => {
    if (!remarksText.trim()) return;
    
    try {
      setSubmitting(true);
      
      await apiService.addStudentRemarks(studentId, {
        teacher_id: user!.id,
        remarks_text: remarksText.trim(),
        remarks_category: 'performance'
      });
      
      setRemarksText('');
      setShowRemarksForm(false);
      await fetchAnalyticsData(); // Refresh data
      
      alert('Remarks submitted successfully!');
    } catch (err: any) {
      console.error('Error submitting remarks:', err);
      alert('Failed to submit remarks. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return 'text-gray-500';
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading student analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error || 'Failed to load analytics'}</p>
            <div className="flex space-x-3">
              <button
                onClick={fetchAnalyticsData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Student Analytics: {analytics.student_info.name}
              </h2>
              <p className="text-gray-600">
                {analytics.student_info.course} • ID: {analytics.student_info.student_id}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFeedbackForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Feedback
              </button>
              
              <button
                onClick={() => setShowRemarksForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Add Remarks
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Total Quizzes</p>
                  <p className="text-2xl font-bold text-blue-900">{analytics.kpis.total_quizzes}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Assignments</p>
                  <p className="text-2xl font-bold text-green-900">{analytics.kpis.total_assignments}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Modules</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {analytics.kpis.modules_completed}/{analytics.kpis.total_modules}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-600">GPA</p>
                  <p className="text-2xl font-bold text-orange-900">{analytics.kpis.gpa}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quiz Performance Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <LineChart className="h-5 w-5 mr-2 text-blue-600" />
                Quiz Performance Over Time
              </h3>
              
              {analytics.quiz_performance.timeline.length > 0 ? (
                <div className="space-y-3">
                  {analytics.quiz_performance.timeline.map((quiz, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{quiz.title}</p>
                        <p className="text-sm text-gray-600">{quiz.subject}</p>
                        <p className="text-xs text-gray-500">{formatDate(quiz.date)}</p>
                      </div>
                      <div className={`text-lg font-bold ${getGradeColor(quiz.score)}`}>
                        {quiz.score}%
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No quiz attempts yet</p>
              )}
            </div>

            {/* Subject Performance */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                Performance by Subject
              </h3>
              
              {Object.keys(analytics.quiz_performance.by_subject).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(analytics.quiz_performance.by_subject).map(([subject, score]) => (
                    <div key={subject} className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{subject}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No subject performance data</p>
              )}
            </div>
          </div>

          {/* Module Progress */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
              Module Progress
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.module_progress.map((module) => (
                <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{module.name}</h4>
                    {module.is_completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className={`font-medium ${getProgressColor(module.progress_percentage)}`}>
                        {module.progress_percentage}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          module.progress_percentage >= 80 ? 'bg-green-600' :
                          module.progress_percentage >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${module.progress_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          {recentActivity && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                Recent Activity
              </h3>
              
              <div className="space-y-3">
                {recentActivity.recent_activity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'quiz' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        {activity.type === 'quiz' ? (
                          <Award className="h-4 w-4 text-blue-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.subject}</p>
                        <p className="text-xs text-gray-500">{formatDate(activity.date)}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {activity.type === 'quiz' ? (
                        <span className={`font-bold ${getGradeColor(activity.score || null)}`}>
                          {activity.score}%
                        </span>
                      ) : (
                        <span className={`font-bold ${getGradeColor(activity.grade || null)}`}>
                          {activity.grade !== null ? `${activity.grade}%` : 'Not graded'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Form Modal */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Feedback</h3>
            
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Enter your feedback for the student..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            
            <div className="flex space-x-3">
              <button
                onClick={handleSubmitFeedback}
                disabled={!feedbackText.trim() || submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4 mr-2 inline" />
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
              
              <button
                onClick={() => setShowFeedbackForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remarks Form Modal */}
      {showRemarksForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Remarks</h3>
            
            <textarea
              value={remarksText}
              onChange={(e) => setRemarksText(e.target.value)}
              placeholder="Enter your remarks about the student's performance..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            
            <div className="flex space-x-3">
              <button
                onClick={handleSubmitRemarks}
                disabled={!remarksText.trim() || submitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Edit3 className="h-4 w-4 mr-2 inline" />
                {submitting ? 'Submitting...' : 'Submit Remarks'}
              </button>
              
              <button
                onClick={() => setShowRemarksForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnalyticsPanel;
