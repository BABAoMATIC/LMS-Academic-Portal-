import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Award,
  MessageSquare,
  Calendar,
  FileText,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react';
import './teacher/EnhancedStudentAnalytics.css';
import './EnhancedQuizResults.css';

interface StudentData {
  id: number;
  name: string;
  studentId: string;
  course: string;
  gpa: number;
  email: string;
  joinDate: string;
  lastActive: string;
  profileImage?: string;
}

interface Reflection {
  id: number;
  title: string;
  content: string;
  date: string;
  category: string;
  rating: number;
}

interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  type: string;
  date: string;
  skills: string[];
  fileUrl?: string;
}

interface QuizResult {
  id: number;
  quizTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  date: string;
  status: 'pass' | 'fail';
}

const TeacherStudentView: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Mock student data
      const mockStudent: StudentData = {
        id: parseInt(studentId || '1'),
        name: studentId === '1' ? 'John Smith' : 'Sarah Johnson',
        studentId: studentId === '1' ? 'STU001' : 'STU002',
        course: 'Web Development',
        gpa: studentId === '1' ? 3.7 : 3.2,
        email: studentId === '1' ? 'john.smith@email.com' : 'sarah.johnson@email.com',
        joinDate: '2024-01-15',
        lastActive: '2024-01-20'
      };

      // Mock reflections data
      const mockReflections: Reflection[] = [
        {
          id: 1,
          title: 'Week 3 Reflection: React Hooks',
          content: 'This week I learned about React hooks and how they can make functional components more powerful. I particularly enjoyed learning about useState and useEffect. I found the concept of dependency arrays in useEffect quite challenging at first, but after practicing with several examples, I feel more confident.',
          date: '2024-01-15',
          category: 'Technical Learning',
          rating: 4
        },
        {
          id: 2,
          title: 'Project Reflection: Todo App',
          content: 'Working on the Todo app project was a great learning experience. I learned how to manage state effectively and how to structure components. The most challenging part was implementing the local storage functionality, but I managed to get it working after some research.',
          date: '2024-01-10',
          category: 'Project Work',
          rating: 5
        },
        {
          id: 3,
          title: 'Learning Reflection: CSS Grid',
          content: 'CSS Grid has been a game-changer for me. I used to struggle with complex layouts, but Grid makes it so much easier. I especially like the grid-template-areas property for creating semantic layouts.',
          date: '2024-01-05',
          category: 'Technical Learning',
          rating: 4
        }
      ];

      // Mock portfolio data
      const mockPortfolio: PortfolioItem[] = [
        {
          id: 1,
          title: 'React Todo App',
          description: 'A fully functional todo application built with React, featuring local storage, filtering, and responsive design.',
          type: 'Project',
          date: '2024-01-12',
          skills: ['React', 'JavaScript', 'CSS', 'Local Storage']
        },
        {
          id: 2,
          title: 'CSS Grid Layout',
          description: 'A comprehensive example of CSS Grid layouts including complex responsive designs.',
          type: 'Exercise',
          date: '2024-01-08',
          skills: ['CSS', 'Grid', 'Responsive Design']
        },
        {
          id: 3,
          title: 'JavaScript Algorithms',
          description: 'Collection of solved JavaScript algorithm problems with detailed explanations.',
          type: 'Practice',
          date: '2024-01-03',
          skills: ['JavaScript', 'Algorithms', 'Problem Solving']
        }
      ];

      // Mock quiz results
      const mockQuizResults: QuizResult[] = [
        {
          id: 1,
          quizTitle: 'React Fundamentals Quiz',
          score: 85,
          totalMarks: 100,
          percentage: 85,
          date: '2024-01-18',
          status: 'pass'
        },
        {
          id: 2,
          quizTitle: 'JavaScript Basics Quiz',
          score: 92,
          totalMarks: 100,
          percentage: 92,
          date: '2024-01-15',
          status: 'pass'
        },
        {
          id: 3,
          quizTitle: 'CSS Layout Quiz',
          score: 78,
          totalMarks: 100,
          percentage: 78,
          date: '2024-01-12',
          status: 'pass'
        }
      ];

      setStudent(mockStudent);
      setReflections(mockReflections);
      setPortfolioItems(mockPortfolio);
      setQuizResults(mockQuizResults);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'reflections', label: 'Reflections', icon: BookOpen },
    { id: 'portfolio', label: 'Portfolio', icon: Target },
    { id: 'quiz-results', label: 'Quiz Results', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab student={student} reflections={reflections} portfolioItems={portfolioItems} quizResults={quizResults} />;
      case 'reflections':
        return <ReflectionsTab reflections={reflections} />;
      case 'portfolio':
        return <PortfolioTab portfolioItems={portfolioItems} />;
      case 'quiz-results':
        return <QuizResultsTab quizResults={quizResults} />;
      case 'analytics':
        return <AnalyticsTab student={student} reflections={reflections} portfolioItems={portfolioItems} quizResults={quizResults} />;
      default:
        return <OverviewTab student={student} reflections={reflections} portfolioItems={portfolioItems} quizResults={quizResults} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Student not found</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="group p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all duration-200 hover:shadow-md"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Student Dashboard View
                </h1>
                <p className="text-sm text-gray-600 font-medium">Viewing: {student.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-1 active:translate-y-0 active:scale-95 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                
                {/* Button Content */}
                <div className="relative flex items-center gap-3">
                  <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors duration-200">
                    <MessageSquare className="w-3 h-3" />
                  </div>
                  <span className="group-hover:tracking-wide transition-all duration-200">Send Message</span>
                </div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-indigo-400/0 group-hover:from-blue-400/20 group-hover:via-purple-400/20 group-hover:to-indigo-400/20 transition-all duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Student Info Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
              <div className="flex items-center space-x-6 mt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Student ID:</span>
                  <span className="text-sm font-medium text-gray-900">{student.studentId}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Course:</span>
                  <span className="text-sm font-medium text-gray-900">{student.course}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">GPA:</span>
                  <span className="text-sm font-bold text-blue-600">{student.gpa}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Last Active</div>
              <div className="text-sm font-medium text-gray-900">{new Date(student.lastActive).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-navbar-container">
        <div className="dashboard-navbar-content">
          <nav className="dashboard-navbar-nav">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
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

      {/* Main Content */}
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
const OverviewTab: React.FC<{ 
  student: StudentData | null; 
  reflections: Reflection[]; 
  portfolioItems: PortfolioItem[]; 
  quizResults: QuizResult[] 
}> = ({ student, reflections, portfolioItems, quizResults }) => {
  if (!student) return null;

  const getCompletionRate = () => {
    const totalQuizzes = quizResults.length;
    const passedQuizzes = quizResults.filter(q => q.status === 'pass').length;
    return totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Overview</h2>
            <p className="text-gray-600 text-lg">Comprehensive view of {student.name}'s academic progress</p>
          </div>
          <div className="flex items-center gap-3 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 rounded-xl border border-green-200">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-semibold">Active Student</span>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Reflections Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Reflections</p>
                <p className="text-2xl font-bold text-blue-900">{reflections.length}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-blue-700">Learning reflections</p>
            </div>
          </div>
          
          {/* Portfolio Items Card */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Portfolio Items</p>
                <p className="text-2xl font-bold text-green-900">{portfolioItems.length}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-green-700">Projects & evidence</p>
            </div>
          </div>
          
          {/* Quiz Results Card */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-600">Quiz Average</p>
                <p className="text-2xl font-bold text-orange-900">
                  {quizResults.length > 0 ? Math.round(quizResults.reduce((sum, q) => sum + q.percentage, 0) / quizResults.length) : 0}%
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-orange-700">Overall performance</p>
            </div>
          </div>
          
          {/* Completion Rate Card */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-900">{getCompletionRate()}%</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-purple-700">Quiz completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {reflections.slice(0, 3).map((reflection) => (
            <div key={reflection.id} className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{reflection.title}</p>
                <p className="text-sm text-gray-600">{new Date(reflection.date).toLocaleDateString()}</p>
              </div>
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                Reflection
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Reflections Tab Component
const ReflectionsTab: React.FC<{ reflections: Reflection[] }> = ({ reflections }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Reflections</h2>
        <div className="space-y-6">
          {reflections.map((reflection) => (
            <div key={reflection.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{reflection.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{new Date(reflection.date).toLocaleDateString()}</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                      {reflection.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < reflection.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{reflection.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Portfolio Tab Component
const PortfolioTab: React.FC<{ portfolioItems: PortfolioItem[] }> = ({ portfolioItems }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Portfolio Evidence</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                  {item.type}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{item.description}</p>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Skills Demonstrated:</p>
                <div className="flex flex-wrap gap-2">
                  {item.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(item.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Quiz Results Tab Component
const QuizResultsTab: React.FC<{ quizResults: QuizResult[] }> = ({ quizResults }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quiz Results</h2>
        <div className="space-y-4">
          {quizResults.map((result) => (
            <div key={result.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{result.quizTitle}</h3>
                  <p className="text-sm text-gray-500">{new Date(result.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${result.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                    {result.percentage}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {result.score}/{result.totalMarks} marks
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {result.status === 'pass' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={`font-semibold ${result.status === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                  {result.status === 'pass' ? 'Passed' : 'Failed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab: React.FC<{ 
  student: StudentData | null; 
  reflections: Reflection[]; 
  portfolioItems: PortfolioItem[]; 
  quizResults: QuizResult[] 
}> = ({ student, reflections, portfolioItems, quizResults }) => {
  if (!student) return null;

  const getAverageRating = () => {
    return reflections.length > 0 
      ? (reflections.reduce((sum, r) => sum + r.rating, 0) / reflections.length).toFixed(1)
      : '0.0';
  };

  const getQuizTrend = () => {
    if (quizResults.length < 2) return 'stable';
    const recent = quizResults.slice(-2);
    return recent[1].percentage > recent[0].percentage ? 'improving' : 'declining';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Reflection Quality */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Reflection Quality</p>
                <p className="text-2xl font-bold text-blue-900">{getAverageRating()}/5</p>
              </div>
            </div>
            <p className="text-sm text-blue-700">Average reflection rating</p>
          </div>

          {/* Quiz Trend */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Quiz Trend</p>
                <p className="text-2xl font-bold text-green-900 capitalize">{getQuizTrend()}</p>
              </div>
            </div>
            <p className="text-sm text-green-700">Performance trajectory</p>
          </div>

          {/* Engagement Level */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">Engagement</p>
                <p className="text-2xl font-bold text-purple-900">High</p>
              </div>
            </div>
            <p className="text-sm text-purple-700">Based on activity level</p>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Insights</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Learning Patterns</h4>
            <p className="text-blue-700 text-sm">
              {student.name} shows consistent engagement with {reflections.length} reflections and {portfolioItems.length} portfolio items. 
              The student demonstrates strong self-reflection skills with an average rating of {getAverageRating()}/5.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-2">Performance Summary</h4>
            <p className="text-green-700 text-sm">
              Quiz performance shows a {getQuizTrend()} trend with an average score of {
                quizResults.length > 0 ? Math.round(quizResults.reduce((sum, q) => sum + q.percentage, 0) / quizResults.length) : 0
              }%. The student has completed {quizResults.length} quizzes with a {
                quizResults.filter(q => q.status === 'pass').length
              }/{quizResults.length} pass rate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherStudentView;
