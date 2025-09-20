import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Assignment, Submission } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import '../TeacherDashboard.css';
import './EnhancedAssignmentManager.css';

interface AssignmentManagerProps {}

interface AssignmentWithSubmissions extends Assignment {
  submissions: Submission[];
  submittedCount: number;
  pendingCount: number;
}

const AssignmentManager: React.FC<AssignmentManagerProps> = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentWithSubmissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithSubmissions | null>(null);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [subjects, setSubjects] = useState<Array<{ id: number; title: string }>>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject_id: '',
    deadline: '',
    max_marks: 100,
    file: null as File | null
  });

  useEffect(() => {
    if (user) {
      fetchAssignments();
      fetchSubjects();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      // Try teacher-specific endpoint first, fallback to general assignments endpoint
      let response;
      try {
        response = await axios.get(`/api/teacher/${user?.id}/assignments`);
      } catch (teacherError) {
        response = await axios.get('/api/assignments');
      }
      
      // Fetch submissions for each assignment
      const assignmentsWithSubmissions = await Promise.all(
        (response.data.assignments || []).map(async (assignment: Assignment) => {
          try {
            const submissionsRes = await axios.get(`/api/teacher/assignments/${assignment.id}/submissions`);
            const submissions = submissionsRes.data.submissions || [];
            return {
              ...assignment,
              submissions,
              submittedCount: submissions.length,
              pendingCount: submissions.filter((s: Submission) => s.status === 'submitted').length
            };
          } catch (error) {
            // Get general submissions for this assignment
            try {
              const generalSubmissions = await axios.get('/api/submissions');
              const assignmentSubmissions = generalSubmissions.data.submissions?.filter((s: any) => s.assignment_id === assignment.id) || [];
              return {
                ...assignment,
                submissions: assignmentSubmissions,
                submittedCount: assignmentSubmissions.length,
                pendingCount: assignmentSubmissions.filter((s: Submission) => s.status === 'submitted').length
              };
            } catch (subError) {
              return {
                ...assignment,
                submissions: [],
                submittedCount: 0,
                pendingCount: 0
              };
            }
          }
        })
      );
      
      setAssignments(assignmentsWithSubmissions);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      // Try to fetch modules as subjects
      const response = await axios.get('/api/analytics/modules');
      if (response.data && response.data.modules) {
        setSubjects(response.data.modules.map((module: any) => ({
          id: module.id,
          title: module.title
        })));
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Set fallback subjects
      setSubjects([
        { id: 1, title: 'Mathematics' },
        { id: 2, title: 'Science' },
        { id: 3, title: 'English' },
        { id: 4, title: 'History' },
        { id: 5, title: 'Computer Science' }
      ]);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const assignmentData = {
        title: formData.title,
        description: formData.description,
        subject_id: formData.subject_id,
        deadline: formData.deadline,
        max_marks: formData.max_marks,
        teacher_id: user?.id || 1
      };

      await axios.post('/api/teacher/assignments/create', assignmentData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        subject_id: '',
        deadline: '',
        max_marks: 100,
        file: null
      });
      fetchAssignments();
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleViewSubmissions = (assignment: AssignmentWithSubmissions) => {
    setSelectedAssignment(assignment);
    setShowSubmissions(true);
  };

  const handleEditAssignment = (assignment: AssignmentWithSubmissions) => {
    setFormData({
      title: assignment.title,
      description: assignment.description || '',
      subject_id: assignment.teacher_id.toString(),
      deadline: assignment.deadline,
      max_marks: assignment.max_marks || 100,
      file: null
    });
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreateAssignment(e);
  };

  const [editingAssignment, setEditingAssignment] = useState<AssignmentWithSubmissions | null>(null);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Assignment Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          + Create Assignment
        </button>
      </div>

      {/* Create Assignment Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 assignment-modal-overlay flex items-center justify-center p-2 z-50">
          <div className="assignment-modal-content max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="assignment-modal-header">
                <div className="flex items-center justify-between">
                  <h3 className="assignment-modal-title">Create New Assignment</h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="assignment-modal-close"
                  >
                    ×
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateAssignment} className="assignment-form">
                {/* Basic Information Section */}
                <div className="assignment-form-section">
                  <h4 className="assignment-form-section-title">Basic Information</h4>
                  
                  <div className="assignment-form-group">
                    <label className="assignment-form-label required">
                      Assignment Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="assignment-form-input"
                      placeholder="Enter assignment title"
                    />
                  </div>

                  <div className="assignment-form-group">
                    <label className="assignment-form-label">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="assignment-form-textarea"
                      placeholder="Enter assignment description"
                    />
                  </div>
                </div>

                {/* Assignment Details Section */}
                <div className="assignment-form-section">
                  <h4 className="assignment-form-section-title">Assignment Details</h4>
                  
                  <div className="assignment-form-grid">
                    <div className="assignment-form-group">
                      <label className="assignment-form-label required">
                        Subject
                      </label>
                      <select
                        required
                        value={formData.subject_id}
                        onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                        className="assignment-form-select"
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="assignment-form-group">
                      <label className="assignment-form-label">
                        Max Marks
                      </label>
                      <input
                        type="number"
                        value={formData.max_marks}
                        onChange={(e) => setFormData({ ...formData, max_marks: parseInt(e.target.value) })}
                        min="1"
                        max="100"
                        className="assignment-form-input"
                      />
                    </div>
                  </div>

                  <div className="assignment-form-group">
                    <label className="assignment-form-label required">
                      Deadline
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="assignment-form-input"
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="assignment-form-section">
                  <h4 className="assignment-form-section-title">Assignment File (Optional)</h4>
                  
                  <div className="assignment-form-group">
                    <div className="assignment-file-upload">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.zip,.rar"
                        className="hidden"
                        id="assignment-file"
                      />
                      <label htmlFor="assignment-file" className="cursor-pointer">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 assignment-file-icon" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <p className="assignment-file-text">Click to upload or drag and drop</p>
                          <p className="assignment-file-subtext">PDF, DOC, DOCX, ZIP, RAR</p>
                        </div>
                      </label>
                    </div>
                    <p className="assignment-file-subtext mt-2">
                      Supported formats: PDF, DOC, DOCX, ZIP, RAR
                    </p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="assignment-form-actions">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="assignment-btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="assignment-btn-create"
                  >
                    Create Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assignments created yet</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Create your first assignment to get started
            </p>
          </div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment.id} className="professional-card">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {assignment.title}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                      {assignment.max_marks} marks
                    </span>
                  </div>
                  
                  {assignment.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {assignment.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>📅 Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                    <span>📤 {assignment.submittedCount} submitted</span>
                    <span>⏳ {assignment.pendingCount} pending</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleViewSubmissions(assignment)}
                    className="btn-success text-sm"
                  >
                    View Submissions ({assignment.submittedCount})
                  </button>
                  <button className="btn-primary text-sm">
                    Edit
                  </button>
                  <button className="btn-danger text-sm">
                    Delete
                  </button>
                </div>
              </div>

              {/* Submission Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Submission Progress</span>
                  <span>{assignment.submittedCount} students</span>
                </div>
                <div className="progress-bar w-full">
                  <div
                    className="progress-fill"
                    style={{ width: `${(assignment.submittedCount / Math.max(1, assignment.submittedCount + assignment.pendingCount)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submissions Modal */}
      {showSubmissions && selectedAssignment && (
        <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
          <div className="modal-content max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Submissions for: {selectedAssignment.title}
                </h3>
                <button
                  onClick={() => setShowSubmissions(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {selectedAssignment.submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No submissions yet</p>
                  </div>
                ) : (
                  selectedAssignment.submissions.map((submission) => (
                    <div key={submission.id} className="professional-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            Student ID: {submission.student_id}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Submitted: {new Date(submission.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`status-badge ${
                            submission.status === 'completed' 
                              ? 'completed'
                              : 'pending'
                          }`}>
                            {submission.status}
                          </span>
                          <a
                            href={submission.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary text-sm"
                          >
                            View
                          </a>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManager;
