import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Bell, 
  User,
  Calendar,
  FileText,
  BarChart3,
  HelpCircle,
  Award,
  ArrowRight,
  Clock,
  RefreshCw
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';
import SuperEnhancedReflectionJournal from '../components/SuperEnhancedReflectionJournal';
import PortfolioEvidence from '../components/PortfolioEvidence';
import LearningOutcomesAnalytics from '../components/LearningOutcomesAnalytics';
import QuizResultsDashboard from '../components/QuizResultsDashboard';
import StudentPersonalAnalytics from '../components/StudentPersonalAnalytics';
import DashboardNavbar from '../components/DashboardNavbar';
import { useAuth } from '../contexts/AuthContext';
import useAutoRefresh from '../hooks/useAutoRefresh';


const EnhancedStudentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { user } = useAuth();
  const navigate = useNavigate();

  // Auto-refresh functionality
  const { forceRefresh, isRefreshing } = useAutoRefresh({
    interval: 60000, // 1 minute
    enabled: true,
    onRefresh: async () => {
      setLastRefresh(new Date());
      // Force re-render of components that might have stale data
      window.dispatchEvent(new CustomEvent('dashboard-refresh'));
    }
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab navigate={navigate} />;
      case 'quiz-results':
        return <QuizResultsDashboard />;
      case 'reflections':
        return <SuperEnhancedReflectionJournal />;
      case 'portfolio':
        return <PortfolioEvidence />;
      case 'analytics':
        return <StudentPersonalAnalytics />;
      default:
        return <OverviewTab navigate={navigate} />;
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
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-green-700">Live Dashboard</span>
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
                Auto-refresh: ON
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Navigation */}
      <DashboardNavbar activeTab={activeTab} onTabChange={setActiveTab} />

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

// Overview Tab Component
const OverviewTab: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [stats, setStats] = useState({
    totalReflections: 0,
    portfolioItems: 0,
    completedOutcomes: 0,
    totalOutcomes: 0
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  React.useEffect(() => {
    // Fetch overview statistics
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      // This would typically fetch from multiple endpoints
      // For now, we'll use placeholder data
      setStats({
        totalReflections: 5,
        portfolioItems: 12,
        completedOutcomes: 6,
        totalOutcomes: 8
      });

      setRecentActivity([
        {
          id: 1,
          type: 'reflection',
          title: 'Week 3 Reflection: React Hooks',
          date: '2024-01-15',
          icon: '📖'
        },
        {
          id: 2,
          type: 'portfolio',
          title: 'Todo App Project',
          date: '2024-01-14',
          icon: '🚀'
        },
        {
          id: 3,
          type: 'feedback',
          title: 'Assignment Feedback Received',
          date: '2024-01-13',
          icon: '💬'
        }
      ]);
    } catch (error) {
      console.error('Error fetching overview data:', error);
    }
  };

  const getCompletionRate = () => {
    if (stats.totalOutcomes === 0) return 0;
    return Math.round((stats.completedOutcomes / stats.totalOutcomes) * 100);
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Welcome Section with Progress Cards */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your E-Portfolio</h2>
            <p className="text-gray-600 text-lg">Track your learning journey and showcase your achievements</p>
          </div>
          <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 rounded-xl border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-semibold">Live Dashboard</span>
          </div>
        </div>
        
        {/* Main Progress Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Modules Card */}
          <button 
            onClick={() => navigate('/resources')}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 hover:shadow-lg hover:border-blue-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                <p className="text-sm font-medium text-blue-600">Modules</p>
                <p className="text-2xl font-bold text-blue-900 group-hover:text-blue-700 transition-colors duration-300">8</p>
              </div>
                </div>
            <div className="mt-4">
              <p className="text-sm text-blue-700">Active courses</p>
                </div>
          </button>
          
          {/* Overall Progress Card */}
          <button 
            onClick={() => navigate('/submissions')}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 hover:shadow-lg hover:border-green-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors duration-300">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Progress</p>
                <p className="text-2xl font-bold text-green-900 group-hover:text-green-700 transition-colors duration-300">85%</p>
              </div>
            </div>
            <div className="mt-4 w-full bg-green-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{width: '85%'}}></div>
            </div>
          </button>
          
          {/* Due Soon Card */}
          <button 
            onClick={() => navigate('/assignments')}
            className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200 hover:shadow-lg hover:border-orange-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center group-hover:bg-orange-600 transition-colors duration-300">
                <Clock className="w-6 h-6 text-white" />
                  </div>
              <div>
                <p className="text-sm font-medium text-orange-600">Due Soon</p>
                <p className="text-2xl font-bold text-orange-900 group-hover:text-orange-700 transition-colors duration-300">3</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-orange-700">Assignments due this week</p>
          </div>
          </button>
          
          {/* Notifications Card */}
          <button 
            onClick={() => navigate('/notifications')}
            className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200 hover:shadow-lg hover:border-purple-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">Notifications</p>
                <p className="text-2xl font-bold text-purple-900 group-hover:text-purple-700 transition-colors duration-300">5</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-purple-700">New updates</p>
            </div>
          </button>
        </div>
          </div>
          
      {/* Interactive Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button 
          onClick={() => navigate('/reflection-journal')}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
              <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{stats.totalReflections}</p>
              <p className="text-sm text-blue-600 font-medium">Reflections</p>
            </div>
                </div>
          <div className="bg-blue-50 rounded-lg p-4 group-hover:bg-blue-100 transition-colors duration-300">
            <p className="text-sm font-medium text-blue-800">Learning Reflections</p>
            <p className="text-xs text-blue-600 mt-1">Click to view all reflections</p>
              </div>
        </button>

        <button 
          onClick={() => navigate('/evidence-of-growth')}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-green-300 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors duration-300">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300">{stats.portfolioItems}</p>
              <p className="text-sm text-green-600 font-medium">Portfolio</p>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 group-hover:bg-green-100 transition-colors duration-300">
            <p className="text-sm font-medium text-green-800">Portfolio Items</p>
            <p className="text-xs text-green-600 mt-1">Click to manage portfolio</p>
          </div>
        </button>

        <button 
          onClick={() => navigate('/submissions')}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-purple-300 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors duration-300">{stats.completedOutcomes}/{stats.totalOutcomes}</p>
              <p className="text-sm text-purple-600 font-medium">Outcomes</p>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 group-hover:bg-purple-100 transition-colors duration-300">
            <p className="text-sm font-medium text-purple-800">Learning Outcomes</p>
            <p className="text-xs text-purple-600 mt-1">Click to view analytics</p>
          </div>
        </button>

        <button 
          onClick={() => navigate('/submissions')}
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl hover:border-yellow-300 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center group-hover:bg-yellow-600 transition-colors duration-300">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 group-hover:text-yellow-700 transition-colors duration-300">{getCompletionRate()}%</p>
              <p className="text-sm text-yellow-600 font-medium">Complete</p>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 group-hover:bg-yellow-100 transition-colors duration-300">
            <p className="text-sm font-medium text-yellow-800">Completion Rate</p>
            <p className="text-xs text-yellow-600 mt-1">Click to view progress</p>
        </div>
        </button>
      </div>

      {/* Clean Recent Activity */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">📊</span>
              </div>
              <div>
              <h3 className="text-2xl font-bold text-gray-900">Recent Activity</h3>
              <p className="text-gray-600">Your latest learning milestones</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            Live Updates
          </div>
        </div>
        
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-300 border border-gray-200 hover:border-blue-300">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">{activity.icon}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                    {activity.date}
                  </span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full capitalize">
                    {activity.type}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Clean Quick Actions */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">⚡</span>
              </div>
              <div>
              <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
              <p className="text-gray-600">Jump into your learning activities</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            Fast Access
          </div>
            </div>
            
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => navigate('/reflection-journal')}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-lg border border-blue-200 hover:shadow-xl hover:border-blue-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-300">New Reflection</h4>
              <p className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors duration-300">Document your learning journey</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/evidence-of-growth')}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-lg border border-green-200 hover:shadow-xl hover:border-green-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors duration-300">
                <Target className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors duration-300">Add Portfolio Item</h4>
              <p className="text-sm text-gray-600 group-hover:text-green-600 transition-colors duration-300">Showcase your best work</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/submissions')}
            className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 shadow-lg border border-purple-200 hover:shadow-xl hover:border-purple-400 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition-colors duration-300">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors duration-300">View Analytics</h4>
              <p className="text-sm text-gray-600 group-hover:text-purple-600 transition-colors duration-300">Track your progress</p>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
};

export default EnhancedStudentDashboard;

