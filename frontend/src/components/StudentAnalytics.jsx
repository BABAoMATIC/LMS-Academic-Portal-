import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const StudentAnalytics = ({ student, onClose }) => {
  console.log('📊 StudentAnalytics component rendered with student:', student);
  
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [reflections, setReflections] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [demoMode, setDemoMode] = useState(false);
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [lazyLoadCharts, setLazyLoadCharts] = useState(true);

  useEffect(() => {
    if (student) {
      fetchStudentAnalytics();
      setLastRefresh(new Date());
    }
  }, [student]);

  // Real-time refresh functionality
  useEffect(() => {
    if (autoRefresh && student) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing student analytics...');
        fetchStudentAnalytics();
        setLastRefresh(new Date());
      }, 30000); // Refresh every 30 seconds

      setRefreshInterval(interval);

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    }
  }, [autoRefresh, student]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  // Lazy load charts when performance tab is active
  useEffect(() => {
    if (activeTab === 'performance' && !chartsLoaded) {
      const timer = setTimeout(() => {
        setChartsLoaded(true);
        setLazyLoadCharts(false);
      }, 500); // Small delay to improve perceived performance
      return () => clearTimeout(timer);
    }
  }, [activeTab, chartsLoaded]);

  // Generate comprehensive demo data for testing
  const generateDemoData = () => {
    const baseDate = new Date();
    const demoData = {
      kpis: {
        total_quizzes_attempted: 15,
        modules_completed: 8,
        assignments_submitted: 12,
        gpa: 87.5,
        engagement_score: 92.3,
        completion_rate: 85.7,
        average_quiz_score: 84.2,
        total_reflections: 5
      },
      charts: {
        quiz_scores_over_time: Array.from({ length: 10 }, (_, i) => ({
          date: new Date(baseDate.getTime() - (9 - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          score: Math.floor(Math.random() * 20) + 80 // 80-100 range
        })),
        assignment_grades_over_time: Array.from({ length: 8 }, (_, i) => ({
          date: new Date(baseDate.getTime() - (7 - i) * 10 * 24 * 60 * 60 * 1000).toISOString(),
          grade: Math.floor(Math.random() * 15) + 85 // 85-100 range
        })),
        subject_performance: [
          { subject_title: "Mathematics", progress_percentage: 85, engagement_percentage: 78, total_assignments: 4, completed_assignments: 3 },
          { subject_title: "Science", progress_percentage: 78, engagement_percentage: 82, total_assignments: 3, completed_assignments: 2 },
          { subject_title: "English", progress_percentage: 92, engagement_percentage: 88, total_assignments: 5, completed_assignments: 4 }
        ],
        modules_completion: { completed: 8, pending: 4, in_progress: 2 },
        engagement_trends: Array.from({ length: 5 }, (_, i) => ({
          week: `Week ${i + 1}`,
          engagement_score: Math.floor(Math.random() * 20) + 80
        })),
        grade_distribution: [3, 5, 2, 1, 0] // A, B, C, D, F
      },
      submissions: Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        assignment_title: `Assignment ${i + 1}`,
        submitted_at: new Date(baseDate.getTime() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
        grade: Math.floor(Math.random() * 20) + 80,
        status: i < 6 ? 'graded' : 'pending'
      })),
      metadata: {
        last_updated: new Date().toISOString(),
        data_freshness: "demo",
        student_id: student.id,
        total_data_points: 45
      }
    };
    return demoData;
  };

  const fetchStudentAnalytics = async () => {
    try {
      setLoading(true);
      setDataLoading(true);
      setError(null);
      
      // Check if demo mode is enabled
      if (demoMode) {
        console.log(`🎭 Loading demo data for student ${student.id}...`);
        const demoData = generateDemoData();
        setAnalytics(demoData);
        setReflections(Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          title: `Reflection ${i + 1}`,
          content: `This is a sample reflection entry ${i + 1} demonstrating the student's learning journey.`,
          learning_outcomes: `Learning outcome ${i + 1}`,
          skills_developed: `Skill ${i + 1}`,
          created_at: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString()
        })));
        setRecentActivity(Array.from({ length: 10 }, (_, i) => ({
          description: `Activity ${i + 1}: ${['Submitted assignment', 'Completed quiz', 'Added reflection'][i % 3]}`,
          timestamp: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000).toISOString(),
          type: ['submission', 'quiz', 'reflection'][i % 3]
        })));
        setLastRefresh(new Date());
        setDataLoading(false);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      };

      console.log(`🔄 Fetching real-time analytics for student ${student.id}...`);

      // Real-time data fetching with comprehensive error handling
      const [analyticsRes, submissionsRes, reflectionsRes, activityRes, gradesRes] = await Promise.allSettled([
        axios.get(`/api/student/${student.id}/analytics`, { 
          headers,
          timeout: 10000,
          params: { timestamp: Date.now() } // Prevent caching
        }),
        axios.get(`/api/student/${student.id}/submissions`, { 
          headers,
          timeout: 10000,
          params: { timestamp: Date.now() }
        }),
        axios.get(`/api/student/${student.id}/reflections`, { 
          headers,
          timeout: 10000,
          params: { timestamp: Date.now() }
        }),
        axios.get(`/api/student/${student.id}/recent-activity`, { 
          headers,
          timeout: 10000,
          params: { timestamp: Date.now() }
        }),
        axios.get(`/api/student/${student.id}/grades`, { 
          headers,
          timeout: 10000,
          params: { timestamp: Date.now() }
        })
      ]);

      // Process successful responses
      const analytics = analyticsRes.status === 'fulfilled' ? analyticsRes.value.data : null;
      const submissions = submissionsRes.status === 'fulfilled' ? submissionsRes.value.data : null;
      const reflections = reflectionsRes.status === 'fulfilled' ? reflectionsRes.value.data : null;
      const activity = activityRes.status === 'fulfilled' ? activityRes.value.data : null;
      const grades = gradesRes.status === 'fulfilled' ? gradesRes.value.data : null;

      // Set analytics data with enhanced structure
      if (analytics) {
        setAnalytics({
          ...analytics,
          lastUpdated: new Date().toISOString(),
          dataFreshness: 'real-time'
        });
      } else {
        // Enhanced fallback data with realistic values
        setAnalytics({
          kpis: {
            total_quizzes_attempted: 0,
            modules_completed: 0,
            assignments_submitted: 0,
            gpa: 0,
            engagement_score: 0,
            completion_rate: 0
          },
          charts: {
            quiz_scores_over_time: [],
            subject_performance: [],
            modules_completion: { completed: 0, pending: 0 },
            engagement_trends: [],
            grade_distribution: []
          },
          submissions: [],
          lastUpdated: new Date().toISOString(),
          dataFreshness: 'fallback'
        });
      }

      // Set other data with fallbacks
      setSelectedSubmission(submissions?.submissions?.[0] || null);
      setReflections(reflections?.reflections || []);
      setRecentActivity(activity?.activity || []);

      console.log(`✅ Analytics data loaded for student ${student.id}`);
      console.log('📊 Analytics Summary:', {
        quizzes: analytics?.kpis?.total_quizzes_attempted || 0,
        assignments: analytics?.kpis?.assignments_submitted || 0,
        reflections: reflections?.reflections?.length || 0,
        activity: activity?.activity?.length || 0
      });

    } catch (error) {
      console.error('❌ Error fetching student analytics:', error);
      setError(error.message);
      
      // Retry logic for network errors
      if (retryCount < 3 && (error.code === 'NETWORK_ERROR' || error.message.includes('timeout'))) {
        console.log(`🔄 Retrying fetch (attempt ${retryCount + 1}/3)...`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchStudentAnalytics();
        }, 2000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      // Enhanced error handling with user-friendly fallback
      setAnalytics({
        kpis: {
          total_quizzes_attempted: 0,
          modules_completed: 0,
          assignments_submitted: 0,
          gpa: 0,
          engagement_score: 0,
          completion_rate: 0
        },
        charts: {
          quiz_scores_over_time: [],
          subject_performance: [],
          modules_completion: { completed: 0, pending: 0 },
          engagement_trends: [],
          grade_distribution: []
        },
        submissions: [],
        lastUpdated: new Date().toISOString(),
        dataFreshness: 'error-fallback',
        error: error.message
      });
    } finally {
      setLoading(false);
      setDataLoading(false);
    }
  };

  const handleSubmitFeedback = async (event) => {
    // Prevent default form submission behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!selectedSubmission || !feedback.trim() || !grade) return;

    try {
      setSubmittingFeedback(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(`/api/submissions/${selectedSubmission.id}/feedback`, {
        feedback,
        grade: parseFloat(grade),
        submission_id: selectedSubmission.id
      }, { headers });

      setFeedback('');
      setGrade('');
      fetchStudentAnalytics(); // Refresh data
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p className="text-red-600">Failed to load analytics</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded">
            Close
          </button>
        </div>
      </div>
    );
  }

  // Enhanced chart data processing with real-time data
  const processChartData = () => {
    if (!analytics?.charts) return {};

    const charts = analytics.charts;
    
    return {
      // Line chart for grades over time
      line: {
        labels: charts.quiz_scores_over_time?.map(item => 
          new Date(item.date).toLocaleDateString()
        ) || [],
        datasets: [{
          label: 'Quiz Scores',
          data: charts.quiz_scores_over_time?.map(item => item.score) || [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          fill: true
        }, {
          label: 'Assignment Grades',
          data: charts.assignment_grades_over_time?.map(item => item.grade) || [],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.1,
          fill: true
        }]
      },
      
      // Bar chart for subject performance
      bar: {
        labels: charts.subject_performance?.map(item => item.subject_title) || [],
        datasets: [{
          label: 'Progress %',
          data: charts.subject_performance?.map(item => item.progress_percentage) || [],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        }, {
          label: 'Engagement %',
          data: charts.subject_performance?.map(item => item.engagement_percentage || 0) || [],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        }]
      },
      
      // Pie chart for module completion
      pie: {
        labels: ['Completed', 'Pending', 'In Progress'],
        datasets: [{
          data: [
            charts.modules_completion?.completed || 0,
            charts.modules_completion?.pending || 0,
            charts.modules_completion?.in_progress || 0
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(239, 68, 68)',
            'rgb(245, 158, 11)'
          ],
          borderWidth: 1
        }]
      },
      
      // Radar chart for comprehensive performance
      radar: {
        labels: charts.subject_performance?.map(item => item.subject_title) || [],
        datasets: [{
          label: 'Performance',
          data: charts.subject_performance?.map(item => item.progress_percentage) || [],
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(59, 130, 246)'
        }, {
          label: 'Engagement',
          data: charts.subject_performance?.map(item => item.engagement_percentage || 0) || [],
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(16, 185, 129)'
        }]
      },
      
      // Engagement trends over time
      engagement: {
        labels: charts.engagement_trends?.map(item => 
          new Date(item.week).toLocaleDateString()
        ) || [],
        datasets: [{
          label: 'Weekly Engagement',
          data: charts.engagement_trends?.map(item => item.engagement_score) || [],
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          tension: 0.1,
          fill: true
        }]
      },
      
      // Grade distribution
      gradeDistribution: {
        labels: ['A (90-100)', 'B (80-89)', 'C (70-79)', 'D (60-69)', 'F (Below 60)'],
        datasets: [{
          data: charts.grade_distribution || [0, 0, 0, 0, 0],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(107, 114, 128, 0.8)'
          ],
          borderColor: [
            'rgb(34, 197, 94)',
            'rgb(59, 130, 246)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(107, 114, 128)'
          ],
          borderWidth: 1
        }]
      }
    };
  };

  const chartData = processChartData();

  console.log('📊 StudentAnalytics render - student:', student, 'loading:', loading);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {student.name} - Student Analytics Dashboard
              </h2>
              <p className="text-gray-600">Student ID: {student.id} | {student.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    analytics?.dataFreshness === 'real-time' ? 'bg-green-500' :
                    analytics?.dataFreshness === 'fallback' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-500">
                    {analytics?.dataFreshness === 'real-time' ? 'Live Data' :
                     analytics?.dataFreshness === 'fallback' ? 'Cached Data' :
                     'Offline Mode'}
                  </span>
                </div>
                {lastRefresh && (
                  <span className="text-sm text-gray-500">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setDemoMode(!demoMode);
                }}
                className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
                  demoMode 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {demoMode ? 'Demo Mode' : 'Live Data'}
              </button>
              <button
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setRetryCount(0);
                  fetchStudentAnalytics();
                  setLastRefresh(new Date());
                }}
                disabled={loading || dataLoading}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center gap-1"
              >
                {loading || dataLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {dataLoading ? 'Loading...' : 'Refreshing...'}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </>
                )}
              </button>
              <button
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setAutoRefresh(!autoRefresh);
                }}
                className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
                  autoRefresh 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  autoRefresh ? 'bg-white' : 'bg-gray-600'
                }`}></div>
                Auto-refresh
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold ml-2"
              >
                ×
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: '📊' },
                { id: 'performance', name: 'Performance', icon: '📈' },
                { id: 'activity', name: 'Recent Activity', icon: '🕒' },
                { id: 'reflections', name: 'Reflections', icon: '💭' },
                { id: 'feedback', name: 'Feedback', icon: '💬' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setActiveTab(tab.id);
                  }}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  {retryCount > 0 && (
                    <p className="text-xs text-red-600 mt-1">Retry attempt {retryCount}/3</p>
                  )}
                </div>
                <button
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setError(null);
                    setRetryCount(0);
                    fetchStudentAnalytics();
                  }}
                  className="ml-auto px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-600">Total Quizzes</h3>
                  {dataLoading ? (
                    <div className="animate-pulse bg-blue-200 h-8 w-16 rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-blue-900">{analytics?.kpis?.total_quizzes_attempted || 0}</p>
                  )}
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-green-600">Modules Completed</h3>
                  {dataLoading ? (
                    <div className="animate-pulse bg-green-200 h-8 w-16 rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-green-900">{analytics?.kpis?.modules_completed || 0}</p>
                  )}
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-purple-600">Assignments</h3>
                  {dataLoading ? (
                    <div className="animate-pulse bg-purple-200 h-8 w-16 rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-purple-900">{analytics?.kpis?.assignments_submitted || 0}</p>
                  )}
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-orange-600">Overall GPA</h3>
                  {dataLoading ? (
                    <div className="animate-pulse bg-orange-200 h-8 w-16 rounded"></div>
                  ) : (
                    <p className="text-2xl font-bold text-orange-900">{analytics?.kpis?.gpa || 0}</p>
                  )}
                </div>
              </div>

              {/* Basic Student Info */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-4">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-lg font-semibold text-gray-900">{student.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Student ID</label>
                    <p className="text-lg font-semibold text-gray-900">{student.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-lg font-semibold text-gray-900">{student.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Performance Overview</h3>
              
              {/* Lazy Loading Indicator */}
              {lazyLoadCharts && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading performance charts...</p>
                    <p className="text-sm text-gray-500 mt-2">Optimizing for best performance</p>
                  </div>
                </div>
              )}
              
              {/* Enhanced Charts Grid */}
              {!lazyLoadCharts && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Grades Over Time - Enhanced Line Chart */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Grades Over Time</h3>
                  {chartData.line?.labels?.length > 0 ? (
                    <Line data={chartData.line} options={{
                      responsive: true,
                      plugins: { 
                        legend: { display: true, position: 'top' },
                        title: { display: true, text: 'Performance Trends' }
                      },
                      scales: { 
                        y: { beginAtZero: true, max: 100 },
                        x: { title: { display: true, text: 'Date' } }
                      },
                      interaction: { intersect: false, mode: 'index' }
                    }} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">No grade data available</div>
                  )}
                </div>

                {/* Subject Performance - Enhanced Bar Chart */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Subject Performance & Engagement</h3>
                  {chartData.bar?.labels?.length > 0 ? (
                    <Bar data={chartData.bar} options={{
                      responsive: true,
                      plugins: { 
                        legend: { display: true, position: 'top' },
                        title: { display: true, text: 'Subject Analysis' }
                      },
                      scales: { 
                        y: { beginAtZero: true, max: 100 },
                        x: { title: { display: true, text: 'Subjects' } }
                      }
                    }} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">No subject data available</div>
                  )}
                </div>

                {/* Module Completion - Enhanced Pie Chart */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Module Completion Status</h3>
                  {chartData.pie?.datasets?.[0]?.data?.some(val => val > 0) ? (
                    <Pie data={chartData.pie} options={{
                      responsive: true,
                      plugins: { 
                        legend: { position: 'bottom' },
                        title: { display: true, text: 'Completion Overview' }
                      }
                    }} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">No module data available</div>
                  )}
                </div>

                {/* Comprehensive Performance Radar */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Comprehensive Performance Analysis</h3>
                  {chartData.radar?.labels?.length > 0 ? (
                    <Radar data={chartData.radar} options={{
                      responsive: true,
                      plugins: { 
                        legend: { display: true, position: 'top' },
                        title: { display: true, text: 'Multi-dimensional Analysis' }
                      },
                      scales: { r: { beginAtZero: true, max: 100 } }
                    }} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">No radar data available</div>
                  )}
                </div>
              </div>

              {/* Additional Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement Trends */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Engagement Trends</h3>
                  {chartData.engagement?.labels?.length > 0 ? (
                    <Line data={chartData.engagement} options={{
                      responsive: true,
                      plugins: { 
                        legend: { display: true, position: 'top' },
                        title: { display: true, text: 'Weekly Engagement' }
                      },
                      scales: { 
                        y: { beginAtZero: true, max: 100 },
                        x: { title: { display: true, text: 'Week' } }
                      }
                    }} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">No engagement data available</div>
                  )}
                </div>

                {/* Grade Distribution */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Grade Distribution</h3>
                  {chartData.gradeDistribution?.datasets?.[0]?.data?.some(val => val > 0) ? (
                    <Bar data={chartData.gradeDistribution} options={{
                      responsive: true,
                      plugins: { 
                        legend: { display: false },
                        title: { display: true, text: 'Grade Distribution' }
                      },
                      scales: { 
                        y: { beginAtZero: true },
                        x: { title: { display: true, text: 'Grade Ranges' } }
                      }
                    }} />
                  ) : (
                    <div className="text-center py-8 text-gray-500">No grade distribution data available</div>
                  )}
                </div>
              </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Recent Activity</h3>
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6">
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 text-sm">📝</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <p className="text-sm text-gray-500">{new Date(activity.timestamp).toLocaleString()}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              activity.type === 'submission' ? 'bg-green-100 text-green-800' :
                              activity.type === 'quiz' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {activity.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No recent activity found</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reflections' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Student Reflections</h3>
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-6">
                  {reflections.length > 0 ? (
                    <div className="space-y-4">
                      {reflections.map((reflection, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">{reflection.title}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(reflection.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{reflection.content}</p>
                          {reflection.learning_outcomes && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-600">Learning Outcomes:</span>
                              <p className="text-sm text-gray-700">{reflection.learning_outcomes}</p>
                            </div>
                          )}
                          {reflection.skills_developed && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Skills Developed:</span>
                              <p className="text-sm text-gray-700">{reflection.skills_developed}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No reflections found</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Feedback & Submissions</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Submissions List */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Recent Submissions</h3>
                  <div className="space-y-2">
                    {analytics?.submissions?.length > 0 ? (
                      analytics.submissions.map((submission) => (
                        <div
                          key={submission.id}
                          onClick={() => setSelectedSubmission(submission)}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedSubmission?.id === submission.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{submission.assignment_title || 'Submission'}</p>
                              <p className="text-sm text-gray-600">
                                {new Date(submission.submitted_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                submission.grade !== null
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {submission.grade !== null ? `Grade: ${submission.grade}` : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">No submissions found</div>
                    )}
                  </div>
                </div>

                {/* Feedback Form */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Provide Feedback</h3>
                  {selectedSubmission ? (
                    <form onSubmit={handleSubmitFeedback} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Grade (0-100)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={grade}
                          onChange={(e) => setGrade(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter grade"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Feedback
                        </label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows="4"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Provide detailed feedback..."
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!feedback.trim() || !grade || submittingFeedback}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </form>
                  ) : (
                    <p className="text-gray-500 text-center py-8">Select a submission to provide feedback</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;
