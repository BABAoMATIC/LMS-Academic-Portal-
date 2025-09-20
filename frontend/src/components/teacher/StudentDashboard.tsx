import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import '../TeacherDashboard.css';

interface StudentAnalytics {
  totalAssignments: number;
  completedAssignments: number;
  totalQuizzes: number;
  attemptedQuizzes: number;
  averageScore: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  moduleProgress: Array<{
    module_name: string;
    progress_percentage: number;
    completed_lessons: number;
    total_lessons: number;
  }>;
  recentSubmissions: Array<{
    id: number;
    assignment_title: string;
    status: string;
    grade: number | null;
    submitted_at: string;
  }>;
  performanceBySubject: Array<{
    subject: string;
    average_score: number;
    total_assignments: number;
    completed_assignments: number;
  }>;
}

interface StudentDashboardProps {
  student: User;
  onBack: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, onBack }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<StudentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStudentAnalytics();
  }, [student.id]);

  const fetchStudentAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch student submissions
      const submissionsResponse = await axios.get(`/api/students/${student.id}/submissions`);
      const submissions = submissionsResponse.data.submissions || [];
      
      // Fetch student progress
      const progressResponse = await axios.get(`/api/students/${student.id}/progress`);
      const progress = progressResponse.data.progress || [];
      
      // Fetch student quiz attempts
      const quizAttemptsResponse = await axios.get(`/api/students/${student.id}/quiz-attempts`);
      const quizAttempts = quizAttemptsResponse.data.attempts || [];
      
      // Calculate analytics
      const totalAssignments = submissions.length;
      const completedAssignments = submissions.filter((s: any) => s.status === 'completed').length;
      const totalQuizzes = quizAttempts.length;
      const attemptedQuizzes = quizAttempts.filter((q: any) => q.score !== null).length;
      
      const gradedSubmissions = submissions.filter((s: any) => s.grade !== null);
      const averageScore = gradedSubmissions.length > 0 
        ? gradedSubmissions.reduce((sum: number, s: any) => sum + (s.grade || 0), 0) / gradedSubmissions.length
        : 0;
      
      const pendingSubmissions = submissions.filter((s: any) => s.status === 'submitted').length;
      
      // Group by subject for performance analysis
      const performanceBySubject = submissions.reduce((acc: any, submission: any) => {
        const subject = submission.module_name || 'Unknown';
        if (!acc[subject]) {
          acc[subject] = {
            subject,
            total_assignments: 0,
            completed_assignments: 0,
            total_score: 0,
            graded_count: 0
          };
        }
        acc[subject].total_assignments++;
        if (submission.status === 'completed') {
          acc[subject].completed_assignments++;
        }
        if (submission.grade !== null) {
          acc[subject].total_score += submission.grade;
          acc[subject].graded_count++;
        }
        return acc;
      }, {});
      
      const performanceArray = Object.values(performanceBySubject).map((p: any) => ({
        subject: p.subject,
        average_score: p.graded_count > 0 ? p.total_score / p.graded_count : 0,
        total_assignments: p.total_assignments,
        completed_assignments: p.completed_assignments
      }));
      
      setAnalytics({
        totalAssignments,
        completedAssignments,
        totalQuizzes,
        attemptedQuizzes,
        averageScore,
        totalSubmissions: submissions.length,
        pendingSubmissions,
        moduleProgress: progress,
        recentSubmissions: submissions.slice(0, 5),
        performanceBySubject: performanceArray
      });
      
    } catch (error) {
      console.error('Error fetching student analytics:', error);
      // Set fallback data
      setAnalytics({
        totalAssignments: 0,
        completedAssignments: 0,
        totalQuizzes: 0,
        attemptedQuizzes: 0,
        averageScore: 0,
        totalSubmissions: 0,
        pendingSubmissions: 0,
        moduleProgress: [],
        recentSubmissions: [],
        performanceBySubject: []
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'assignments', name: 'Assignments', icon: '📝' },
    { id: 'quizzes', name: 'Quizzes', icon: '🧠' },
    { id: 'analytics', name: 'Analytics', icon: '📈' }
  ];

  if (loading) {
    return (
      <div className="professional-card">
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-600">Loading student analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="btn-secondary flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Students</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {student.name}'s Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Student ID: {student.id} | Email: {student.email}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="professional-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assignments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.completedAssignments || 0}/{analytics?.totalAssignments || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${(analytics?.totalAssignments || 0) > 0 ? ((analytics?.completedAssignments || 0) / (analytics?.totalAssignments || 1)) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="professional-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quizzes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.attemptedQuizzes || 0}/{analytics?.totalQuizzes || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${(analytics?.totalQuizzes || 0) > 0 ? ((analytics?.attemptedQuizzes || 0) / (analytics?.totalQuizzes || 1)) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="professional-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.averageScore.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="professional-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.pendingSubmissions}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Performance Overview */}
            <div className="professional-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Performance Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Assignment Progress
                  </h4>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics?.completedAssignments || 0} of {analytics?.totalAssignments || 0} assignments completed
                  </p>
                  <div className="mt-2">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(analytics?.totalAssignments || 0) > 0 ? ((analytics?.completedAssignments || 0) / (analytics?.totalAssignments || 1)) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Quiz Progress
                  </h4>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics?.attemptedQuizzes || 0} of {analytics?.totalQuizzes || 0} quizzes completed
                  </p>
                  <div className="mt-2">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(analytics?.totalQuizzes || 0) > 0 ? ((analytics?.attemptedQuizzes || 0) / (analytics?.totalQuizzes || 1)) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="professional-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Submissions
              </h3>
              {analytics?.recentSubmissions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No recent submissions</p>
              ) : (
                <div className="space-y-3">
                  {analytics?.recentSubmissions.map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {submission.assignment_title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`status-badge ${
                          submission.status === 'completed' ? 'completed' : 'pending'
                        }`}>
                          {submission.status}
                        </span>
                        {submission.grade !== null && (
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {submission.grade}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="professional-card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Assignment Details
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Total Assignments: {analytics?.totalAssignments} | 
              Completed: {analytics?.completedAssignments} | 
              Pending: {analytics?.pendingSubmissions}
            </p>
            {/* Add more detailed assignment information here */}
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="professional-card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quiz Details
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Total Quizzes: {analytics?.totalQuizzes} | 
              Attempted: {analytics?.attemptedQuizzes}
            </p>
            {/* Add more detailed quiz information here */}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Performance by Subject */}
            <div className="professional-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Performance by Subject
              </h3>
              {analytics?.performanceBySubject.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No performance data available</p>
              ) : (
                <div className="space-y-4">
                  {analytics?.performanceBySubject.map((subject, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {subject.subject}
                        </h4>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {subject.average_score.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{subject.completed_assignments} of {subject.total_assignments} assignments</span>
                        <div className="progress-bar w-32">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${subject.total_assignments > 0 ? (subject.completed_assignments / subject.total_assignments) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Module Progress */}
            <div className="professional-card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Module Progress
              </h3>
              {analytics?.moduleProgress.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No module progress data available</p>
              ) : (
                <div className="space-y-4">
                  {analytics?.moduleProgress.map((module, index) => (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {module.module_name}
                        </h4>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {module.progress_percentage}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{module.completed_lessons} of {module.total_lessons} lessons</span>
                        <div className="progress-bar w-32">
                          <div 
                            className="progress-fill"
                            style={{ width: `${module.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;