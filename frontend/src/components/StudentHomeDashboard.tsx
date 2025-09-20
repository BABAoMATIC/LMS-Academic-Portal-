import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { useUserIdValidation } from '../hooks/useUserIdValidation';
import statusService from '../services/statusService';
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Bell, 
  MessageCircle,
  BarChart3,
  FolderOpen,
  MessageSquare,
  FileText
} from 'lucide-react';
import ModulePreviewCard from './dashboard/ModulePreviewCard';
import QuizPreviewCard from './dashboard/QuizPreviewCard';
import SubmissionsPreviewCard from './dashboard/SubmissionsPreviewCard';
import NotificationsPreviewCard from './dashboard/NotificationsPreviewCard';
import CalendarPreviewCard from './dashboard/CalendarPreviewCard';
import ProfilePreviewCard from './dashboard/ProfilePreviewCard';
import EnhancedAnalytics from './EnhancedAnalytics';
import ProgressTracker from './ProgressTracker';

import { useNavigate } from 'react-router-dom';

interface StudentDashboardData {
  student: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  modules: Array<{
    id: number;
    name: string;
    code: string;
    description: string;
    progress_percentage: number;
    is_completed: boolean;
  }>;
  recent_assignments: Array<{
    id: number;
    title: string;
    due_date: string;
    module_name: string;
  }>;
  recent_quizzes: Array<{
    id: number;
    title: string;
    module_name: string;
    score?: number;
    status: 'attempted' | 'not_attempted';
    due_date: string;
    duration: number;
  }>;
  recent_submissions: Array<{
    id: number;
    assignment_title?: string;
    title?: string;
    module_name: string;
    submitted_at: string;
    status: 'submitted' | 'graded' | 'late';
    grade?: number;
    max_points?: number;
    feedback?: string;
  }>;
  overall_progress: number;
  recent_feedback: Array<{
    id: number;
    message: string;
    timestamp: string;
  }>;
}

const StudentHomeDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use the user ID validation hook
  const { isValidating, error: validationError, retryValidation } = useUserIdValidation();


  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    // Prevent multiple simultaneous calls
    if (loading) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Attempting to fetch dashboard for user ID:', user.id);
      
      const response = await apiService.getStudentDashboard(user.id);
      console.log('Dashboard API Response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      console.log('Response.data:', response?.data);
      
      // Handle different response formats
      let dashboardData;
      if (response && response.data) {
        dashboardData = response.data;
      } else if (response && typeof response === 'object' && !response.data) {
        // Direct object response
        dashboardData = response;
      } else {
        console.error('Invalid dashboard data structure:', response);
        throw new Error('Invalid dashboard data received');
      }
      
      // Transform the data to match the expected interface
      const transformedData = {
        student: dashboardData.user,
        modules: dashboardData.modules || [],
        recent_assignments: dashboardData.recent_assignments || [],
        recent_quizzes: dashboardData.recent_quizzes || [],
        recent_submissions: dashboardData.recent_submissions || [],
        recent_feedback: dashboardData.recent_feedback || [],
        overall_progress: dashboardData.overview?.overall_progress || 0
      };
      
      console.log('Parsed dashboard data:', transformedData);
      setDashboardData(transformedData);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      
      // Check if it's a 404 error (user not found)
      if (err.response?.status === 404) {
        console.log('🚨 User ID not found, attempting to fix...');
        setError('User account not found. Please try fixing your account or log in again.');
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time listeners for dashboard updates
    const handleQuizCompleted = () => {
      console.log('🔄 Quiz completed, refreshing dashboard...');
      fetchDashboardData();
    };
    
    const handleAssignmentSubmitted = () => {
      console.log('🔄 Assignment submitted, refreshing dashboard...');
      fetchDashboardData();
    };
    
    const handleFeedbackReceived = () => {
      console.log('🔄 Feedback received, refreshing dashboard...');
      fetchDashboardData();
    };
    
    // Listen for real-time events and get unsubscribe functions
    const unsubscribeQuiz = statusService.on('quiz_status_update', handleQuizCompleted);
    const unsubscribeAssignment = statusService.on('assignment_status_update', handleAssignmentSubmitted);
    const unsubscribeAssignmentGraded = statusService.on('assignment_graded', handleFeedbackReceived);
    const unsubscribeQuizGraded = statusService.on('quiz_graded', handleFeedbackReceived);
    const unsubscribeAssignmentSubmitted = statusService.on('assignment_submitted', handleAssignmentSubmitted);
    const unsubscribeQuizCompleted = statusService.on('quiz_completed', handleQuizCompleted);
    const unsubscribeFeedbackProvided = statusService.on('feedback_provided', handleFeedbackReceived);
    
    // Cleanup listeners on unmount
    return () => {
      unsubscribeQuiz();
      unsubscribeAssignment();
      unsubscribeAssignmentGraded();
      unsubscribeQuizGraded();
      unsubscribeAssignmentSubmitted();
      unsubscribeQuizCompleted();
      unsubscribeFeedbackProvided();
    };
  }, [fetchDashboardData]);

  if (loading || isValidating) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        {isValidating && (
          <p className="loading-message">Validating your account...</p>
        )}
      </div>
    );
  }

  if (error || validationError) {
    return (
      <div className="error-container">
        <div className="text-center">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Oops! Something went wrong</h2>
          <p className="error-message">{error || validationError}</p>
          
          <div className="error-actions">
            {validationError && (
              <button
                onClick={retryValidation}
                disabled={isValidating}
                className="action-button primary"
              >
                {isValidating ? 'Fixing...' : 'Fix User Account'}
              </button>
            )}
            
            <button
              onClick={fetchDashboardData}
              className="action-button secondary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="no-data-container">
        <div className="text-center">
          <div className="no-data-icon">📚</div>
          <h2 className="no-data-title">No Dashboard Data</h2>
          <p className="no-data-message">Unable to load your dashboard information.</p>
        </div>
      </div>
    );
  }

  // Debug: Log the dashboard data
  console.log('Dashboard Data State:', dashboardData);
  
  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">
            Welcome back, {dashboardData.student?.name || user?.name || 'Student'}! 👋
          </h1>
          <p className="welcome-subtitle">
            Here's your learning progress and upcoming tasks
          </p>
        </div>

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <BookOpen className="stat-icon" />
              <div>
                <p className="stat-label">Modules</p>
                <p className="stat-value">{(dashboardData.modules || []).length}</p>
              </div>
            </div>
          </div>
          
          <div className="stat-card green">
            <div className="stat-content">
              <TrendingUp className="stat-icon" />
              <div>
                <p className="stat-label">Progress</p>
                <p className="stat-value">{dashboardData.overall_progress || 0}%</p>
              </div>
            </div>
          </div>
          
          <div className="stat-card purple">
            <div className="stat-content">
              <Clock className="stat-icon" />
              <div>
                <p className="stat-label">Due Soon</p>
                <p className="stat-value">
                  {(dashboardData.recent_assignments || []).filter((a: any) => {
                    const dueDate = new Date(a.due_date);
                    const now = new Date();
                    const diffTime = dueDate.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 7 && diffDays >= 0;
                  }).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="stat-card orange">
            <div className="stat-content">
              <Bell className="stat-icon" />
              <div>
                <p className="stat-label">Notifications</p>
                <p className="stat-value">0</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Quick Shortcuts Section */}
        <div className="shortcuts-section">
          <h2 className="section-title">Quick Shortcuts</h2>
          <div className="shortcuts-grid">
            <button
              onClick={() => navigate('/quizzes')}
              className="shortcut-button"
            >
              <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="shortcut-label">Quizzes</span>
            </button>
            
            <button
              onClick={() => navigate('/submissions')}
              className="shortcut-button"
            >
              <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="shortcut-label">Submit</span>
            </button>
            
            <button
              onClick={() => navigate('/resources')}
              className="shortcut-button"
            >
              <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <span className="shortcut-label">Resources</span>
            </button>
            
            <button
              onClick={() => navigate('/messages')}
              className="shortcut-button"
            >
              <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="shortcut-label">Messages</span>
            </button>
            
            <button
              onClick={() => navigate('/calendar')}
              className="shortcut-button"
            >
              <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="shortcut-label">Calendar</span>
            </button>
            

          </div>
        </div>
        
        {/* Dashboard Cards Grid */}
        <div className="cards-grid">
          {/* Modules & Courses */}
          <div onClick={() => navigate('/modules')} className="dashboard-card">
            <ModulePreviewCard 
              modules={dashboardData.modules || []} 
              loading={loading} 
            />
          </div>

          {/* Quizzes */}
          <div onClick={() => navigate('/quizzes')} className="dashboard-card">
            <QuizPreviewCard 
              quizzes={dashboardData.recent_quizzes || []} 
              loading={loading} 
            />
          </div>

          {/* Submissions */}
          <div onClick={() => navigate('/submissions')} className="dashboard-card">
            <SubmissionsPreviewCard 
              submissions={dashboardData.recent_submissions || []} 
              loading={loading} 
            />
          </div>

          {/* Notifications */}
          <div onClick={() => navigate('/notifications')} className="dashboard-card">
            <NotificationsPreviewCard 
              notifications={[]} // Will be populated from API
              loading={loading}
            />
          </div>

          {/* Progress Tracker */}
          <div className="dashboard-card col-span-2">
            <ProgressTracker />
          </div>

          {/* Calendar */}
          <div onClick={() => navigate('/calendar')} className="dashboard-card">
            <CalendarPreviewCard 
              events={[]} // Will be populated from calendar API
              loading={loading} 
            />
          </div>

          {/* Profile */}
          <div onClick={() => navigate('/profile')} className="dashboard-card">
            <ProfilePreviewCard loading={loading} />
          </div>

          {/* Assignments */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title-section">
                <div className="card-icon" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="card-title">Assignments</h3>
              </div>
              <BookOpen className="w-5 h-5 text-gray-500" />
            </div>
            <div className="card-content">
              {dashboardData.recent_assignments && dashboardData.recent_assignments.length > 0 ? (
                dashboardData.recent_assignments.slice(0, 3).map((assignment: any) => (
                  <div key={assignment.id} className="card-item">
                    <div className="item-icon"></div>
                    <div className="item-content">
                      <h4 className="item-title">{assignment.title}</h4>
                      <p className="item-subtitle">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No recent assignments</p>
                </div>
              )}
            </div>
            <div className="card-footer">
              <span className="card-link">View all assignments →</span>
            </div>
          </div>

          {/* Analytics */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title-section">
                <div className="card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="card-title">Analytics</h3>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-500" />
            </div>
            <div className="card-content">
              <div className="card-item">
                <div className="item-icon"></div>
                <div className="item-content">
                  <h4 className="item-title">Quiz Performance</h4>
                  <p className="item-subtitle">85%</p>
                </div>
              </div>
              <div className="card-item">
                <div className="item-icon"></div>
                <div className="item-content">
                  <h4 className="item-title">Assignment Score</h4>
                  <p className="item-subtitle">92%</p>
                </div>
              </div>
              <div className="card-item">
                <div className="item-icon"></div>
                <div className="item-content">
                  <h4 className="item-title">Study Time</h4>
                  <p className="item-subtitle">12h/week</p>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <span className="card-link">View detailed analytics →</span>
            </div>
          </div>

          {/* Resources */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title-section">
                <div className="card-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="card-title">Resources</h3>
              </div>
              <FileText className="w-5 h-5 text-gray-500" />
            </div>
            <div className="card-content">
              <div className="card-item">
                <div className="item-icon"></div>
                <div className="item-content">
                  <h4 className="item-title">Study Materials</h4>
                  <p className="item-subtitle">24 files</p>
                </div>
              </div>
              <div className="card-item">
                <div className="item-icon"></div>
                <div className="item-content">
                  <h4 className="item-title">Video Lectures</h4>
                  <p className="item-subtitle">12 videos</p>
                </div>
              </div>
              <div className="card-item">
                <div className="item-icon"></div>
                <div className="item-content">
                  <h4 className="item-title">PDF Documents</h4>
                  <p className="item-subtitle">8 docs</p>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <span className="card-link">Browse all resources →</span>
            </div>
          </div>

          {/* Messages */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title-section">
                <div className="card-icon" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="card-title">Messages</h3>
              </div>
              <MessageCircle className="w-5 h-5 text-gray-500" />
            </div>
            <div className="card-content">
              <div className="card-item">
                <div className="item-icon"></div>
                <div className="item-content">
                  <h4 className="item-title">Unread Messages</h4>
                  <p className="item-subtitle">3</p>
                </div>
              </div>
              <div className="card-item">
                <div className="item-icon"></div>
                <div className="item-content">
                  <h4 className="item-title">Active Chats</h4>
                  <p className="item-subtitle">2</p>
                </div>
              </div>
              <div className="card-item">
                <div className="item-icon"></div>
                <div className="item-content">
                  <h4 className="item-title">Teachers Online</h4>
                  <p className="item-subtitle">5</p>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <span className="card-link">Open messages →</span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="action-buttons">
          <button
            onClick={() => navigate('/quizzes')}
            className="action-button"
          >
            <BookOpen className="w-5 h-5" />
            <span>Start Quiz</span>
          </button>
          
          <button
            onClick={() => navigate('/submissions')}
            className="action-button green"
          >
            <FileText className="w-5 h-5" />
            <span>Upload Assignment</span>
          </button>
          
          <button
            onClick={() => navigate('/resources')}
            className="action-button orange"
          >
            <FolderOpen className="w-5 h-5" />
            <span>Browse Resources</span>
          </button>

          <button
            onClick={() => navigate('/messages')}
            className="action-button pink"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Send Message</span>
          </button>

          <button
            onClick={() => navigate('/calendar')}
            className="action-button indigo"
          >
            <Clock className="w-5 h-5" />
            <span>View Calendar</span>
          </button>


        </div>
      </div>

      {/* Enhanced Analytics Section */}
      <EnhancedAnalytics />

    </div>
  );
};

export default StudentHomeDashboard;
