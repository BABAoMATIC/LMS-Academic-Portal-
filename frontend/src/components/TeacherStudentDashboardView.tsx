import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  User,
  Award,
  Target,
  CheckCircle,
  Activity,
  Calendar,
  Users,
  Eye,
  Download,
  Filter,
  Search,
  ArrowLeft,
  RefreshCw,
  Star,
  Zap,
  Brain,
  X
} from 'lucide-react';
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
import LoadingSpinner from './LoadingSpinner';
import '../styles/teacher-student-dashboard.css';

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
    status: 'passed' | 'failed';
  }>;
  recentSubmissions: Array<{
    assignment_title: string;
    grade: number | null;
    submitted_date: string;
    status: 'graded' | 'pending';
    module_name?: string;
    submitted_at?: string;
    feedback?: string;
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
    study_hours: number;
    quiz_attempts: number;
    assignment_submissions: number;
  }>;
  gradeDistribution: Array<{
    grade_range: string;
    count: number;
    color: string;
  }>;
  learningStrengths: Array<{
    subject: string;
    strength_score: number;
    color: string;
  }>;
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

interface TeacherStudentDashboardViewProps {
  selectedStudent?: Student | null;
  onBack?: () => void;
  onStudentSelect?: (student: Student) => void;
}

const TeacherStudentDashboardView: React.FC<TeacherStudentDashboardViewProps> = ({ 
  selectedStudent, 
  onBack, 
  onStudentSelect 
}) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(selectedStudent || null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'gpa' | 'progress'>('name');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'assignments' | 'quizzes' | 'modules'>('overview');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration - in real app, this would come from API
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
            { week: "Week 1", study_hours: 12, quiz_attempts: 2, assignment_submissions: 1 },
            { week: "Week 2", study_hours: 15, quiz_attempts: 3, assignment_submissions: 2 },
            { week: "Week 3", study_hours: 10, quiz_attempts: 1, assignment_submissions: 1 },
            { week: "Week 4", study_hours: 18, quiz_attempts: 4, assignment_submissions: 3 }
          ],
          gradeDistribution: [
            { grade_range: "90-100", count: 8, color: "#10b981" },
            { grade_range: "80-89", count: 12, color: "#3b82f6" },
            { grade_range: "70-79", count: 6, color: "#f59e0b" },
            { grade_range: "60-69", count: 2, color: "#ef4444" },
            { grade_range: "Below 60", count: 1, color: "#6b7280" }
          ],
          learningStrengths: [
            { subject: "React", strength_score: 95, color: "#3b82f6" },
            { subject: "JavaScript", strength_score: 88, color: "#f59e0b" },
            { subject: "CSS", strength_score: 82, color: "#10b981" },
            { subject: "Node.js", strength_score: 75, color: "#8b5cf6" },
            { subject: "Database", strength_score: 70, color: "#ef4444" }
          ],
          modules: [
            { id: 1, name: "Introduction to Web Development", code: "WEB101", description: "Basic concepts", progress_percentage: 100, is_completed: true },
            { id: 2, name: "HTML & CSS Fundamentals", code: "WEB102", description: "Markup and styling", progress_percentage: 95, is_completed: false },
            { id: 3, name: "JavaScript Basics", code: "WEB103", description: "Programming fundamentals", progress_percentage: 80, is_completed: false }
          ],
          recent_assignments: [
            { id: 1, title: "Personal Portfolio", due_date: "2024-01-20", module_name: "Web Development" },
            { id: 2, title: "JavaScript Calculator", due_date: "2024-01-25", module_name: "JavaScript" }
          ],
          recent_quizzes: [
            { id: 1, title: "React Fundamentals", module_name: "React", score: 90, status: "attempted", due_date: "2024-01-15", duration: 30 },
            { id: 2, title: "CSS Grid Layout", module_name: "CSS", status: "not_attempted", due_date: "2024-01-18", duration: 25 }
          ],
          recent_submissions: [
            { id: 1, assignment_title: "Todo App Project", module_name: "React", submitted_at: "2024-01-14", status: "graded", grade: 92, max_points: 100, feedback: "Excellent work!" },
            { id: 2, assignment_title: "API Integration", module_name: "Node.js", submitted_at: "2024-01-11", status: "graded", grade: 88, max_points: 100, feedback: "Good implementation" }
          ],
          overall_progress: 85,
          recent_feedback: [
            { id: 1, message: "Great work on the React project!", timestamp: "2024-01-14T10:30:00Z" },
            { id: 2, message: "Consider improving your CSS skills", timestamp: "2024-01-12T14:20:00Z" }
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
            { week: "Week 1", study_hours: 20, quiz_attempts: 3, assignment_submissions: 2 },
            { week: "Week 2", study_hours: 18, quiz_attempts: 4, assignment_submissions: 3 },
            { week: "Week 3", study_hours: 22, quiz_attempts: 5, assignment_submissions: 4 },
            { week: "Week 4", study_hours: 16, quiz_attempts: 3, assignment_submissions: 1 }
          ],
          gradeDistribution: [
            { grade_range: "90-100", count: 15, color: "#10b981" },
            { grade_range: "80-89", count: 8, color: "#3b82f6" },
            { grade_range: "70-79", count: 2, color: "#f59e0b" },
            { grade_range: "60-69", count: 0, color: "#ef4444" },
            { grade_range: "Below 60", count: 0, color: "#6b7280" }
          ],
          learningStrengths: [
            { subject: "Python", strength_score: 98, color: "#3b82f6" },
            { subject: "Statistics", strength_score: 92, color: "#f59e0b" },
            { subject: "Machine Learning", strength_score: 89, color: "#10b981" },
            { subject: "Data Visualization", strength_score: 85, color: "#8b5cf6" },
            { subject: "SQL", strength_score: 80, color: "#ef4444" }
          ],
          modules: [
            { id: 4, name: "Python Programming", code: "DS101", description: "Python basics", progress_percentage: 100, is_completed: true },
            { id: 5, name: "Statistics & Probability", code: "DS102", description: "Statistical concepts", progress_percentage: 90, is_completed: false },
            { id: 6, name: "Machine Learning", code: "DS103", description: "ML algorithms", progress_percentage: 75, is_completed: false }
          ],
          recent_assignments: [
            { id: 3, title: "Data Analysis Report", due_date: "2024-01-22", module_name: "Data Science" },
            { id: 4, title: "ML Model Implementation", due_date: "2024-01-28", module_name: "Machine Learning" }
          ],
          recent_quizzes: [
            { id: 3, title: "Python Basics", module_name: "Python", score: 95, status: "attempted", due_date: "2024-01-16", duration: 30 },
            { id: 4, title: "Statistics Fundamentals", module_name: "Statistics", status: "not_attempted", due_date: "2024-01-20", duration: 35 }
          ],
          recent_submissions: [
            { id: 3, assignment_title: "Data Analysis Project", module_name: "Python", submitted_at: "2024-01-15", status: "graded", grade: 94, max_points: 100, feedback: "Outstanding analysis!" },
            { id: 4, assignment_title: "Statistical Report", module_name: "Statistics", submitted_at: "2024-01-12", status: "graded", grade: 91, max_points: 100, feedback: "Well-researched report" }
          ],
          overall_progress: 92,
          recent_feedback: [
            { id: 3, message: "Excellent data analysis skills!", timestamp: "2024-01-15T11:45:00Z" },
            { id: 4, message: "Keep up the great work in statistics", timestamp: "2024-01-12T16:30:00Z" }
          ]
        }
      ];

      setStudents(mockStudents);
      if (selectedStudent) {
        setCurrentStudent(selectedStudent);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'all' || student.course === filterCourse;
    return matchesSearch && matchesCourse;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'gpa':
        return b.personalStats.current_gpa - a.personalStats.current_gpa;
      case 'progress':
        return b.personalStats.completion_rate - a.personalStats.completion_rate;
      default:
        return 0;
    }
  });

  const handleStudentSelect = (student: Student) => {
    setCurrentStudent(student);
    if (onStudentSelect) {
      onStudentSelect(student);
    }
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
    fetchStudents();
  };

  if (loading) {
    return (
      <div className="teacher-student-dashboard-loading">
        <LoadingSpinner />
        <p className="loading-text">Loading student data...</p>
      </div>
    );
  }

  return (
    <div className="teacher-student-dashboard-container">
      {/* Header */}
      <div className="teacher-student-dashboard-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="back-button"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Student Dashboard View</h2>
              <p className="text-white/80">Monitor student academic details and performance with comprehensive analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="refresh-button"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <div className="text-sm text-white/80">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Student Selection */}
      {!currentStudent && (
        <div className="student-selection-section">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Select a Student</h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="search-icon w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Courses</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Computer Science">Computer Science</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="filter-select"
              >
                <option value="name">Sort by Name</option>
                <option value="gpa">Sort by GPA</option>
                <option value="progress">Sort by Progress</option>
              </select>
            </div>
          </div>

          <div className="students-grid">
            {filteredStudents.map((student, index) => (
              <div
                key={student.id}
                className="student-card"
                onClick={() => handleStudentSelect(student)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="student-card-header">
                  <div className="student-avatar">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="student-info">
                    <h4 className="student-name">{student.name}</h4>
                    <p className="student-id">{student.studentId}</p>
                    <p className="student-course">{student.course}</p>
                  </div>
                </div>
                
                <div className="student-stats">
                  <div className="stat-item">
                    <span className="stat-label">GPA</span>
                    <span className="stat-value">{student.personalStats.current_gpa}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Progress</span>
                    <span className="stat-value">{student.personalStats.completion_rate}%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Quizzes</span>
                    <span className="stat-value">{student.personalStats.total_quizzes_attempted}</span>
                  </div>
                </div>
                
                <button className="view-student-button">
                  <Eye className="w-4 h-4" />
                  View Dashboard
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student Dashboard View */}
      {currentStudent && (
        <div className="student-dashboard-view">
          {/* Student Header */}
          <div className="student-dashboard-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="student-profile">
                  <div className="student-avatar-large">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">{currentStudent.name}'s Dashboard</h2>
                    <p className="text-gray-600">{currentStudent.studentId} • {currentStudent.course}</p>
                    <p className="text-gray-500">{currentStudent.email}</p>
                  </div>
                </div>
                <div className="student-status">
                  <div className="status-indicator"></div>
                  <span className="status-text">Active Student</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentStudent(null)}
                  className="back-to-students-button"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Students
                </button>
                <button className="export-button">
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="student-dashboard-nav">
            <button
              onClick={() => setActiveTab('overview')}
              className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <BarChart3 className="w-5 h-5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <TrendingUp className="w-5 h-5" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`nav-tab ${activeTab === 'assignments' ? 'active' : ''}`}
            >
              <FileText className="w-5 h-5" />
              Assignments
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`nav-tab ${activeTab === 'quizzes' ? 'active' : ''}`}
            >
              <Award className="w-5 h-5" />
              Quizzes
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`nav-tab ${activeTab === 'modules' ? 'active' : ''}`}
            >
              <BookOpen className="w-5 h-5" />
              Modules
            </button>
          </div>

          {/* Tab Content */}
          <div className="student-dashboard-content">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                {/* Quick Stats */}
                <div className="stats-grid">
                  <div className="stat-card blue">
                    <div className="stat-icon">
                      <Award className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{currentStudent.personalStats.current_gpa}</div>
                      <div className="stat-label">GPA</div>
                    </div>
                  </div>
                  <div className="stat-card green">
                    <div className="stat-icon">
                      <Target className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{currentStudent.personalStats.completion_rate}%</div>
                      <div className="stat-label">Progress</div>
                    </div>
                  </div>
                  <div className="stat-card purple">
                    <div className="stat-icon">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{currentStudent.personalStats.total_quizzes_attempted}</div>
                      <div className="stat-label">Quizzes</div>
                    </div>
                  </div>
                  <div className="stat-card orange">
                    <div className="stat-icon">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{currentStudent.personalStats.total_assignments_submitted}</div>
                      <div className="stat-label">Assignments</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="activity-section">
                  <h3 className="section-title">Recent Activity</h3>
                  <div className="activity-grid">
                    <div className="activity-card">
                      <h4 className="card-title">Recent Quiz Attempts</h4>
                      <div className="activity-list">
                        {currentStudent.recentQuizAttempts.slice(0, 3).map((quiz, index) => (
                          <div key={index} className="activity-item">
                            <div className={`activity-icon ${quiz.status === 'passed' ? 'success' : 'error'}`}>
                              {quiz.status === 'passed' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </div>
                            <div className="activity-content">
                              <div className="activity-title">{quiz.quiz_title}</div>
                              <div className="activity-subtitle">{quiz.attempt_date}</div>
                            </div>
                            <div className="activity-value">{quiz.score}/{quiz.max_score}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="activity-card">
                      <h4 className="card-title">Recent Submissions</h4>
                      <div className="activity-list">
                        {currentStudent.recentSubmissions.slice(0, 3).map((submission, index) => (
                          <div key={index} className="activity-item">
                            <div className={`activity-icon ${submission.status === 'graded' ? 'success' : 'pending'}`}>
                              {submission.status === 'graded' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            </div>
                            <div className="activity-content">
                              <div className="activity-title">{submission.assignment_title}</div>
                              <div className="activity-subtitle">{submission.submitted_date}</div>
                            </div>
                            <div className="activity-value">
                              {submission.grade ? `${submission.grade}%` : 'Pending'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="analytics-tab">
                {/* Performance Overview */}
                <div className="performance-overview">
                  <h3 className="section-title">Performance Overview</h3>
                  <div className="performance-grid">
                    <div className="performance-card">
                      <div className="performance-header">
                        <h4 className="performance-title">Quiz Performance</h4>
                        <span className="performance-value">{currentStudent.personalStats.average_quiz_score}%</span>
                      </div>
                      <div className="performance-bar">
                        <div 
                          className="performance-fill"
                          style={{ width: `${currentStudent.personalStats.average_quiz_score}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="performance-card">
                      <div className="performance-header">
                        <h4 className="performance-title">Assignment Performance</h4>
                        <span className="performance-value">{currentStudent.personalStats.average_assignment_grade}%</span>
                      </div>
                      <div className="performance-bar">
                        <div 
                          className="performance-fill"
                          style={{ width: `${currentStudent.personalStats.average_assignment_grade}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="charts-section">
                  <h3 className="section-title">Performance Analytics</h3>
                  <div className="charts-grid">
                    {/* Monthly Progress Chart */}
                    <div className="chart-card">
                      <h4 className="chart-title">Monthly Progress Trend</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={currentStudent.monthlyProgress}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: '1px solid #e5e7eb', 
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }} 
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="average_score" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                            name="Average Score"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="quizzes_taken" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                            name="Quizzes Taken"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Subject Performance Chart */}
                    <div className="chart-card">
                      <h4 className="chart-title">Subject Performance</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={currentStudent.subjectPerformance}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="subject" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: '1px solid #e5e7eb', 
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }} 
                          />
                          <Bar 
                            dataKey="average_score" 
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            name="Average Score"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Grade Distribution Chart */}
                    <div className="chart-card">
                      <h4 className="chart-title">Grade Distribution</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                          <Pie
                            data={currentStudent.gradeDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ grade_range, count }) => `${grade_range}: ${count}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {currentStudent.gradeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: '1px solid #e5e7eb', 
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }} 
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Weekly Activity Chart */}
                    <div className="chart-card">
                      <h4 className="chart-title">Weekly Study Activity</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={currentStudent.weeklyActivity}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="week" stroke="#666" />
                          <YAxis stroke="#666" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: '1px solid #e5e7eb', 
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }} 
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="study_hours" 
                            stackId="1" 
                            stroke="#8b5cf6" 
                            fill="#8b5cf6" 
                            fillOpacity={0.6}
                            name="Study Hours"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="quiz_attempts" 
                            stackId="2" 
                            stroke="#f59e0b" 
                            fill="#f59e0b" 
                            fillOpacity={0.6}
                            name="Quiz Attempts"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="assignments-tab">
                <h3 className="section-title">Assignment Submissions</h3>
                <div className="assignments-list">
                  {currentStudent.recentSubmissions.map((submission, index) => (
                    <div key={index} className="assignment-item">
                      <div className="assignment-header">
                        <h4 className="assignment-title">{submission.assignment_title}</h4>
                        <div className={`assignment-status ${submission.status}`}>
                          {submission.status}
                        </div>
                      </div>
                      <div className="assignment-details">
                        <div className="assignment-info">
                          <span className="assignment-module">{submission.module_name || 'General'}</span>
                          <span className="assignment-date">{submission.submitted_at || submission.submitted_date}</span>
                        </div>
                        <div className="assignment-grade">
                          {submission.grade ? (
                            <span className="grade-value">{submission.grade}%</span>
                          ) : (
                            <span className="grade-pending">Pending</span>
                          )}
                        </div>
                      </div>
                      {submission.feedback && (
                        <div className="assignment-feedback">
                          <strong>Feedback:</strong> {submission.feedback}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'quizzes' && (
              <div className="quizzes-tab">
                <h3 className="section-title">Quiz Attempts</h3>
                <div className="quizzes-list">
                  {currentStudent.recentQuizAttempts.map((quiz, index) => (
                    <div key={index} className="quiz-item">
                      <div className="quiz-header">
                        <h4 className="quiz-title">{quiz.quiz_title}</h4>
                        <div className={`quiz-status ${quiz.status}`}>
                          {quiz.status}
                        </div>
                      </div>
                      <div className="quiz-details">
                        <div className="quiz-score">
                          <span className="score-value">{quiz.score}/{quiz.max_score}</span>
                          <span className="score-percentage">
                            {Math.round((quiz.score / quiz.max_score) * 100)}%
                          </span>
                        </div>
                        <div className="quiz-date">{quiz.attempt_date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'modules' && (
              <div className="modules-tab">
                <h3 className="section-title">Module Progress</h3>
                <div className="modules-list">
                  {currentStudent.modules.map((module, index) => (
                    <div key={index} className="module-item">
                      <div className="module-header">
                        <h4 className="module-title">{module.name}</h4>
                        <div className="module-code">{module.code}</div>
                      </div>
                      <div className="module-description">{module.description}</div>
                      <div className="module-progress">
                        <div className="progress-header">
                          <span className="progress-label">Progress</span>
                          <span className="progress-value">{module.progress_percentage}%</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${module.progress_percentage}%` }}
                          ></div>
                        </div>
                        <div className="module-status">
                          {module.is_completed ? (
                            <span className="status-completed">Completed</span>
                          ) : (
                            <span className="status-in-progress">In Progress</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudentDashboardView;
