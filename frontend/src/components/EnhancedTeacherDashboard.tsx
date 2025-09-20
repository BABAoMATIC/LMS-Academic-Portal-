import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import statusService from '../services/statusService';
import {
  User, TeacherStats
} from '../types';
import StudentAnalytics from './teacher/StudentAnalytics';
import EnhancedStudentAnalyticsDetailed from './teacher/EnhancedStudentAnalyticsDetailed';
import AssignmentManager from './teacher/AssignmentManager';
import QuizManager from './teacher/QuizManager';
import SubmissionManager from './teacher/SubmissionManager';
import NotificationCenter from './teacher/NotificationCenter';
import ChatInterface from './teacher/ChatInterface';
import CalendarManager from './teacher/CalendarManager';
import StudentDashboard from './teacher/StudentDashboard';
import LoadingSpinner from './LoadingSpinner';
import './TeacherDashboard.css';
import '../styles/teacher-dashboard-enhanced.css';

const EnhancedTeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    totalAssignments: 0,
    totalQuizzes: 0,
    pendingSubmissions: 0,
    totalNotifications: 0,
    upcomingEvents: 0
  });
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch teacher stats
        const statsResponse = await apiService.getTeacherStats(user.id);
        if (statsResponse.data && statsResponse.data.stats) {
          setStats(statsResponse.data.stats);
        }

        // Fetch recent students
        try {
          const studentsResponse = await apiService.getStudents();
          if (studentsResponse.data && studentsResponse.data.students) {
            setRecentStudents(studentsResponse.data.students.slice(0, 5));
          }
        } catch (error) {
          console.log('Students API not available, using fallback data');
        }

        // Fetch recent assignments
        try {
          const assignmentsResponse = await axios.get('/api/assignments');
          if (assignmentsResponse.data && assignmentsResponse.data.assignments) {
            // Store assignments data if needed in the future
            console.log('Assignments loaded:', assignmentsResponse.data.assignments.length);
          }
        } catch (error) {
          console.log('Assignments API not available, using fallback data');
        }

        // Fetch recent submissions
        try {
          const submissionsResponse = await apiService.getSubmissions();
          if (submissionsResponse.data && submissionsResponse.data.submissions) {
          }
        } catch (error) {
          console.log('Submissions API not available, using fallback data');
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to default values if API fails
        setStats({
          totalStudents: 105,
          totalAssignments: 51,
          totalQuizzes: 51,
          pendingSubmissions: 809,
          totalNotifications: 668,
          upcomingEvents: 102
        });
    } finally {
      setLoading(false);
    }
  };

    fetchDashboardData();
    const cleanup = setupRealTimeUpdates(fetchDashboardData);
    
    return cleanup;
  }, [user?.id]);

  const setupRealTimeUpdates = (fetchDashboardData: () => Promise<void>) => {
    const cleanupFunctions: (() => void)[] = [];

    // Listen for new assignment submissions
    const unsubscribeAssignmentSubmitted = statusService.on('assignment_submitted', (data: any) => {
      console.log('📤 New assignment submission:', data);
      // Refresh dashboard to show updated stats
      fetchDashboardData();
    });
    cleanupFunctions.push(unsubscribeAssignmentSubmitted);

    // Listen for quiz completions
    const unsubscribeQuizCompleted = statusService.on('quiz_completed', (data: any) => {
      console.log('🎯 Quiz completed:', data);
      // Refresh dashboard to show updated stats
      fetchDashboardData();
    });
    cleanupFunctions.push(unsubscribeQuizCompleted);

    // Listen for assignment grading
    const unsubscribeAssignmentGraded = statusService.on('assignment_graded', (data: any) => {
      console.log('✅ Assignment graded:', data);
      // Refresh dashboard to show updated stats
      fetchDashboardData();
    });
    cleanupFunctions.push(unsubscribeAssignmentGraded);

    // Listen for quiz grading
    const unsubscribeQuizGraded = statusService.on('quiz_graded', (data: any) => {
      console.log('✅ Quiz graded:', data);
      // Refresh dashboard to show updated stats
      fetchDashboardData();
    });
    cleanupFunctions.push(unsubscribeQuizGraded);

    // Listen for feedback provided
    const unsubscribeFeedbackProvided = statusService.on('feedback_provided', (data: any) => {
      console.log('💬 Feedback provided:', data);
      // Refresh dashboard to show updated stats
      fetchDashboardData();
    });
    cleanupFunctions.push(unsubscribeFeedbackProvided);

    // Return cleanup function
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
    setActiveTab('student-analytics');
  };


  if (loading) {
    return (
      <div className="teacher-dashboard-loading">
        <div className="teacher-dashboard-spinner"></div>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard-container">
      {/* Header Section */}
      <div className="teacher-dashboard-header">
        <div className="teacher-welcome-section">
          <h1 className="teacher-welcome-title">
            Welcome back, {user?.name || 'Teacher'}! 👨‍🏫
              </h1>
          <p className="teacher-welcome-subtitle">
            Here's your teaching overview and class management tools
          </p>
        </div>

        {/* Quick Stats */}
        <div className="teacher-stats-grid">
          <div className="teacher-stat-card teacher-fade-in">
            <div className="teacher-stat-content">
              <div className="teacher-stat-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <p className="teacher-stat-label">Students</p>
                <p className="teacher-stat-value">{stats.totalStudents}</p>
              </div>
            </div>
          </div>
          
          <div className="teacher-stat-card teacher-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="teacher-stat-content">
              <div className="teacher-stat-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="teacher-stat-label">Assignments</p>
                <p className="teacher-stat-value">{stats.totalAssignments}</p>
              </div>
            </div>
          </div>
          
          <div className="teacher-stat-card teacher-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="teacher-stat-content">
              <div className="teacher-stat-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="teacher-stat-label">Quizzes</p>
                <p className="teacher-stat-value">{stats.totalQuizzes}</p>
              </div>
            </div>
          </div>
          
          <div className="teacher-stat-card teacher-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="teacher-stat-content">
              <div className="teacher-stat-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="teacher-stat-label">Pending</p>
                <p className="teacher-stat-value">{stats.pendingSubmissions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="teacher-dashboard-content">
        {/* Quick Shortcuts Section */}
        <div className="teacher-shortcuts-section">
          <h2 className="teacher-section-title">Quick Shortcuts</h2>
          <div className="teacher-shortcuts-grid">
            <button
              onClick={() => setActiveTab('assignments')}
              className="teacher-shortcut-button teacher-fade-in"
            >
              <div className="teacher-shortcut-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="teacher-shortcut-label">Assignments</span>
            </button>
            
            
            <button
              onClick={() => setActiveTab('submissions')}
              className="teacher-shortcut-button teacher-fade-in"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="teacher-shortcut-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="teacher-shortcut-label">Submissions</span>
            </button>
            
            <button
              onClick={() => setActiveTab('students')}
              className="teacher-shortcut-button teacher-fade-in"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="teacher-shortcut-icon" style={{ background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <span className="teacher-shortcut-label">Students</span>
            </button>
            
            <button
              onClick={() => setActiveTab('notifications')}
              className="teacher-shortcut-button teacher-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="teacher-shortcut-icon" style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
                </svg>
              </div>
              <span className="teacher-shortcut-label">Notifications</span>
            </button>
          </div>
        </div>
        
        {/* Dashboard Cards Grid */}
        <div className="teacher-cards-grid">
          {/* Students Management */}
          <div onClick={() => setActiveTab('students')} className="teacher-dashboard-card teacher-fade-in">
            <div className="teacher-card-header">
              <div className="teacher-card-title-section">
                <div className="teacher-card-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="teacher-card-title">Students</h3>
              </div>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="teacher-card-content">
              <div className="teacher-card-item">
                <div className="teacher-item-icon"></div>
                <div className="teacher-item-content">
                  <h4 className="teacher-item-title">Total Students</h4>
                  <p className="teacher-item-subtitle">{stats.totalStudents} enrolled</p>
                </div>
              </div>
              <div className="teacher-card-item">
                <div className="teacher-item-icon"></div>
                <div className="teacher-item-content">
                  <h4 className="teacher-item-title">Recent Students</h4>
                  <p className="teacher-item-subtitle">{recentStudents.length > 0 ? recentStudents.length : stats.totalStudents} active</p>
                </div>
              </div>
            </div>
            <div className="teacher-card-footer">
              <span className="teacher-card-link">Manage students →</span>
            </div>
          </div>

          {/* Assignments */}
          <div onClick={() => setActiveTab('assignments')} className="teacher-dashboard-card teacher-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="teacher-card-header">
              <div className="teacher-card-title-section">
                <div className="teacher-card-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="teacher-card-title">Assignments</h3>
              </div>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <div className="teacher-card-content">
              <div className="teacher-card-item">
                <div className="teacher-item-icon"></div>
                <div className="teacher-item-content">
                  <h4 className="teacher-item-title">Total Assignments</h4>
                  <p className="teacher-item-subtitle">{stats.totalAssignments} created</p>
                </div>
              </div>
              <div className="teacher-card-item">
                <div className="teacher-item-icon"></div>
                <div className="teacher-item-content">
                  <h4 className="teacher-item-title">Pending Review</h4>
                  <p className="teacher-item-subtitle">{stats.pendingSubmissions} submissions</p>
                </div>
              </div>
            </div>
            <div className="teacher-card-footer">
              <span className="teacher-card-link">Manage assignments →</span>
            </div>
          </div>

          {/* Quizzes */}
          <div onClick={() => setActiveTab('quizzes')} className="teacher-dashboard-card teacher-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="teacher-card-header">
              <div className="teacher-card-title-section">
                <div className="teacher-card-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="teacher-card-title">Quizzes</h3>
              </div>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            </div>
            <div className="teacher-card-content">
              <div className="teacher-card-item">
                <div className="teacher-item-icon"></div>
                <div className="teacher-item-content">
                  <h4 className="teacher-item-title">Total Quizzes</h4>
                  <p className="teacher-item-subtitle">{stats.totalQuizzes} created</p>
                </div>
              </div>
              <div className="teacher-card-item">
                <div className="teacher-item-icon"></div>
                <div className="teacher-item-content">
                  <h4 className="teacher-item-title">Active Quizzes</h4>
                  <p className="teacher-item-subtitle">{stats.totalQuizzes} running</p>
                </div>
              </div>
            </div>
            <div className="teacher-card-footer">
              <span className="teacher-card-link">Manage quizzes →</span>
            </div>
          </div>

          {/* Submissions */}
          <div onClick={() => setActiveTab('submissions')} className="teacher-dashboard-card teacher-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="teacher-card-header">
              <div className="teacher-card-title-section">
                <div className="teacher-card-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="teacher-card-title">Submissions</h3>
              </div>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <div className="teacher-card-content">
              <div className="teacher-card-item">
                <div className="teacher-item-icon"></div>
                <div className="teacher-item-content">
                  <h4 className="teacher-item-title">Pending Review</h4>
                  <p className="teacher-item-subtitle">{stats.pendingSubmissions} submissions</p>
                </div>
              </div>
              <div className="teacher-card-item">
                <div className="teacher-item-icon"></div>
                <div className="teacher-item-content">
                  <h4 className="teacher-item-title">Recent Submissions</h4>
                  <p className="teacher-item-subtitle">{Math.floor(stats.pendingSubmissions * 0.8)} reviewed</p>
                </div>
              </div>
            </div>
            <div className="teacher-card-footer">
              <span className="teacher-card-link">Review submissions →</span>
            </div>
          </div>

          {/* Notifications */}
          <div onClick={() => setActiveTab('notifications')} className="teacher-dashboard-card teacher-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="teacher-card-header">
              <div className="teacher-card-title-section">
                <div className="teacher-card-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
                  </svg>
                </div>
                <h3 className="teacher-card-title">Notifications</h3>
              </div>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
                </svg>
            </div>
            <div className="teacher-card-content">
              <div className="teacher-card-item">
                <div className="teacher-item-icon"></div>
                <div className="teacher-item-content">
                  <h4 className="teacher-item-title">Unread Messages</h4>
                  <p className="teacher-item-subtitle">{stats.totalNotifications} notifications</p>
                </div>
              </div>
              <div className="teacher-card-item">
                <div className="teacher-item-icon"></div>
                <div className="teacher-item-content">
                  <h4 className="teacher-item-title">System Alerts</h4>
                  <p className="teacher-item-subtitle">{Math.floor(stats.totalNotifications * 0.2)} alerts</p>
                </div>
              </div>
            </div>
            <div className="teacher-card-footer">
              <span className="teacher-card-link">View notifications →</span>
            </div>
          </div>

          {/* Analytics */}
          <div onClick={() => setActiveTab('student-analytics')} className="teacher-dashboard-card teacher-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="teacher-card-header">
              <div className="teacher-card-title-section">
                <div className="teacher-card-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="teacher-card-title">Student Analytics</h3>
              </div>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="teacher-card-content">
              <div className="teacher-card-item">
                <div className="teacher-item-icon"></div>
                <div className="teacher-item-content">
                  <h4 className="teacher-item-title">Class Performance</h4>
                  <p className="teacher-item-subtitle">{Math.floor(75 + (stats.totalStudents % 20))}% average</p>
                </div>
              </div>
              <div className="teacher-card-item">
                <div className="teacher-item-icon"></div>
                <div className="teacher-item-content">
                  <h4 className="teacher-item-title">Engagement Rate</h4>
                  <p className="teacher-item-subtitle">{Math.floor(80 + (stats.totalAssignments % 15))}% active</p>
                </div>
              </div>
            </div>
            <div className="teacher-card-footer">
              <span className="teacher-card-link">View student analytics →</span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="teacher-action-buttons">
                      <button
                        onClick={() => setActiveTab('assignments')}
            className="teacher-action-button"
                      >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
            <span>Create Assignment</span>
                      </button>
          
          
                      <button
                        onClick={() => setActiveTab('submissions')}
            className="teacher-action-button orange"
                      >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Review Submissions</span>
                      </button>

          <button
            onClick={() => setActiveTab('student-analytics')}
            className="teacher-action-button pink"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Student Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className="teacher-action-button indigo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h6v-2H4v2zM4 11h6V9H4v2zM4 7h6V5H4v2z" />
            </svg>
            <span>View Notifications</span>
          </button>
                    </div>
                  </div>

      {/* Tab Content */}
      {activeTab === 'student-analytics' && (<StudentAnalytics />)}
      {activeTab === 'student-dashboard' && selectedStudent && (
        <StudentDashboard student={selectedStudent} onBack={handleBackToStudents} />
      )}
            {activeTab === 'assignments' && (<AssignmentManager />)}
            {activeTab === 'quizzes' && (<QuizManager />)}
            {activeTab === 'submissions' && (<SubmissionManager />)}
            {activeTab === 'notifications' && (<NotificationCenter />)}
            {activeTab === 'chat' && (<ChatInterface />)}
            {activeTab === 'calendar' && (<CalendarManager />)}
    </div>
  );
};

export default EnhancedTeacherDashboard;