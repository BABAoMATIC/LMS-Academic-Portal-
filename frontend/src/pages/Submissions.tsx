import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiService from '../services/api';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Eye,
  Plus,
  Filter,
  Search,
  BookOpen,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react';
import { theme } from '../utils/theme';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import '../components/TeacherDashboard.css';

interface Submission {
  id: number;
  assignment_title?: string;
  file_name?: string;
  submitted_at?: string;
  grade?: number;
  feedback?: string;
  status?: string;
}

interface Assignment {
  id: number;
  title: string;
  description?: string;
  deadline: string;
  max_marks?: number;
  subject_id?: number;
  teacher_id?: number;
  created_at?: string;
}

interface Subject {
  id: number;
  title: string;
}

const Submissions: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'submissions' | 'create-assignment'>('submissions');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Assignment creation form state
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    subject_id: '',
    deadline: '',
    max_marks: 100
  });
  const [creatingAssignment, setCreatingAssignment] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchData();
      fetchSubjects();
    }
  }, [user]);

  // Mock data for demo
  useEffect(() => {
    const mockSubmissions: Submission[] = [
      {
        id: 1,
        assignment_title: "Mathematics Assignment 1",
        file_name: "math_assignment_1.pdf",
        submitted_at: "2024-01-15T10:30:00Z",
        grade: 85,
        status: "graded"
      },
      {
        id: 2,
        assignment_title: "Physics Lab Report",
        file_name: "physics_lab_report.docx",
        submitted_at: "2024-01-20T14:15:00Z",
        grade: 92,
        status: "graded"
      },
      {
        id: 3,
        assignment_title: "English Essay",
        file_name: "english_essay.pdf",
        submitted_at: "2024-01-25T09:45:00Z",
        status: "pending"
      },
      {
        id: 4,
        assignment_title: "Computer Science Project",
        file_name: "cs_project.zip",
        submitted_at: "2024-01-28T16:20:00Z",
        status: "pending"
      }
    ];

    const mockAssignments: Assignment[] = [
      {
        id: 1,
        title: "Mathematics Assignment 2",
        description: "Calculus problems and solutions",
        deadline: "2024-02-15T23:59:00Z",
        max_marks: 100
      },
      {
        id: 2,
        title: "Physics Quiz",
        description: "Mechanics and thermodynamics",
        deadline: "2024-02-20T23:59:00Z",
        max_marks: 50
      },
      {
        id: 3,
        title: "Literature Analysis",
        description: "Critical analysis of selected texts",
        deadline: "2024-02-25T23:59:00Z",
        max_marks: 75
      }
    ];

    setSubmissions(mockSubmissions);
    setAssignments(mockAssignments);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (user?.role === 'student') {
        const [submissionsData, assignmentsData] = await Promise.all([
          apiService.getStudentSubmissions(user.id),
          apiService.getActiveAssignments()
        ]);
        
        setSubmissions(submissionsData?.submissions || []);
        setAssignments(assignmentsData || []);
      } else if (user?.role === 'teacher') {
        const [submissionsData, assignmentsData] = await Promise.all([
          apiService.getSubmissions(),
          apiService.getAssignments()
        ]);
        
        setSubmissions(submissionsData.data?.submissions || []);
        setAssignments(assignmentsData || []);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
      setSubmissions([]);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      if (user?.role === 'teacher' && user?.id) {
        const response = await apiService.getTeacherSubjects(user.id);
        setSubjects(response.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assignmentForm.title.trim() || !assignmentForm.subject_id || !assignmentForm.deadline) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setCreatingAssignment(true);
      
      const assignmentData = {
        teacher_id: user?.id || 1,
        ...assignmentForm,
        subject_id: parseInt(assignmentForm.subject_id)
      };

      await axios.post('/api/teacher/assignment/create', assignmentData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Reset form
      setAssignmentForm({
        title: '',
        description: '',
        subject_id: '',
        deadline: '',
        max_marks: 100
      });

      // Refresh assignments list
      await fetchData();
      
      // Switch to submissions tab to show the new assignment
      setActiveTab('submissions');
      
      alert('Assignment created successfully!');
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment. Please try again.');
    } finally {
      setCreatingAssignment(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedAssignment || !uploadFile) return;

    try {
      setUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('assignment_id', selectedAssignment.toString());
      formData.append('file', uploadFile);
      
      await apiService.submitAssignment(formData);
      
      // Refresh data
      await fetchData();
      
      // Reset form
      setShowUploadModal(false);
      setSelectedAssignment(null);
      setUploadFile(null);
      
    } catch (err: any) {
      setError(err.message || 'Failed to upload submission');
    } finally {
      setUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'graded') {
      return <CheckCircle size={20} color={theme.colors.success} />;
    }
    return <Clock size={20} color={theme.colors.warning} />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'graded') {
      return theme.colors.success;
    }
    return theme.colors.warning;
  };

  const getStatusText = (status: string) => {
    if (status === 'graded') {
      return 'Graded';
    }
    return 'Pending';
  };

  const filteredSubmissions = (submissions || []).filter(submission => {
    const matchesSearch = (submission.assignment_title && submission.assignment_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (submission.file_name && submission.file_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: theme.spacing.xl, 
        textAlign: 'center',
        color: theme.colors.error 
      }}>
        <AlertCircle size={48} />
        <p>{error}</p>
        <button 
          onClick={fetchData}
          style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: theme.borderRadius.md,
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="quiz-page-header">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user?.role === 'teacher' ? 'Submissions & Assignments' : 'Submissions'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {user?.role === 'teacher' 
              ? 'Manage submissions and create new assignments' 
              : 'Manage and track your assignment submissions'}
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {user?.role === 'teacher' 
            ? `${assignments.length} assignments, ${submissions.length} submissions`
            : `${submissions.length} submissions`}
        </div>
      </div>

      {/* Tab Navigation - Only show for teachers */}
      {user?.role === 'teacher' && (
        <div className="quiz-tab-navigation">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`quiz-tab-button ${activeTab === 'submissions' ? 'active' : ''}`}
          >
            📊 View Submissions
          </button>
          <button
            onClick={() => setActiveTab('create-assignment')}
            className={`quiz-tab-button ${activeTab === 'create-assignment' ? 'active' : ''}`}
          >
            📝 Create Assignment
          </button>
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="quiz-list-container">
          {/* Student Upload Button */}
          {user?.role === 'student' && (
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setShowUploadModal(true)}
                className="quiz-action-button primary"
              >
                <Plus size={20} />
                Upload New Submission
              </button>
            </div>
          )}

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Submissions</option>
                <option value="pending">Pending</option>
                <option value="graded">Graded</option>
              </select>
            </div>
          </div>

          {/* Submission Count */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-purple-600 dark:text-purple-400">{filteredSubmissions.length}</span> of <span className="font-semibold text-purple-600 dark:text-purple-400">{(submissions || []).length}</span> submissions
            </p>
          </div>

          {/* Submissions List */}
          {filteredSubmissions.length > 0 ? (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <div key={submission.id} className="quiz-item-card">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="quiz-item-title">
                          {submission.assignment_title}
                        </h3>
                        <span className="quiz-item-badge">
                          {submission.grade !== undefined ? `${submission.grade}/100` : 'Pending'}
                        </span>
                      </div>
                      
                      <div className="quiz-item-stats">
                        <div className="quiz-stat-item">
                          <FileText className="quiz-stat-icon" />
                          <span className="quiz-stat-text">{submission.file_name}</span>
                        </div>
                        <div className="quiz-stat-item">
                          <Calendar className="quiz-stat-icon" />
                          <span className="quiz-stat-text">
                            {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                        <div className="quiz-stat-item">
                          {submission.status && getStatusIcon(submission.status)}
                          <span className="quiz-stat-text">
                            {submission.status ? getStatusText(submission.status) : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="quiz-item-actions">
                      <button
                        onClick={() => window.open(submission.file_name, '_blank')}
                        className="quiz-action-button primary"
                        title="View"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button
                        onClick={() => window.open(submission.file_name, '_blank')}
                        className="quiz-action-button secondary"
                        title="Download"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="quiz-empty-state">
              <div className="quiz-empty-icon">
                <FileText size={32} />
              </div>
              <h3 className="quiz-empty-title">
                {searchTerm || statusFilter !== 'all' ? 'No Submissions Found' : 'No Submissions Yet'}
              </h3>
              <p className="quiz-empty-description">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Upload your first assignment submission to get started.'}
              </p>
              {user?.role === 'student' && !searchTerm && statusFilter === 'all' && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="quiz-empty-button"
                >
                  <Plus size={20} />
                  Upload First Submission
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Assignment Tab - Only for teachers */}
      {user?.role === 'teacher' && activeTab === 'create-assignment' && (
        <div className="quiz-form-container">
          <form onSubmit={handleCreateAssignment} className="quiz-form">
            {/* Basic Assignment Information Section */}
            <div className="quiz-form-section">
              <h4 className="quiz-form-section-title">Basic Assignment Information</h4>
              
              <div className="quiz-form-group">
                <label className="quiz-form-label required">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="quiz-form-input"
                  placeholder="Enter assignment title"
                />
              </div>

              <div className="quiz-form-group">
                <label className="quiz-form-label">
                  Description
                </label>
                <textarea
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  className="quiz-form-textarea"
                  placeholder="Enter assignment description"
                />
              </div>

              <div className="quiz-form-group">
                <label className="quiz-form-label required">
                  Subject
                </label>
                <select
                  required
                  value={assignmentForm.subject_id}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, subject_id: e.target.value })}
                  className="quiz-form-select"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignment Settings Section */}
            <div className="quiz-form-section">
              <h4 className="quiz-form-section-title">Assignment Settings</h4>
              
              <div className="quiz-form-grid">
                <div className="quiz-form-group">
                  <label className="quiz-form-label required">
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={assignmentForm.deadline}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, deadline: e.target.value })}
                    className="quiz-form-input"
                  />
                </div>

                <div className="quiz-form-group">
                  <label className="quiz-form-label">
                    Max Marks
                  </label>
                  <input
                    type="number"
                    value={assignmentForm.max_marks}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, max_marks: parseInt(e.target.value) })}
                    min="1"
                    max="100"
                    className="quiz-form-input"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="quiz-form-actions">
              <button
                type="button"
                onClick={() => setActiveTab('submissions')}
                className="quiz-btn-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingAssignment}
                className="quiz-btn-create"
              >
                {creatingAssignment ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="quiz-modal-overlay">
          <div className="quiz-modal-content max-w-2xl">
            <div className="quiz-modal-header">
              <div className="flex items-center justify-between">
                <h3 className="quiz-modal-title">Upload Submission</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="quiz-modal-close"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="quiz-form">
                <div className="quiz-form-section">
                  <div className="quiz-form-group">
                    <label className="quiz-form-label required">
                      Select Assignment
                    </label>
                    <select
                      value={selectedAssignment || ''}
                      onChange={(e) => setSelectedAssignment(Number(e.target.value) || null)}
                      className="quiz-form-select"
                    >
                      <option value="">Choose Assignment</option>
                      {assignments.map(assignment => (
                        <option key={assignment.id} value={assignment.id}>
                          {assignment.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="quiz-form-group">
                    <label className="quiz-form-label required">
                      Select File
                    </label>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                      className="quiz-form-input"
                    />
                  </div>
                </div>

                <div className="quiz-form-actions">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="quiz-btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedAssignment || !uploadFile || uploading}
                    className="quiz-btn-create"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Submissions;
