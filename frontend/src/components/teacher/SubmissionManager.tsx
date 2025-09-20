import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { Submission, Assignment, User } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import '../TeacherDashboard.css';
import './EnhancedSubmissionManager.css';

interface SubmissionManagerProps {}

interface SubmissionWithDetails extends Submission {
  assignment: Assignment;
  student: User;
}

const SubmissionManager: React.FC<SubmissionManagerProps> = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    comments: '',
    marks: 0,
    status: 'approved'
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchSubmissions();
    }
  }, [user]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // Try teacher-specific endpoint first, fallback to general submissions endpoint
      let response;
      try {
        response = await axios.get(`/api/teacher/${user?.id}/submissions`);
      } catch (teacherError) {
        response = await axios.get('/api/submissions');
      }
      
      // Fetch additional details for each submission
      const submissionsWithDetails = await Promise.all(
        (response.data.submissions || []).map(async (submission: Submission) => {
          try {
            const [assignmentRes, studentRes] = await Promise.all([
              axios.get(`/api/assignments/${submission.assignment_id}`),
              axios.get(`/api/users/${submission.student_id}`)
            ]);

            return {
              ...submission,
              assignment: assignmentRes.data.assignment || { id: submission.assignment_id, title: `Assignment ${submission.assignment_id}` },
              student: studentRes.data.user || { id: submission.student_id, name: `Student ${submission.student_id}`, email: 'unknown@example.com' }
            };
          } catch (error) {
            return {
              ...submission,
              assignment: { id: submission.assignment_id, title: `Assignment ${submission.assignment_id}` } as Assignment,
              student: { id: submission.student_id, name: `Student ${submission.student_id}`, email: 'unknown@example.com' } as User
            };
          }
        })
      );
      
      setSubmissions(submissionsWithDetails);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvideFeedback = (submission: SubmissionWithDetails) => {
    setSelectedSubmission(submission);
    setFeedbackData({
      comments: submission.feedback || '',
      marks: submission.grade || 0,
      status: submission.status || 'pending'
    });
    setShowFeedbackModal(true);
  };

  const submitFeedback = async () => {
    if (!selectedSubmission) return;

    try {
      await axios.post(`/api/submissions/${selectedSubmission.id}/feedback`, {
        comments: feedbackData.comments,
        marks: feedbackData.marks,
        status: feedbackData.status
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Update submission status
      await axios.post(`/api/submissions/${selectedSubmission.id}/status`, {
        status: feedbackData.status
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setShowFeedbackModal(false);
      fetchSubmissions();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      submission.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.assignment?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="submission-manager-container">
      <div className="submission-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Submission Management</h2>
            <p className="text-blue-100 mt-1">Review and provide feedback on student submissions</p>
          </div>
          <div className="text-sm text-blue-100">
            {filteredSubmissions.length} of {submissions.length} submissions
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="submission-filters">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Submissions</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search Submissions
          </label>
          <input
            type="text"
            placeholder="Search by student name or assignment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📤</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No submissions found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery || filterStatus !== 'all' ? 'Try adjusting your filters' : 'No submissions have been made yet'}
            </p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => (
            <div key={submission.id} className="submission-card">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="submission-title">
                      {submission.assignment?.title || 'Assignment'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status || 'pending')}`}>
                      {submission.status || 'pending'}
                    </span>
                    {submission.grade && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full">
                        {submission.grade}%
                      </span>
                    )}
                  </div>

                  <div className="submission-student-info">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-1 font-medium">👤 Student</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {submission.student?.name || `ID: ${submission.student_id}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400 mb-1 font-medium">📅 Submitted</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {new Date(submission.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {submission.feedback && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Feedback</p>
                      <p className="text-gray-900 dark:text-white">{submission.feedback}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>📁 {submission.file_name || 'File'}</span>
                    <span>📅 Version {submission.version}</span>
                  </div>
                </div>

                <div className="submission-actions">
                  <a
                    href={submission.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="submission-btn-view"
                  >
                    📁 View File
                  </a>
                  <button
                    onClick={() => handleProvideFeedback(submission)}
                    className={submission.status === 'pending' ? 'submission-btn-review' : 'submission-btn-update'}
                  >
                    {submission.status === 'pending' ? '📝 Review' : '✏️ Update Feedback'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedSubmission && (
        <div className="fixed inset-0 feedback-modal-overlay flex items-center justify-center p-4 z-50">
          <div className="feedback-modal-content max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="feedback-modal-header">
                <div className="flex items-center justify-between">
                  <h3 className="feedback-modal-title">Provide Feedback</h3>
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="feedback-modal-close"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="feedback-form">
                <div className="feedback-form-group">
                  <label className="feedback-form-label">
                    📝 Assignment
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {selectedSubmission.assignment?.title || 'Assignment'}
                  </p>
                </div>

                <div className="feedback-form-group">
                  <label className="feedback-form-label">
                    👤 Student
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    {selectedSubmission.student?.name || `ID: ${selectedSubmission.student_id}`}
                  </p>
                </div>

                <div className="feedback-form-group">
                  <label className="feedback-form-label required">
                    📊 Status
                  </label>
                  <select
                    value={feedbackData.status}
                    onChange={(e) => setFeedbackData({ ...feedbackData, status: e.target.value })}
                    className="feedback-form-select"
                  >
                    <option value="approved">✅ Approved</option>
                    <option value="rejected">❌ Rejected</option>
                    <option value="pending">⏳ Pending</option>
                  </select>
                </div>

                <div className="feedback-form-group">
                  <label className="feedback-form-label">
                    🎯 Marks (out of 100)
                  </label>
                  <input
                    type="number"
                    value={feedbackData.marks}
                    onChange={(e) => setFeedbackData({ ...feedbackData, marks: parseInt(e.target.value) })}
                    min="0"
                    max="100"
                    className="feedback-form-input"
                    placeholder="Enter marks (0-100)"
                  />
                </div>

                <div className="feedback-form-group">
                  <label className="feedback-form-label">
                    💬 Feedback Comments
                  </label>
                  <textarea
                    value={feedbackData.comments}
                    onChange={(e) => setFeedbackData({ ...feedbackData, comments: e.target.value })}
                    className="feedback-form-textarea"
                    placeholder="Provide detailed feedback for the student..."
                  />
                </div>

                <div className="feedback-form-actions">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackModal(false)}
                    className="feedback-btn-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitFeedback}
                    className="feedback-btn-submit"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionManager;
