import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Users, 
  MessageSquare, 
  BarChart3,
  Send,
  User,
  Target,
  FileText,
  HelpCircle,
  Award,
  RefreshCw,
  Eye
} from 'lucide-react';
import TeacherNotificationCreator from '../components/TeacherNotificationCreator';
import AssignmentCreator from '../components/AssignmentCreator';
import QuizCreator from '../components/QuizCreator';
import QuizResultsDashboard from '../components/QuizResultsDashboard';
import TeacherStudentAnalytics from '../components/TeacherStudentAnalytics';
import TeacherAssignmentManagement from '../components/TeacherAssignmentManagement';
import TeacherQuizManagement from '../components/TeacherQuizManagement';
import TeacherStudentDashboardView from '../components/TeacherStudentDashboardView';
import { useAuth } from '../contexts/AuthContext';
import useAutoRefresh from '../hooks/useAutoRefresh';

const EnhancedTeacherDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { user } = useAuth();

  // Auto-refresh functionality
  const { forceRefresh, isRefreshing } = useAutoRefresh({
    interval: 60000, // 1 minute
    enabled: true,
    onRefresh: async () => {
      setLastRefresh(new Date());
      // Force re-render of components that might have stale data
      window.dispatchEvent(new CustomEvent('teacher-dashboard-refresh'));
    }
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'student-dashboard', label: 'Student Dashboard', icon: Eye },
    { id: 'student-analytics', label: 'Student Analytics', icon: Users },
    { id: 'assignment-management', label: 'Assignment Management', icon: FileText },
    { id: 'quiz-management', label: 'Quiz Management', icon: HelpCircle },
    { id: 'quiz-results', label: 'Quiz Results', icon: Award },
    { id: 'notifications', label: 'Send Notifications', icon: MessageSquare },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <TeacherOverviewTab setActiveTab={setActiveTab} />;
      case 'student-dashboard':
        return <TeacherStudentDashboardView />;
      case 'student-analytics':
        return <TeacherStudentAnalytics />;
      case 'assignment-management':
        return <TeacherAssignmentManagement />;
      case 'quiz-management':
        return <TeacherQuizManagement />;
      case 'quiz-results':
        return <QuizResultsTab />;
      case 'notifications':
        return <TeacherNotificationCreator />;
      default:
        return <TeacherOverviewTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Clean Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-700">Teacher Dashboard</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={forceRefresh}
                  disabled={isRefreshing}
                  className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
                <div className="text-xs text-gray-500">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                {user?.name} - Teacher
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Navigation Tabs */}
      <div className="dashboard-navbar-container">
        <div className="dashboard-navbar-content">
          <nav className="dashboard-navbar-nav">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              // Color configurations for each tab
              const colorConfigs = {
                blue: {
                  active: 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600',
                  hover: 'hover:from-blue-50 hover:to-indigo-50',
                  text: 'hover:text-blue-700',
                  border: 'hover:border-blue-300',
                  icon: 'group-hover:text-blue-600'
                },
                green: {
                  active: 'bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600',
                  hover: 'hover:from-green-50 hover:to-emerald-50',
                  text: 'hover:text-green-700',
                  border: 'hover:border-green-300',
                  icon: 'group-hover:text-green-600'
                },
                purple: {
                  active: 'bg-gradient-to-r from-purple-500 via-violet-600 to-indigo-600',
                  hover: 'hover:from-purple-50 hover:to-violet-50',
                  text: 'hover:text-purple-700',
                  border: 'hover:border-purple-300',
                  icon: 'group-hover:text-purple-600'
                },
                yellow: {
                  active: 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500',
                  hover: 'hover:from-yellow-50 hover:to-orange-50',
                  text: 'hover:text-yellow-700',
                  border: 'hover:border-yellow-300',
                  icon: 'group-hover:text-yellow-600'
                },
                indigo: {
                  active: 'bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600',
                  hover: 'hover:from-indigo-50 hover:to-blue-50',
                  text: 'hover:text-indigo-700',
                  border: 'hover:border-indigo-300',
                  icon: 'group-hover:text-indigo-600'
                },
                pink: {
                  active: 'bg-gradient-to-r from-pink-500 via-rose-600 to-red-600',
                  hover: 'hover:from-pink-50 hover:to-rose-50',
                  text: 'hover:text-pink-700',
                  border: 'hover:border-pink-300',
                  icon: 'group-hover:text-pink-600'
                },
                emerald: {
                  active: 'bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600',
                  hover: 'hover:from-emerald-50 hover:to-green-50',
                  text: 'hover:text-emerald-700',
                  border: 'hover:border-emerald-300',
                  icon: 'group-hover:text-emerald-600'
                },
                orange: {
                  active: 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500',
                  hover: 'hover:from-orange-50 hover:to-red-50',
                  text: 'hover:text-orange-700',
                  border: 'hover:border-orange-300',
                  icon: 'group-hover:text-orange-600'
                }
              };
              
              // Function to get glow effect based on color
              const getGlowEffect = (color: string) => {
                const glowEffects = {
                  blue: 'shadow-[0_0_40px_rgba(59,130,246,0.6)]',
                  green: 'shadow-[0_0_40px_rgba(34,197,94,0.6)]',
                  purple: 'shadow-[0_0_40px_rgba(147,51,234,0.6)]',
                  yellow: 'shadow-[0_0_40px_rgba(234,179,8,0.6)]',
                  indigo: 'shadow-[0_0_40px_rgba(99,102,241,0.6)]',
                  pink: 'shadow-[0_0_40px_rgba(236,72,153,0.6)]',
                  emerald: 'shadow-[0_0_40px_rgba(16,185,129,0.6)]',
                  orange: 'shadow-[0_0_40px_rgba(249,115,22,0.6)]'
                };
                return glowEffects[color as keyof typeof glowEffects] || 'shadow-[0_0_40px_rgba(59,130,246,0.6)]';
              };
              
              // Assign colors to tabs
              const tabColors = ['blue', 'green', 'purple', 'yellow', 'indigo', 'pink', 'emerald', 'orange'];
              const tabColor = tabColors[index % tabColors.length];
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`dashboard-navbar-button ${isActive ? 'dashboard-navbar-button-active' : 'dashboard-navbar-button-inactive'}`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInDown 0.6s ease-out forwards'
                  }}
                >
                  {/* Premium Background Pattern for Active Tab */}
                  {isActive && (
                    <div className="dashboard-navbar-active-pattern">
                      <div className="dashboard-navbar-dot-pattern"></div>
                      <div className="dashboard-navbar-gradient-overlay"></div>
                    </div>
                  )}
                  
                  {/* Floating Elements for Active Tab */}
                  {isActive && (
                    <>
                      <div className="dashboard-navbar-floating-dot-1"></div>
                      <div className="dashboard-navbar-floating-dot-2"></div>
                    </>
                  )}
                  
                  <div className="dashboard-navbar-button-content">
                    <div className={`dashboard-navbar-icon-container ${isActive ? 'dashboard-navbar-icon-active' : 'dashboard-navbar-icon-inactive'}`}>
                      <Icon className={`dashboard-navbar-icon ${isActive ? 'dashboard-navbar-icon-active-color' : 'dashboard-navbar-icon-inactive-color'}`} />
                    </div>
                    <span className="dashboard-navbar-label">{tab.label}</span>
                  </div>
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="dashboard-navbar-active-indicator"></div>
                  )}
                  
                  {/* Glow Effect for Active Tab */}
                  {isActive && (
                    <div className={`dashboard-navbar-glow ${getGlowEffect(tabColor)}`}></div>
                  )}
                  
                  {/* Hover Border Effect */}
                  <div className="dashboard-navbar-hover-border"></div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Advanced Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59,130,246,0.15) 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }}></div>
          </div>
          
          {/* Content with Glass Effect */}
          <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

