import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Clock, CheckCircle, AlertCircle, Upload, MessageSquare, Eye, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AssignmentPreviewModal from './AssignmentPreviewModal';
import { Assignment } from '../types';

const AssignmentsList: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionComments, setSubmissionComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>('');
  const [previewAssignment, setPreviewAssignment] = useState<Assignment | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`/api/assignments?user_id=${user?.id}`);
      const data = await response.json();
      if (data.assignments) {
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setFileError('');
    
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf'];
      const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        setFileError('Invalid file type. Only PDF, DOC, DOCX, TXT, and RTF files are allowed.');
        setSelectedFile(null);
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setFileError('File size too large. Maximum size is 10MB.');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleSubmitAssignment = async (assignmentId: number) => {
    if (!user?.id) return;
    
    if (!selectedFile) {
      setFileError('Please select a file to upload.');
      return;
    }

    setSubmitting(true);
    setFileError('');
    
    try {
      const formData = new FormData();
      formData.append('assignment_id', assignmentId.toString());
      formData.append('comments', submissionComments);
      formData.append('file', selectedFile);

      const response = await fetch('/api/submissions/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Assignment submitted successfully:', result);
        
        // Refresh assignments list
        await fetchAssignments();
        setSelectedAssignment(null);
        setSubmissionComments('');
        setSelectedFile(null);
        
        // Show success message
        alert('Assignment submitted successfully! Teacher has been notified.');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Error submitting assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreview = (assignment: Assignment) => {
    setPreviewAssignment(assignment);
    setShowPreview(true);
  };

  const handleDownload = async (assignment: Assignment) => {
    try {
      const response = await fetch(`/api/assignments/${assignment.id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        // Get the filename from the response headers or use assignment title
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = assignment.title;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('✅ Assignment downloaded successfully');
      } else {
        const error = await response.json();
        alert(`Error downloading file: ${error.error}`);
      }
    } catch (error) {
      console.error('Error downloading assignment:', error);
      alert('Error downloading assignment');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'graded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
        <button
          onClick={fetchAssignments}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Refresh
        </button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No assignments available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status || 'pending')}`}>
                      {assignment.status || 'pending'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2">{assignment.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Due: {formatDate(assignment.deadline)}</span>
                      {isDeadlinePassed(assignment.deadline) && (
                        <span className="ml-2 text-red-500">(Overdue)</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{assignment.total_marks} marks</span>
                    </div>
                    <div className="flex items-center">
                      <span>By: {assignment.teacher_name}</span>
                    </div>
                  </div>

                  {(assignment.status || 'pending') === 'submitted' && assignment.submission_time && (
                    <div className="mt-2 text-sm text-blue-600">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Submitted on {formatDate(assignment.submission_time)}
                      {assignment.version && ` (Version ${assignment.version})`}
                    </div>
                  )}

                  {(assignment.status || 'pending') === 'graded' && assignment.feedback && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center text-sm text-green-800 mb-1">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        <span className="font-medium">Feedback</span>
                        {assignment.feedback_marks && (
                          <span className="ml-2">({assignment.feedback_marks}/{assignment.total_marks} marks)</span>
                        )}
                      </div>
                      <p className="text-sm text-green-700">{assignment.feedback}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {getStatusIcon(assignment.status || 'pending')}
                  
                  {/* Preview Button - Show if assignment has a file */}
                  {assignment.file_path && (
                    <button
                      onClick={() => handlePreview(assignment)}
                      className="flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </button>
                  )}
                  
                  {/* Download Button - Show if assignment has a file */}
                  {assignment.file_path && (
                    <button
                      onClick={() => handleDownload(assignment)}
                      className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </button>
                  )}
                  
                  {(assignment.status || 'pending') === 'pending' && !isDeadlinePassed(assignment.deadline) && (
                    <button
                      onClick={() => setSelectedAssignment(assignment)}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Submit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Submit Assignment</h3>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">{selectedAssignment.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{selectedAssignment.description}</p>
              <div className="text-sm text-gray-500">
                <p>Due: {formatDate(selectedAssignment.deadline)}</p>
                <p>Marks: {selectedAssignment.total_marks}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload File *
              </label>
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt,.rtf"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fileError && (
                <p className="text-red-500 text-sm mt-1">{fileError}</p>
              )}
              {selectedFile && (
                <p className="text-green-600 text-sm mt-1">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comments (Optional)
              </label>
              <textarea
                value={submissionComments}
                onChange={(e) => setSubmissionComments(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any comments about your submission..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmitAssignment(selectedAssignment.id)}
                disabled={submitting || !selectedFile}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Preview Modal */}
      <AssignmentPreviewModal
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setPreviewAssignment(null);
        }}
        assignment={previewAssignment}
      />
    </div>
  );
};

export default AssignmentsList;
