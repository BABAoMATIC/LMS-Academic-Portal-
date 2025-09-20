import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Bell, 
  MessageCircle,
  BarChart3,
  FolderOpen,
  MessageSquare,
  FileText,
  Target,
  Award,
  CheckCircle,
  AlertCircle,
  Star,
  Calendar,
  User,
  Activity,
  Zap,
  Brain
} from 'lucide-react';
import axios from 'axios';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie,
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface StudentDashboardViewProps {
  studentId: number;
  studentName: string;
  onClose: () => void;
}

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
    status: string;
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
  analytics: {
    totalAssignments: number;
    completedAssignments: number;
    totalQuizzes: number;
    attemptedQuizzes: number;
    averageScore: number;
    totalSubmissions: number;
    pendingSubmissions: number;
  };
}

const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({ 
  studentId, 
  studentName, 
  onClose 
}) => {
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chart data
  const performanceData = [
    { month: 'Jan', score: 85, assignments: 3, quizzes: 2 },
    { month: 'Feb', score: 88, assignments: 4, quizzes: 3 },
    { month: 'Mar', score: 92, assignments: 2, quizzes: 4 },
    { month: 'Apr', score: 89, assignments: 5, quizzes: 2 },
    { month: 'May', score: 94, assignments: 3, quizzes: 3 },
    { month: 'Jun', score: 91, assignments: 4, quizzes: 4 }
  ];

  const subjectData = [
    { name: 'Mathematics', value: 92, color: '#8884d8' },
    { name: 'Science', value: 88, color: '#82ca9d' },
    { name: 'English', value: 85, color: '#ffc658' },
    { name: 'History', value: 90, color: '#ff7300' },
    { name: 'Art', value: 87, color: '#0088FE' }
  ];

  const weeklyActivity = [
    { day: 'Mon', hours: 3, activities: 2 },
    { day: 'Tue', hours: 4, activities: 3 },
    { day: 'Wed', hours: 2, activities: 1 },
    { day: 'Thu', hours: 5, activities: 4 },
    { day: 'Fri', hours: 3, activities: 2 },
    { day: 'Sat', hours: 2, activities: 1 },
    { day: 'Sun', hours: 1, activities: 1 }
  ];

  useEffect(() => {
    fetchStudentDashboard();
  }, [studentId]);

  const fetchStudentDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching student dashboard for student ID:', studentId);

      // Fetch student dashboard data
      const response = await axios.get(`/api/students/${studentId}/dashboard`);
      const data = response.data;
      console.log('Student dashboard data received:', data);

      // Transform the data to match our interface
      const transformedData: StudentDashboardData = {
        student: data.student || { id: studentId, name: studentName, email: '', role: 'student' },
        modules: data.modules || [],
        recent_assignments: data.recent_assignments || [],
        recent_quizzes: data.recent_quizzes || [],
        recent_submissions: data.recent_submissions || [],
        recent_feedback: data.recent_feedback || [],
        overall_progress: data.overall_progress || 0,
        analytics: {
          totalAssignments: data.analytics?.totalAssignments || 0,
          completedAssignments: data.analytics?.completedAssignments || 0,
          totalQuizzes: data.analytics?.totalQuizzes || 0,
          attemptedQuizzes: data.analytics?.attemptedQuizzes || 0,
          averageScore: data.analytics?.averageScore || 0,
          totalSubmissions: data.analytics?.totalSubmissions || 0,
          pendingSubmissions: data.analytics?.pendingSubmissions || 0,
        }
      };

      setDashboardData(transformedData);
    } catch (err: any) {
      console.error('Error fetching student dashboard:', err);
      setError('Failed to load student dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="student-dashboard-view">
        <div className="dashboard-header">
          <div className="header-content">
            <h2 className="dashboard-title">Student Dashboard View</h2>
            <p className="dashboard-subtitle">Loading {studentName}'s dashboard...</p>
          </div>
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading student data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-dashboard-view">
        <div className="dashboard-header">
          <div className="header-content">
            <h2 className="dashboard-title">Student Dashboard View</h2>
            <p className="dashboard-subtitle">{studentName}'s Dashboard</p>
          </div>
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={fetchStudentDashboard} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="student-dashboard-view">
        <div className="dashboard-header">
          <div className="header-content">
            <h2 className="dashboard-title">Student Dashboard View</h2>
            <p className="dashboard-subtitle">{studentName}'s Dashboard</p>
          </div>
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>
        <div className="no-data-container">
          <div className="no-data-icon">📚</div>
          <h3>No Dashboard Data</h3>
          <p>Unable to load dashboard information for this student.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard-view">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2 className="dashboard-title">Student Dashboard View</h2>
          <p className="dashboard-subtitle">
            {dashboardData.student?.name || studentName}'s Learning Dashboard
          </p>
        </div>
        <button onClick={onClose} className="close-button">
          ✕
        </button>
      </div>

      {/* Welcome Section */}
      <div className="welcome-section">
        <h1 className="welcome-title">
          Welcome to {dashboardData.student?.name || studentName}'s Dashboard! 👋
        </h1>
        <p className="welcome-subtitle">
          Here's their learning progress and academic activities
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
              <p className="stat-value">{dashboardData.recent_feedback?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Quick Shortcuts Section */}
        <div className="shortcuts-section">
          <h2 className="section-title">Quick Overview</h2>
          <div className="shortcuts-grid">
            <div className="shortcut-button">
              <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="shortcut-label">Modules</span>
            </div>
            
            <div className="shortcut-button">
              <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="shortcut-label">Assignments</span>
            </div>
            
            <div className="shortcut-button">
              <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <span className="shortcut-label">Resources</span>
            </div>
            
            <div className="shortcut-button">
              <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="shortcut-label">Messages</span>
            </div>
            
            <div className="shortcut-button">
              <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="shortcut-label">Calendar</span>
            </div>
          </div>
        </div>
        
        {/* Dashboard Cards Grid */}
        <div className="cards-grid">
          {/* Modules & Courses */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title-section">
                <div className="card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="card-title">Modules & Courses</h3>
              </div>
              <BookOpen className="w-5 h-5 text-gray-500" />
            </div>
            <div className="card-content">
              {dashboardData.modules && dashboardData.modules.length > 0 ? (
                dashboardData.modules.slice(0, 3).map((module: any) => (
                  <div key={module.id} className="card-item">
                    <div className="item-icon"></div>
                    <div className="item-content">
                      <h4 className="item-title">{module.name}</h4>
                      <p className="item-subtitle">
                        Progress: {module.progress_percentage || 0}%
                      </p>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${module.progress_percentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No modules enrolled</p>
                </div>
              )}
            </div>
            <div className="card-footer">
              <span className="card-link">View all modules →</span>
            </div>
          </div>

          {/* Quizzes */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title-section">
                <div className="card-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="card-title">Recent Quizzes</h3>
              </div>
              <Target className="w-5 h-5 text-gray-500" />
            </div>
            <div className="card-content">
              {dashboardData.recent_quizzes && dashboardData.recent_quizzes.length > 0 ? (
                dashboardData.recent_quizzes.slice(0, 3).map((quiz: any) => (
                  <div key={quiz.id} className="card-item">
                    <div className="item-icon"></div>
                    <div className="item-content">
                      <h4 className="item-title">{quiz.title}</h4>
                      <p className="item-subtitle">
                        {quiz.status === 'attempted' ? `Score: ${quiz.score || 0}%` : 'Not attempted'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No recent quizzes</p>
                </div>
              )}
            </div>
            <div className="card-footer">
              <span className="card-link">View all quizzes →</span>
            </div>
          </div>

          {/* Submissions */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title-section">
                <div className="card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="card-title">Recent Submissions</h3>
              </div>
              <FileText className="w-5 h-5 text-gray-500" />
            </div>
            <div className="card-content">
              {dashboardData.recent_submissions && dashboardData.recent_submissions.length > 0 ? (
                dashboardData.recent_submissions.slice(0, 3).map((submission: any) => (
                  <div key={submission.id} className="card-item">
                    <div className="item-icon"></div>
                    <div className="item-content">
                      <h4 className="item-title">{submission.assignment_title || submission.title}</h4>
                      <p className="item-subtitle">
                        Status: {submission.status} {submission.grade ? `(${submission.grade}%)` : ''}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No recent submissions</p>
                </div>
              )}
            </div>
            <div className="card-footer">
              <span className="card-link">View all submissions →</span>
            </div>
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
                <h3 className="card-title">Performance Analytics</h3>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-500" />
            </div>
            <div className="card-content">
              <div className="card-item">
                <div className="item-icon"></div>
                <div className="item-content">
                  <h4 className="item-title">Average Score</h4>
                  <p className="item-subtitle">{dashboardData.analytics?.averageScore || 0}%</p>
                </div>
              </div>
              <div className="card-item">
                <div className="item-icon"></div>
                <div className="item-content">
                  <h4 className="item-title">Assignments Completed</h4>
                  <p className="item-subtitle">
                    {dashboardData.analytics?.completedAssignments || 0} / {dashboardData.analytics?.totalAssignments || 0}
                  </p>
                </div>
              </div>
              <div className="card-item">
                <div className="item-icon"></div>
                <div className="item-content">
                  <h4 className="item-title">Quizzes Attempted</h4>
                  <p className="item-subtitle">
                    {dashboardData.analytics?.attemptedQuizzes || 0} / {dashboardData.analytics?.totalQuizzes || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <span className="card-link">View detailed analytics →</span>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            {/* Performance Trend Chart */}
            <div className="chart-container">
              <h3 className="chart-title">Performance Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Subject Performance Chart */}
            <div className="chart-container">
              <h3 className="chart-title">Subject Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Activity Chart */}
            <div className="chart-container">
              <h3 className="chart-title">Weekly Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="hours" fill="#10b981" name="Study Hours" />
                  <Bar dataKey="activities" fill="#3b82f6" name="Activities" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Progress Chart */}
            <div className="chart-container">
              <h3 className="chart-title">Monthly Progress</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="assignments" 
                    stackId="1" 
                    stroke="#8b5cf6" 
                    fill="url(#colorAssignments)" 
                    name="Assignments"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="quizzes" 
                    stackId="1" 
                    stroke="#10b981" 
                    fill="url(#colorQuizzes)" 
                    name="Quizzes"
                  />
                  <defs>
                    <linearGradient id="colorAssignments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorQuizzes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Messages & Feedback */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="card-title-section">
                <div className="card-icon" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="card-title">Messages & Feedback</h3>
              </div>
              <MessageCircle className="w-5 h-5 text-gray-500" />
            </div>
            <div className="card-content">
              {dashboardData.recent_feedback && dashboardData.recent_feedback.length > 0 ? (
                dashboardData.recent_feedback.slice(0, 3).map((feedback: any) => (
                  <div key={feedback.id} className="card-item">
                    <div className="item-icon"></div>
                    <div className="item-content">
                      <h4 className="item-title">Teacher Feedback</h4>
                      <p className="item-subtitle">{feedback.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No recent feedback</p>
                </div>
              )}
            </div>
            <div className="card-footer">
              <span className="card-link">View all messages →</span>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="performance-summary">
          <h2 className="section-title">Performance Summary</h2>
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-icon">
                <Award className="w-8 h-8" />
              </div>
              <div className="summary-content">
                <h3>Overall Progress</h3>
                <p className="summary-value">{dashboardData.overall_progress || 0}%</p>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${dashboardData.overall_progress || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon">
                <Target className="w-8 h-8" />
              </div>
              <div className="summary-content">
                <h3>Quiz Performance</h3>
                <p className="summary-value">{dashboardData.analytics?.averageScore || 0}%</p>
                <p className="summary-subtitle">Average Score</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="summary-content">
                <h3>Assignments</h3>
                <p className="summary-value">
                  {dashboardData.analytics?.completedAssignments || 0} / {dashboardData.analytics?.totalAssignments || 0}
                </p>
                <p className="summary-subtitle">Completed</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon">
                <Activity className="w-8 h-8" />
              </div>
              <div className="summary-content">
                <h3>Engagement</h3>
                <p className="summary-value">High</p>
                <p className="summary-subtitle">Active Learner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardView;
