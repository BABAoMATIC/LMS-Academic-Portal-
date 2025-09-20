import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  BookOpen, 
  FileText, 
  Award, 
  Target, 
  Clock,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  X,
  HelpCircle,
  Users,
  Search,
  MessageSquare,
  Star,
  Eye,
  Mail,
  User,
  Calendar,
  GraduationCap,
  TrendingDown,
  AlertCircle,
  ArrowRight,
  Filter,
  Download,
  MoreVertical
} from 'lucide-react';
import '../styles/student-analytics-enhanced.css';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar
} from 'recharts';
import DataAnalyticsDashboard from './DataAnalyticsDashboard';

interface Student {
  id: number;
  name: string;
  email: string;
  studentId: string;
  course: string;
  avatar?: string;
  personalStats: {
    total_quizzes_attempted: number;
    total_assignments_submitted: number;
    average_quiz_score: number;
    average_assignment_grade: number;
    completion_rate: number;
    current_gpa: number;
  };
  recentQuizAttempts: Array<{
    quiz_title: string;
    score: number;
    max_score: number;
    attempt_date: string;
    status: string;
  }>;
  recentSubmissions: Array<{
    assignment_title: string;
    grade: number | null;
    submitted_date: string;
    status: string;
  }>;
  subjectPerformance: Array<{
    subject: string;
    average_score: number;
    total_attempts: number;
  }>;
  monthlyProgress: Array<{
    month: string;
    quizzes_taken: number;
    assignments_submitted: number;
    average_score: number;
  }>;
  weeklyActivity: Array<{
    week: string;
    hours_studied: number;
    quizzes_taken: number;
    assignments_submitted: number;
  }>;
}

const TeacherStudentAnalytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'activity'>('name');
  const [studentDashboardTab, setStudentDashboardTab] = useState<'overview' | 'assignments' | 'quizzes' | 'progress' | 'achievements'>('overview');

  useEffect(() => {
    // Mock data for students
    const mockStudents: Student[] = [
      {
        id: 1,
        name: "John Smith",
        email: "john.smith@email.com",
        studentId: "STU001",
        course: "Web Development",
        personalStats: {
          total_quizzes_attempted: 12,
          total_assignments_submitted: 8,
          average_quiz_score: 85.5,
          average_assignment_grade: 88.2,
          completion_rate: 92,
          current_gpa: 3.7
        },
        recentQuizAttempts: [
          { quiz_title: "React Fundamentals", score: 18, max_score: 20, attempt_date: "2024-01-15", status: "passed" },
          { quiz_title: "JavaScript ES6", score: 15, max_score: 20, attempt_date: "2024-01-12", status: "passed" },
          { quiz_title: "CSS Grid Layout", score: 12, max_score: 20, attempt_date: "2024-01-10", status: "failed" }
        ],
        recentSubmissions: [
          { assignment_title: "Todo App Project", grade: 92, submitted_date: "2024-01-14", status: "graded" },
          { assignment_title: "API Integration", grade: 88, submitted_date: "2024-01-11", status: "graded" },
          { assignment_title: "Database Design", grade: null, submitted_date: "2024-01-16", status: "pending" }
        ],
        subjectPerformance: [
          { subject: "Web Development", average_score: 89.2, total_attempts: 6 },
          { subject: "JavaScript", average_score: 87.5, total_attempts: 4 },
          { subject: "React", average_score: 91.0, total_attempts: 3 },
          { subject: "CSS", average_score: 82.3, total_attempts: 2 }
        ],
        monthlyProgress: [
          { month: "Oct", quizzes_taken: 3, assignments_submitted: 2, average_score: 85 },
          { month: "Nov", quizzes_taken: 4, assignments_submitted: 3, average_score: 88 },
          { month: "Dec", quizzes_taken: 2, assignments_submitted: 1, average_score: 90 },
          { month: "Jan", quizzes_taken: 3, assignments_submitted: 2, average_score: 87 }
        ],
        weeklyActivity: [
          { week: "Week 1", hours_studied: 12, quizzes_taken: 2, assignments_submitted: 1 },
          { week: "Week 2", hours_studied: 15, quizzes_taken: 3, assignments_submitted: 2 },
          { week: "Week 3", hours_studied: 10, quizzes_taken: 1, assignments_submitted: 1 },
          { week: "Week 4", hours_studied: 18, quizzes_taken: 4, assignments_submitted: 3 }
        ]
      },
      {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        studentId: "STU002",
        course: "Data Science",
        personalStats: {
          total_quizzes_attempted: 15,
          total_assignments_submitted: 10,
          average_quiz_score: 92.3,
          average_assignment_grade: 89.5,
          completion_rate: 95,
          current_gpa: 3.9
        },
        recentQuizAttempts: [
          { quiz_title: "Python Basics", score: 19, max_score: 20, attempt_date: "2024-01-16", status: "passed" },
          { quiz_title: "Statistics", score: 17, max_score: 20, attempt_date: "2024-01-14", status: "passed" },
          { quiz_title: "Machine Learning", score: 16, max_score: 20, attempt_date: "2024-01-12", status: "passed" }
        ],
        recentSubmissions: [
          { assignment_title: "Data Analysis Project", grade: 94, submitted_date: "2024-01-15", status: "graded" },
          { assignment_title: "Statistical Report", grade: 91, submitted_date: "2024-01-12", status: "graded" },
          { assignment_title: "ML Model", grade: null, submitted_date: "2024-01-17", status: "pending" }
        ],
        subjectPerformance: [
          { subject: "Python", average_score: 94.5, total_attempts: 8 },
          { subject: "Statistics", average_score: 91.2, total_attempts: 5 },
          { subject: "Machine Learning", average_score: 89.8, total_attempts: 4 },
          { subject: "Data Visualization", average_score: 93.1, total_attempts: 3 }
        ],
        monthlyProgress: [
          { month: "Oct", quizzes_taken: 4, assignments_submitted: 3, average_score: 88 },
          { month: "Nov", quizzes_taken: 5, assignments_submitted: 4, average_score: 91 },
          { month: "Dec", quizzes_taken: 3, assignments_submitted: 2, average_score: 93 },
          { month: "Jan", quizzes_taken: 3, assignments_submitted: 1, average_score: 95 }
        ],
        weeklyActivity: [
          { week: "Week 1", hours_studied: 20, quizzes_taken: 3, assignments_submitted: 2 },
          { week: "Week 2", hours_studied: 18, quizzes_taken: 4, assignments_submitted: 3 },
          { week: "Week 3", hours_studied: 22, quizzes_taken: 5, assignments_submitted: 4 },
          { week: "Week 4", hours_studied: 16, quizzes_taken: 3, assignments_submitted: 1 }
        ]
      },
      {
        id: 3,
        name: "Michael Chen",
        email: "michael.chen@email.com",
        studentId: "STU003",
        course: "Computer Science",
        personalStats: {
          total_quizzes_attempted: 18,
          total_assignments_submitted: 12,
          average_quiz_score: 78.2,
          average_assignment_grade: 82.1,
          completion_rate: 88,
          current_gpa: 3.4
        },
        recentQuizAttempts: [
          { quiz_title: "Data Structures", score: 16, max_score: 20, attempt_date: "2024-01-16", status: "passed" },
          { quiz_title: "Algorithms", score: 14, max_score: 20, attempt_date: "2024-01-14", status: "passed" },
          { quiz_title: "Database Systems", score: 11, max_score: 20, attempt_date: "2024-01-12", status: "failed" }
        ],
        recentSubmissions: [
          { assignment_title: "Binary Tree Implementation", grade: 85, submitted_date: "2024-01-15", status: "graded" },
          { assignment_title: "Sorting Algorithm", grade: 79, submitted_date: "2024-01-12", status: "graded" },
          { assignment_title: "Database Design", grade: null, submitted_date: "2024-01-17", status: "pending" }
        ],
        subjectPerformance: [
          { subject: "Data Structures", average_score: 82.1, total_attempts: 6 },
          { subject: "Algorithms", average_score: 78.5, total_attempts: 5 },
          { subject: "Database Systems", average_score: 75.2, total_attempts: 4 },
          { subject: "Software Engineering", average_score: 80.8, total_attempts: 3 }
        ],
        monthlyProgress: [
          { month: "Oct", quizzes_taken: 4, assignments_submitted: 3, average_score: 76 },
          { month: "Nov", quizzes_taken: 5, assignments_submitted: 4, average_score: 79 },
          { month: "Dec", quizzes_taken: 3, assignments_submitted: 2, average_score: 81 },
          { month: "Jan", quizzes_taken: 6, assignments_submitted: 3, average_score: 78 }
        ],
        weeklyActivity: [
          { week: "Week 1", hours_studied: 15, quizzes_taken: 2, assignments_submitted: 1 },
          { week: "Week 2", hours_studied: 18, quizzes_taken: 3, assignments_submitted: 2 },
          { week: "Week 3", hours_studied: 12, quizzes_taken: 2, assignments_submitted: 1 },
          { week: "Week 4", hours_studied: 20, quizzes_taken: 4, assignments_submitted: 3 }
        ]
      },
      {
        id: 4,
        name: "Emily Rodriguez",
        email: "emily.rodriguez@email.com",
        studentId: "STU004",
        course: "Graphic Design",
        personalStats: {
          total_quizzes_attempted: 10,
          total_assignments_submitted: 7,
          average_quiz_score: 91.5,
          average_assignment_grade: 94.2,
          completion_rate: 96,
          current_gpa: 3.8
        },
        recentQuizAttempts: [
          { quiz_title: "Color Theory", score: 19, max_score: 20, attempt_date: "2024-01-16", status: "passed" },
          { quiz_title: "Typography", score: 18, max_score: 20, attempt_date: "2024-01-14", status: "passed" },
          { quiz_title: "Design Principles", score: 17, max_score: 20, attempt_date: "2024-01-12", status: "passed" }
        ],
        recentSubmissions: [
          { assignment_title: "Brand Identity Project", grade: 96, submitted_date: "2024-01-15", status: "graded" },
          { assignment_title: "Poster Design", grade: 92, submitted_date: "2024-01-12", status: "graded" },
          { assignment_title: "Web Design", grade: null, submitted_date: "2024-01-17", status: "pending" }
        ],
        subjectPerformance: [
          { subject: "Color Theory", average_score: 94.5, total_attempts: 4 },
          { subject: "Typography", average_score: 91.2, total_attempts: 3 },
          { subject: "Design Principles", average_score: 89.8, total_attempts: 3 },
          { subject: "Digital Design", average_score: 93.1, total_attempts: 2 }
        ],
        monthlyProgress: [
          { month: "Oct", quizzes_taken: 2, assignments_submitted: 2, average_score: 89 },
          { month: "Nov", quizzes_taken: 3, assignments_submitted: 2, average_score: 92 },
          { month: "Dec", quizzes_taken: 2, assignments_submitted: 1, average_score: 94 },
          { month: "Jan", quizzes_taken: 3, assignments_submitted: 2, average_score: 91 }
        ],
        weeklyActivity: [
          { week: "Week 1", hours_studied: 14, quizzes_taken: 1, assignments_submitted: 1 },
          { week: "Week 2", hours_studied: 16, quizzes_taken: 2, assignments_submitted: 1 },
          { week: "Week 3", hours_studied: 12, quizzes_taken: 1, assignments_submitted: 1 },
          { week: "Week 4", hours_studied: 18, quizzes_taken: 2, assignments_submitted: 2 }
        ]
      },
      {
        id: 5,
        name: "David Wilson",
        email: "david.wilson@email.com",
        studentId: "STU005",
        course: "Business Administration",
        personalStats: {
          total_quizzes_attempted: 14,
          total_assignments_submitted: 9,
          average_quiz_score: 83.7,
          average_assignment_grade: 86.4,
          completion_rate: 90,
          current_gpa: 3.6
        },
        recentQuizAttempts: [
          { quiz_title: "Marketing Strategy", score: 17, max_score: 20, attempt_date: "2024-01-16", status: "passed" },
          { quiz_title: "Financial Analysis", score: 15, max_score: 20, attempt_date: "2024-01-14", status: "passed" },
          { quiz_title: "Operations Management", score: 13, max_score: 20, attempt_date: "2024-01-12", status: "failed" }
        ],
        recentSubmissions: [
          { assignment_title: "Business Plan", grade: 88, submitted_date: "2024-01-15", status: "graded" },
          { assignment_title: "Market Research", grade: 84, submitted_date: "2024-01-12", status: "graded" },
          { assignment_title: "Financial Report", grade: null, submitted_date: "2024-01-17", status: "pending" }
        ],
        subjectPerformance: [
          { subject: "Marketing", average_score: 87.2, total_attempts: 5 },
          { subject: "Finance", average_score: 82.5, total_attempts: 4 },
          { subject: "Operations", average_score: 79.8, total_attempts: 3 },
          { subject: "Strategy", average_score: 85.1, total_attempts: 2 }
        ],
        monthlyProgress: [
          { month: "Oct", quizzes_taken: 3, assignments_submitted: 2, average_score: 81 },
          { month: "Nov", quizzes_taken: 4, assignments_submitted: 3, average_score: 84 },
          { month: "Dec", quizzes_taken: 2, assignments_submitted: 1, average_score: 86 },
          { month: "Jan", quizzes_taken: 5, assignments_submitted: 3, average_score: 83 }
        ],
        weeklyActivity: [
          { week: "Week 1", hours_studied: 16, quizzes_taken: 2, assignments_submitted: 1 },
          { week: "Week 2", hours_studied: 19, quizzes_taken: 3, assignments_submitted: 2 },
          { week: "Week 3", hours_studied: 14, quizzes_taken: 2, assignments_submitted: 1 },
          { week: "Week 4", hours_studied: 17, quizzes_taken: 3, assignments_submitted: 2 }
        ]
      }
    ];

    setStudents(mockStudents);
    setFilteredStudents(mockStudents);
    setLoading(false);
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort students
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'score':
          return b.personalStats.average_quiz_score - a.personalStats.average_quiz_score;
        case 'activity':
          return b.personalStats.total_quizzes_attempted - a.personalStats.total_quizzes_attempted;
        default:
          return 0;
      }
    });

    setFilteredStudents(filtered);
  }, [students, searchTerm, sortBy]);

  const handleSendFeedback = () => {
    if (selectedStudent && feedbackText.trim()) {
      // Here you would typically send the feedback to the backend
      console.log(`Sending feedback to ${selectedStudent.name}: ${feedbackText}`);
      setFeedbackText('');
      setShowFeedbackModal(false);
    }
  };

  if (loading) {
    return (
      <div className="student-analytics-loading">
        <div className="student-analytics-spinner"></div>
      </div>
    );
  }

  return (
    <div className="student-analytics-container">
      <div className="student-analytics-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">
                Student Analytics Dashboard
              </h2>
              <p className="text-white/80 text-lg font-medium">Monitor and analyze student performance with comprehensive insights</p>
            </div>
          </div>
          
          {/* Enhanced View Mode Toggle */}
          <div className="student-analytics-view-toggle flex">
            <button
              onClick={() => setViewMode('list')}
              className={`student-analytics-view-button ${viewMode === 'list' ? 'active' : ''}`}
            >
              <Users className="w-6 h-6" />
              <span>Student List</span>
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`student-analytics-view-button ${viewMode === 'analytics' ? 'active' : ''}`}
            >
              <BarChart3 className="w-6 h-6" />
              <span>Analytics</span>
            </button>
          </div>
        </div>
          
        {/* Enhanced Stats Grid */}
        <div className="student-analytics-stats-grid">
          {/* Total Students Card */}
          <div className="student-analytics-stat-card blue">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{students.length}</div>
                <div className="text-sm text-white/80 font-medium">Total Students</div>
              </div>
            </div>
          </div>
          
          {/* Active Students Card */}
          <div className="student-analytics-stat-card green">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">
                  {students.filter(s => s.personalStats.completion_rate > 80).length}
                </div>
                <div className="text-sm text-white/80 font-medium">Active Students</div>
              </div>
            </div>
          </div>
          
          {/* Average Score Card */}
          <div className="student-analytics-stat-card purple">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">
                  {Math.round(students.reduce((acc, s) => acc + s.personalStats.average_quiz_score, 0) / students.length)}%
                </div>
                <div className="text-sm text-white/80 font-medium">Average Score</div>
              </div>
            </div>
          </div>
          
          {/* Completion Rate Card */}
          <div className="student-analytics-stat-card orange">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">
                  {Math.round(students.reduce((acc, s) => acc + s.personalStats.completion_rate, 0) / students.length)}%
                </div>
                <div className="text-sm text-white/80 font-medium">Avg Completion</div>
              </div>
            </div>
          </div>
        </div>
          
        {/* Enhanced Search and Filter Section */}
        <div className="student-analytics-search">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="student-analytics-search-icon w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search students by name, email, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="student-analytics-search-input w-full"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'score' | 'activity')}
                  className="student-analytics-filter"
                >
                  <option value="name">Sort by Name</option>
                  <option value="score">Sort by Score</option>
                  <option value="activity">Sort by Activity</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <Filter className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              <button className="student-analytics-export-button">
                <Download className="w-6 h-6" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-8">
        {viewMode === 'list' ? (
          /* Student List View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">Student Directory</h3>
              <div className="text-sm text-gray-600">
                Showing {filteredStudents.length} of {students.length} students
              </div>
            </div>
            
            <div className="student-analytics-grid">
              {filteredStudents.map((student, index) => (
                <div
                  key={student.id}
                  className={`student-analytics-card student-analytics-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedStudent(student)}
                >
                  {/* Animated Background */}
                  <div className="student-analytics-card-bg"></div>
                  <div className="student-analytics-card-orb student-analytics-card-orb-1"></div>
                  <div className="student-analytics-card-orb student-analytics-card-orb-2"></div>
                  
                  {/* Enhanced Student Header */}
                  <div className="student-analytics-card-header">
                    <div className="student-analytics-avatar-container">
                      <div className="student-analytics-avatar">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div className="student-analytics-status-indicator"></div>
                    </div>
                    <div className="student-analytics-student-info">
                      <h4 className="student-analytics-student-name">
                        {student.name}
                      </h4>
                      <p className="student-analytics-student-id">{student.studentId}</p>
                      <div className="student-analytics-status">
                        <div className="student-analytics-status-dot"></div>
                        <span className="student-analytics-status-text">Active</span>
                      </div>
                    </div>
                    <button className="student-analytics-more-button">
                      <MoreVertical className="w-6 h-6" />
                    </button>
                  </div>
                  
                  {/* Student Info */}
                  <div className="student-analytics-info-section">
                    <div className="student-analytics-info-item">
                      <Mail className="w-4 h-4" />
                      <span className="student-analytics-info-text">{student.email}</span>
                    </div>
                    <div className="student-analytics-info-item">
                      <GraduationCap className="w-4 h-4" />
                      <span className="student-analytics-info-text">{student.course}</span>
                    </div>
                  </div>
                  
                  {/* Enhanced Performance Stats */}
                  <div className="student-analytics-stats-grid">
                    <div className="student-analytics-stat-card student-analytics-stat-blue">
                      <div className="student-analytics-stat-value">
                        {student.personalStats.average_quiz_score}%
                      </div>
                      <div className="student-analytics-stat-label">Quiz Score</div>
                      <div className="student-analytics-stat-indicator student-analytics-stat-indicator-blue"></div>
                    </div>
                    <div className="student-analytics-stat-card student-analytics-stat-green">
                      <div className="student-analytics-stat-value">
                        {student.personalStats.completion_rate}%
                      </div>
                      <div className="student-analytics-stat-label">Completion</div>
                      <div className="student-analytics-stat-indicator student-analytics-stat-indicator-green"></div>
                    </div>
                  </div>
                  
                  {/* Enhanced Recent Activity */}
                  <div className="student-analytics-activity-section">
                    <div className="student-analytics-activity-item">
                      <span className="student-analytics-activity-label">Recent Quiz</span>
                      <span className="student-analytics-activity-value">
                        {student.recentQuizAttempts[0]?.quiz_title || 'None'}
                      </span>
                    </div>
                    <div className="student-analytics-activity-item">
                      <span className="student-analytics-activity-label">GPA</span>
                      <span className="student-analytics-activity-value">{student.personalStats.current_gpa}</span>
                    </div>
                  </div>
                  
                  {/* Enhanced Action Button */}
                  <button 
                    onClick={() => navigate(`/student-analytics/${student.id}`)}
                    className="student-analytics-action-button"
                  >
                    <div className="student-analytics-button-bg"></div>
                    <Eye className="w-5 h-5 student-analytics-button-icon" />
                    <span className="student-analytics-button-text">View Student Analytics</span>
                    <div className="student-analytics-button-overlay"></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Analytics Dashboard View */
          <div className="space-y-8">
            {/* Analytics Overview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h3>
                  <p className="text-gray-600 text-lg">Comprehensive data visualization and insights</p>
                </div>
              </div>
              
              <DataAnalyticsDashboard />
            </div>
          </div>
        )}
      </div>
      
      {/* Complete Student Dashboard Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-3xl w-full max-w-7xl max-h-[95vh] overflow-y-auto shadow-2xl">
            {/* Student Dashboard Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-t-3xl p-8 border-b border-gray-200 shadow-lg">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-6 right-6 p-3 hover:bg-white/50 rounded-2xl transition-all duration-300 hover:scale-110"
              >
                <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              </button>
              
              <div className="flex items-center gap-8 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl font-bold text-gray-800 mb-2">{selectedStudent.name}'s Dashboard</h2>
                  <p className="text-xl text-gray-600 mb-1">{selectedStudent.studentId} • {selectedStudent.course}</p>
                  <p className="text-gray-500 mb-4">{selectedStudent.email}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-semibold">Active Student</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-700 font-semibold">Enrolled</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Dashboard Navigation */}
              <div className="flex bg-white/90 backdrop-blur-md rounded-2xl p-2 border border-white/30 shadow-lg">
                <button
                  onClick={() => setStudentDashboardTab('overview')}
                  className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    studentDashboardTab === 'overview' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  Overview
                </button>
                <button
                  onClick={() => setStudentDashboardTab('assignments')}
                  className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    studentDashboardTab === 'assignments' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  Assignments
                </button>
                <button
                  onClick={() => setStudentDashboardTab('quizzes')}
                  className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    studentDashboardTab === 'quizzes' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                  Quizzes
                </button>
                <button
                  onClick={() => setStudentDashboardTab('progress')}
                  className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    studentDashboardTab === 'progress' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  Progress
                </button>
                <button
                  onClick={() => setStudentDashboardTab('achievements')}
                  className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                    studentDashboardTab === 'achievements' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <Award className="w-5 h-5" />
                  Achievements
                </button>
              </div>
            </div>
            
            <div className="p-8">
              {/* Student Dashboard Content Based on Selected Tab */}
              {studentDashboardTab === 'overview' && (
                <div className="space-y-8">
                  {/* Performance Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-blue-600">
                          {selectedStudent.personalStats.average_quiz_score}%
                        </div>
                      </div>
                      <div className="text-sm text-blue-600 font-semibold">Quiz Average</div>
                      <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                          style={{width: `${selectedStudent.personalStats.average_quiz_score}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="group relative bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-green-600">
                          {selectedStudent.personalStats.completion_rate}%
                        </div>
                      </div>
                      <div className="text-sm text-green-600 font-semibold">Completion Rate</div>
                      <div className="w-full bg-green-200 rounded-full h-2 mt-3">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                          style={{width: `${selectedStudent.personalStats.completion_rate}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="group relative bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-purple-600">
                          {selectedStudent.personalStats.current_gpa}
                        </div>
                      </div>
                      <div className="text-sm text-purple-600 font-semibold">GPA</div>
                      <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                          style={{width: `${(selectedStudent.personalStats.current_gpa / 4) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="group relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-orange-600">
                          {selectedStudent.personalStats.total_quizzes_attempted}
                        </div>
                      </div>
                      <div className="text-sm text-orange-600 font-semibold">Quizzes Taken</div>
                      <div className="text-xs text-orange-500 mt-2">
                        {selectedStudent.personalStats.total_assignments_submitted} assignments submitted
                      </div>
                    </div>
                  </div>

                  {/* Subject Performance Chart */}
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                      Subject Performance
                    </h3>
                    <div className="space-y-4">
                      {selectedStudent.subjectPerformance.map((subject, index) => (
                        <div key={index} className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-700">{subject.subject}</span>
                            <span className="text-lg font-bold text-blue-600">{subject.average_score}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                              style={{width: `${subject.average_score}%`}}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{subject.total_attempts} attempts</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {studentDashboardTab === 'assignments' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <FileText className="w-6 h-6 text-indigo-600" />
                      Assignment Submissions
                    </h3>
                    <div className="space-y-4">
                      {selectedStudent.recentSubmissions.map((submission, index) => (
                        <div key={index} className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                          submission.status === 'graded' 
                            ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' 
                            : 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-bold text-xl text-gray-800 mb-2">{submission.assignment_title}</div>
                              <div className="text-sm text-gray-600 mb-2">Submitted: {submission.submitted_date}</div>
                              <div className="flex items-center gap-4">
                                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  submission.status === 'graded' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {submission.status}
                                </div>
                                {submission.grade && (
                                  <div className="text-2xl font-bold text-blue-600">
                                    {submission.grade}%
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-3xl font-bold ${
                                submission.grade ? 'text-green-600' : 'text-orange-600'
                              }`}>
                                {submission.grade ? `${submission.grade}%` : 'Pending'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {studentDashboardTab === 'quizzes' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                      Quiz Attempts
                    </h3>
                    <div className="space-y-4">
                      {selectedStudent.recentQuizAttempts.map((quiz, index) => (
                        <div key={index} className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                          quiz.status === 'passed' 
                            ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' 
                            : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-bold text-xl text-gray-800 mb-2">{quiz.quiz_title}</div>
                              <div className="text-sm text-gray-600 mb-2">Attempted: {quiz.attempt_date}</div>
                              <div className="flex items-center gap-4">
                                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  quiz.status === 'passed' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {quiz.status}
                                </div>
                                <div className="text-lg font-semibold text-gray-700">
                                  Score: {quiz.score}/{quiz.max_score}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-3xl font-bold ${
                                quiz.status === 'passed' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {Math.round((quiz.score / quiz.max_score) * 100)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {studentDashboardTab === 'progress' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      Monthly Progress
                    </h3>
                    <div className="space-y-4">
                      {selectedStudent.monthlyProgress.map((month, index) => (
                        <div key={index} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-lg transition-all duration-300">
                          <div className="flex-1">
                            <div className="font-bold text-xl text-gray-800 mb-2">{month.month}</div>
                            <div className="text-sm text-gray-600 mb-2">
                              {month.quizzes_taken} quizzes • {month.assignments_submitted} assignments
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
                                style={{width: `${month.average_score}%`}}
                              ></div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-green-600">{month.average_score}%</div>
                            <div className="text-sm text-gray-500">Average Score</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <Activity className="w-6 h-6 text-blue-600" />
                      Weekly Activity
                    </h3>
                    <div className="space-y-4">
                      {selectedStudent.weeklyActivity.map((week, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                          <div>
                            <div className="font-bold text-gray-800">{week.week}</div>
                            <div className="text-sm text-gray-600">
                              {week.hours_studied} hours studied
                            </div>
                          </div>
                          <div className="flex gap-6 text-right">
                            <div>
                              <div className="text-lg font-bold text-blue-600">{week.quizzes_taken}</div>
                              <div className="text-xs text-gray-500">Quizzes</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-purple-600">{week.assignments_submitted}</div>
                              <div className="text-xs text-gray-500">Assignments</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {studentDashboardTab === 'achievements' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Achievement Cards */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl p-6 border border-yellow-200 shadow-lg">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">Quiz Master</div>
                          <div className="text-sm text-gray-600">Completed 10+ quizzes</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedStudent.personalStats.total_quizzes_attempted >= 10 ? 'Unlocked' : 'Locked'}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200 shadow-lg">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">Perfect Score</div>
                          <div className="text-sm text-gray-600">100% on any quiz</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {selectedStudent.personalStats.average_quiz_score === 100 ? 'Unlocked' : 'Locked'}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 border border-purple-200 shadow-lg">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">High Achiever</div>
                          <div className="text-sm text-gray-600">GPA above 3.5</div>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedStudent.personalStats.current_gpa >= 3.5 ? 'Unlocked' : 'Locked'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                      <Award className="w-6 h-6 text-yellow-600" />
                      Achievement Progress
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                        <div>
                          <div className="font-bold text-gray-800">Quiz Completion</div>
                          <div className="text-sm text-gray-600">Complete more quizzes to unlock achievements</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedStudent.personalStats.total_quizzes_attempted}/20
                          </div>
                          <div className="w-24 bg-blue-200 rounded-full h-2 mt-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                              style={{width: `${(selectedStudent.personalStats.total_quizzes_attempted / 20) * 100}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudentAnalytics;