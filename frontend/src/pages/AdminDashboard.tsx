import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  BarChart3, 
  FileText, 
  BookOpen, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import notificationService from '../services/notificationService';
import '../styles/admin-dashboard-enhanced.css';

interface Assignment {
  id: number;
  title: string;
  description: string;
  deadline: string;
  module_name: string;
  teacher_id: number;
  file_path?: string;
  created_at: string;
  updated_at: string;
  submission_count?: number;
  average_score?: number;
  pass_rate?: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  duration: number;
  deadline: string;
  module_name: string;
  teacher_id: number;
  created_at: string;
  updated_at: string;
  attempt_count?: number;
  average_score?: number;
  pass_rate?: number;
}

interface StudentSubmission {
  id: number;
  student_id: number;
  student_name: string;
  assignment_id?: number;
  quiz_id?: number;
  submitted_at: string;
  grade?: number;
  status: 'submitted' | 'graded' | 'late';
  file_path?: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'assignments' | 'quizzes' | 'submissions' | 'analytics'>('assignments');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');

  useEffect(() => {
    if (user?.role === 'teacher') {
      loadDashboardData();
      setupRealTimeUpdates();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAssignments(),
        loadQuizzes(),
        loadSubmissions()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await apiService.get('/assignments');
      const assignmentsWithStats = await Promise.all(
        response.data.map(async (assignment: Assignment) => {
          try {
            const statsResponse = await apiService.get(`/assignments/${assignment.id}/stats`);
            return { ...assignment, ...statsResponse.data };
          } catch {
            return assignment;
          }
        })
      );
      setAssignments(assignmentsWithStats);
    } catch (error) {
      console.error('Error loading assignments:', error);
    }
  };

  const loadQuizzes = async () => {
    try {
      const response = await apiService.get('/quizzes');
      const quizzesWithStats = await Promise.all(
        response.data.map(async (quiz: Quiz) => {
          try {
            const statsResponse = await apiService.get(`/quizzes/${quiz.id}/stats`);
            return { ...quiz, ...statsResponse.data };
          } catch {
            return quiz;
          }
        })
      );
      setQuizzes(quizzesWithStats);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    }
  };

  const loadSubmissions = async () => {
    try {
      const response = await apiService.get('/submissions/all');
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const setupRealTimeUpdates = () => {
    // Subscribe to real-time updates
    const unsubscribeAssignment = notificationService.subscribeToAssignmentNotifications((notification) => {
      if (notification.type === 'assignment_submitted') {
        loadSubmissions(); // Refresh submissions when new ones arrive
      }
    });

    const unsubscribeQuiz = notificationService.subscribeToQuizNotifications((notification) => {
      if (notification.type === 'quiz_completed') {
        loadSubmissions(); // Refresh submissions when new ones arrive
      }
    });

    return () => {
      unsubscribeAssignment();
      unsubscribeQuiz();
    };
  };

  const handleCreateAssignment = () => {
    // Navigate to assignment creation page or open modal
    window.location.href = '/create-assignment';
  };

  const handleCreateQuiz = () => {
    // Navigate to quiz creation page or open modal
    window.location.href = '/create-quiz';
  };

  const handleEditAssignment = (assignmentId: number) => {
    // Navigate to assignment edit page or open modal
    window.location.href = `/edit-assignment/${assignmentId}`;
  };

  const handleEditQuiz = (quizId: number) => {
    // Navigate to quiz edit page or open modal
    window.location.href = `/edit-quiz/${quizId}`;
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await apiService.delete(`/assignments/${assignmentId}`);
        setAssignments(prev => prev.filter(a => a.id !== assignmentId));
        // Emit notification
        if (notificationService.isSocketConnected()) {
          // Emit assignment deleted event
        }
      } catch (error) {
        console.error('Error deleting assignment:', error);
        alert('Failed to delete assignment');
      }
    }
  };

  const handleDeleteQuiz = async (quizId: number) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await apiService.delete(`/quizzes/${quizId}`);
        setQuizzes(prev => prev.filter(q => q.id !== quizId));
        // Emit notification
        if (notificationService.isSocketConnected()) {
          // Emit quiz deleted event
        }
      } catch (error) {
        console.error('Error deleting quiz:', error);
        alert('Failed to delete quiz');
      }
    }
  };

  const handleViewSubmissions = (itemId: number, type: 'assignment' | 'quiz') => {
    // Navigate to submissions view
    window.location.href = `/submissions/${type}/${itemId}`;
  };

  const handleGradeSubmission = (submissionId: number) => {
    // Navigate to grading page or open modal
    window.location.href = `/grade-submission/${submissionId}`;
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.module_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && new Date(assignment.deadline) > new Date();
    if (filterStatus === 'completed') return matchesSearch && new Date(assignment.deadline) <= new Date();
    if (filterStatus === 'overdue') return matchesSearch && new Date(assignment.deadline) < new Date();
    
    return matchesSearch;
  });

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.module_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && new Date(quiz.deadline) > new Date();
    if (filterStatus === 'completed') return matchesSearch && new Date(quiz.deadline) <= new Date();
    if (filterStatus === 'overdue') return matchesSearch && new Date(quiz.deadline) < new Date();
    
    return matchesSearch;
  });

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && submission.status === 'submitted';
    if (filterStatus === 'completed') return matchesSearch && submission.status === 'graded';
    if (filterStatus === 'overdue') return matchesSearch && submission.status === 'late';
    
    return matchesSearch;
  });

  if (user?.role !== 'teacher') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only teachers can access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Enhanced Header */}
      <div className="admin-header-section admin-animate-in p-6">
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="admin-header-icon">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="admin-title">Admin Dashboard</h1>
              <p className="admin-subtitle">Manage assignments, quizzes, and track student performance</p>
            </div>
          </div>
          
          {/* Enhanced Status Badges */}
          <div className="admin-status-badges">
            <div className="admin-status-badge">
              <div className="status-pulse"></div>
              <span>Live Dashboard</span>
            </div>
            <div className="admin-status-badge">
              <TrendingUp className="w-4 h-4" />
              <span>Real-time Updates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card blue admin-animate-scale">
          <div className="flex items-center justify-between mb-4">
            <div className="admin-stat-icon">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="admin-stat-value">{assignments.length}</span>
          </div>
          <h3 className="admin-stat-title">Total Assignments</h3>
          <p className="admin-stat-description">Active assignments</p>
        </div>
        
        <div className="admin-stat-card green admin-animate-scale">
          <div className="flex items-center justify-between mb-4">
            <div className="admin-stat-icon">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="admin-stat-value">{quizzes.length}</span>
          </div>
          <h3 className="admin-stat-title">Total Quizzes</h3>
          <p className="admin-stat-description">Available quizzes</p>
        </div>
        
        <div className="admin-stat-card orange admin-animate-scale">
          <div className="flex items-center justify-between mb-4">
            <div className="admin-stat-icon">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <span className="admin-stat-value">{submissions.length}</span>
          </div>
          <h3 className="admin-stat-title">Submissions</h3>
          <p className="admin-stat-description">Student submissions</p>
        </div>
        
        <div className="admin-stat-card purple admin-animate-scale">
          <div className="flex items-center justify-between mb-4">
            <div className="admin-stat-icon">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="admin-stat-value">
              {submissions.length > 0 
                ? (submissions.reduce((sum, s) => sum + (s.grade || 0), 0) / submissions.length).toFixed(1)
                : '0'
              }%
            </span>
          </div>
          <h3 className="admin-stat-title">Avg. Score</h3>
          <p className="admin-stat-description">Overall performance</p>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="admin-tabs-container">
        <nav className="admin-tabs-nav">
            {[
              { id: 'assignments', label: 'Assignments', icon: FileText, color: 'blue' },
              { id: 'quizzes', label: 'Quizzes', icon: BookOpen, color: 'green' },
              { id: 'submissions', label: 'Submissions', icon: Upload, color: 'orange' },
              { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'purple' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`admin-tab-button ${isActive ? 'active' : ''}`}
                >
                  <Icon className="admin-tab-icon" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
        </nav>
      </div>

      {/* Enhanced Search and Filter */}
      <div className="admin-controls-section">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <input
              type="text"
              placeholder="Search assignments, quizzes, and submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="admin-filter-select"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="admin-content-container">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59,130,246,0.15) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        {/* Content with Glass Effect */}
        <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
              </div>
            </div>
          ) : (
            <>
          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Assignments</h2>
                  <p className="text-gray-600">Manage and track assignment performance</p>
                </div>
                <button
                  onClick={handleCreateAssignment}
                  className="group relative flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-2 active:translate-y-0 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                  <div className="relative flex items-center space-x-3">
                    <div className="w-6 h-6 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors duration-200 group-hover:scale-110">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-semibold group-hover:tracking-wide transition-all duration-200">Create Assignment</span>
                  </div>
                </button>
              </div>
              
              <div className="grid gap-6">
                {filteredAssignments.map((assignment) => (
                  <div key={assignment.id} className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{assignment.title}</h3>
                            <p className="text-sm text-gray-500 font-medium">{assignment.module_name}</p>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4 leading-relaxed">{assignment.description}</p>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-700 font-medium">Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                            <Users className="w-4 h-4 text-green-600" />
                            <span className="text-green-700 font-medium">{assignment.submission_count || 0} submissions</span>
                          </div>
                          {assignment.average_score && (
                            <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                              <BarChart3 className="w-4 h-4 text-purple-600" />
                              <span className="text-purple-700 font-medium">Avg: {assignment.average_score.toFixed(1)}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleViewSubmissions(assignment.id, 'assignment')}
                          className="admin-action-button secondary"
                          title="View Submissions"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditAssignment(assignment.id)}
                          className="admin-action-button primary"
                          title="Edit Assignment"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          className="admin-action-button danger"
                          title="Delete Assignment"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === 'quizzes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">Quizzes</h2>
                  <p className="text-gray-600">Manage and track quiz performance</p>
                </div>
                <button
                  onClick={handleCreateQuiz}
                  className="group relative flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-2 active:translate-y-0 active:scale-95 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                  <div className="relative flex items-center space-x-3">
                    <div className="w-6 h-6 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors duration-200 group-hover:scale-110">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-semibold group-hover:tracking-wide transition-all duration-200">Create Quiz</span>
                  </div>
                </button>
              </div>
              
              <div className="grid gap-6">
                {filteredQuizzes.map((quiz) => (
                  <div key={quiz.id} className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{quiz.title}</h3>
                            <p className="text-sm text-gray-500 font-medium">{quiz.module_name}</p>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4 leading-relaxed">{quiz.description}</p>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="text-green-700 font-medium">Due: {new Date(quiz.deadline).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-blue-700 font-medium">{quiz.attempt_count || 0} attempts</span>
                          </div>
                          {quiz.average_score && (
                            <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                              <BarChart3 className="w-4 h-4 text-purple-600" />
                              <span className="text-purple-700 font-medium">Avg: {quiz.average_score.toFixed(1)}%</span>
                            </div>
                          )}
                          {quiz.pass_rate && (
                            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              <span className="text-emerald-700 font-medium">Pass: {quiz.pass_rate.toFixed(1)}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleViewSubmissions(quiz.id, 'quiz')}
                          className="admin-action-button secondary"
                          title="View Submissions"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditQuiz(quiz.id)}
                          className="admin-action-button primary"
                          title="Edit Quiz"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="admin-action-button danger"
                          title="Delete Quiz"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Student Submissions</h2>
              
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredSubmissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {submission.student_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {submission.assignment_id ? 'Assignment' : 'Quiz'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(submission.submitted_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              submission.status === 'graded' 
                                ? 'bg-green-100 text-green-800'
                                : submission.status === 'submitted'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {submission.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {submission.grade ? `${submission.grade}%` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleGradeSubmission(submission.id)}
                                className="admin-action-button warning"
                              >
                                Grade
                              </button>
                              <button className="admin-action-button secondary">
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Performance Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Score</span>
                      <span className="font-semibold">
                        {assignments.length > 0 
                          ? (assignments.reduce((sum, a) => sum + (a.average_score || 0), 0) / assignments.length).toFixed(1)
                          : '0'
                        }%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Submissions</span>
                      <span className="font-semibold">
                        {assignments.reduce((sum, a) => sum + (a.submission_count || 0), 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pass Rate</span>
                      <span className="font-semibold">
                        {assignments.length > 0 
                          ? (assignments.reduce((sum, a) => sum + (a.pass_rate || 0), 0) / assignments.length).toFixed(1)
                          : '0'
                        }%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Score</span>
                      <span className="font-semibold">
                        {quizzes.length > 0 
                          ? (quizzes.reduce((sum, q) => sum + (q.average_score || 0), 0) / quizzes.length).toFixed(1)
                          : '0'
                        }%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Attempts</span>
                      <span className="font-semibold">
                        {quizzes.reduce((sum, q) => sum + (q.attempt_count || 0), 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pass Rate</span>
                      <span className="font-semibold">
                        {quizzes.length > 0 
                          ? (quizzes.reduce((sum, q) => sum + (q.pass_rate || 0), 0) / quizzes.length).toFixed(1)
                          : '0'
                        }%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