// Teacher Overview Tab Component
const TeacherOverviewTab: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalNotifications: 0,
    pendingSubmissions: 0,
    activeReflections: 0
  });

  React.useEffect(() => {
    fetchTeacherStats();
  }, []);

  const fetchTeacherStats = async () => {
    try {
      // This would typically fetch from multiple endpoints
      // For now, we'll use placeholder data
      setStats({
        totalStudents: 25,
        totalNotifications: 12,
        pendingSubmissions: 8,
        activeReflections: 15
      });
    } catch (error) {
      console.error('Error fetching teacher stats:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Section with Progress Cards */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Teacher Dashboard</h2>
            <p className="text-gray-600 text-lg">Manage your students, send notifications, and track their learning progress</p>
          </div>
          <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 rounded-xl border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-semibold">Live Dashboard</span>
          </div>
        </div>
        
        {/* Main Progress Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Students Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg hover:border-blue-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Total Students</p>
                <p className="text-2xl font-bold text-blue-900 group-hover:text-blue-700 transition-colors duration-300">{stats.totalStudents}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-blue-700">Active learners</p>
            </div>
          </div>
          
          {/* Notifications Sent Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 hover:shadow-lg hover:border-green-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors duration-300">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Notifications Sent</p>
                <p className="text-2xl font-bold text-green-900 group-hover:text-green-700 transition-colors duration-300">{stats.totalNotifications}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-green-700">This month</p>
            </div>
          </div>
          
          {/* Pending Submissions Card */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200 hover:shadow-lg hover:border-orange-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center group-hover:bg-orange-600 transition-colors duration-300">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-600">Pending Submissions</p>
                <p className="text-2xl font-bold text-orange-900 group-hover:text-orange-700 transition-colors duration-300">{stats.pendingSubmissions}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-orange-700">Awaiting review</p>
            </div>
          </div>
          
          {/* Active Reflections Card */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200 hover:shadow-lg hover:border-purple-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">Active Reflections</p>
                <p className="text-2xl font-bold text-purple-900 group-hover:text-purple-700 transition-colors duration-300">{stats.activeReflections}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-purple-700">Student reflections</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => setActiveTab('notifications')}
            className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg hover:border-blue-400 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">Send Notifications</p>
                <p className="text-sm text-gray-600">Notify students instantly</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('student-dashboard')}
            className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 hover:shadow-lg hover:border-green-400 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors duration-300">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-300">Student Dashboard</p>
                <p className="text-sm text-gray-600">View student academic details</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('student-analytics')}
            className="group bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200 hover:shadow-lg hover:border-purple-400 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-300">View Analytics</p>
                <p className="text-sm text-gray-600">Track learning outcomes</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          <div className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
              <span className="text-white text-xl">📝</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">Assignment submitted by John Doe</p>
              <p className="text-sm text-gray-600">2 minutes ago</p>
            </div>
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
              Assignment
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors duration-300">
              <span className="text-white text-xl">📖</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-300">New reflection from Jane Smith</p>
              <p className="text-sm text-gray-600">15 minutes ago</p>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
              Reflection
            </div>
          </div>
          
          <div className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300">
              <span className="text-white text-xl">🎯</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-300">Portfolio evidence added by Mike Johnson</p>
              <p className="text-sm text-gray-600">1 hour ago</p>
            </div>
            <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
              Portfolio
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Students Tab Component
const StudentsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Users className="w-6 h-6 mr-2" />
          Student Management
        </h2>
        <p className="text-gray-600 mt-1">
          View and manage your students' progress and activities
        </p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <p className="text-gray-500 text-center py-8">
          Student management features coming soon...
        </p>
      </div>
    </div>
  );
};

// Assignments Tab Component
const AssignmentsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FileText className="w-6 h-6 mr-2" />
          Assignment Management
        </h2>
        <p className="text-gray-600 mt-1">
          Create and manage assignments for your students
        </p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create New Assignment</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Create assignments that will be automatically sent to all students with real-time notifications.
        </p>
        <AssignmentCreator />
      </div>
    </div>
  );
};

// Quizzes Tab Component
const QuizzesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <HelpCircle className="w-6 h-6 mr-2" />
          Quiz Management
        </h2>
        <p className="text-gray-600 mt-1">
          Create and manage quizzes with automatic grading
        </p>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Create New Quiz</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Create quizzes that will be automatically graded and results sent to students in real-time.
        </p>
        <QuizCreator />
      </div>
    </div>
  );
};

// Quiz Results Tab Component
const QuizResultsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Award className="w-6 h-6 mr-2" />
          Quiz Results & Performance
        </h2>
        <p className="text-gray-600 mt-1">
          View quiz results, statistics, and student performance
        </p>
      </div>
      
      <QuizResultsDashboard />
    </div>
  );
};



export default EnhancedTeacherDashboard;
