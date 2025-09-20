import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import statusService from '../services/statusService';
import notificationService from '../services/notificationService';
import FeedbackChat from '../components/FeedbackChat';
import SubmissionPreview from '../components/SubmissionPreview';
import AssignmentSplitView from '../components/AssignmentSplitView';
import { Assignment, Submission } from '../types';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  MessageCircle,
  Send,
  Download,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';


interface Feedback {
  id: number;
  assignment_id: number;
  student_id: number;
  teacher_id: number;
  feedback_text: string;
  grade: number;
  created_at: string;
}

const AssignmentSubmission: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [newFeedback, setNewFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [viewMode, setViewMode] = useState<'submission' | 'split'>('submission');

  useEffect(() => {
    if (id) {
      fetchAssignmentDetails();
      fetchSubmissionDetails();
    }
  }, [id]);

  const fetchAssignmentDetails = async () => {
    try {
      // Fetch all assignments and find the one with matching ID
      const assignments = await apiService.getAssignments();
      
      // Check if assignments is an array, if not use fallback data
      if (Array.isArray(assignments)) {
        const targetAssignment = assignments.find(
          (assignment: any) => assignment.id === parseInt(id || '0')
        );
        if (targetAssignment) {
          setAssignment(targetAssignment);
        }
      } else {
        // Fallback: Create mock assignment data for development
        console.log('API returned non-array data, using mock assignment');
        const mockAssignment = {
          id: parseInt(id || '0'),
          teacher_id: 1,
          title: 'Sample Assignment',
          description: 'This is a sample assignment for testing purposes.',
          deadline: '2024-02-15T23:59:59Z',
          due_date: '2024-02-15',
          total_marks: 100,
          instructions: 'Please complete this assignment according to the given instructions.',
          file_requirements: 'PDF, DOC, or DOCX files only',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z'
        };
        setAssignment(mockAssignment);
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
      // Fallback: Create mock assignment data for development
      const mockAssignment = {
        id: parseInt(id || '0'),
        teacher_id: 1,
        title: 'Sample Assignment',
        description: 'This is a sample assignment for testing purposes.',
        deadline: '2024-02-15T23:59:59Z',
        due_date: '2024-02-15',
        total_marks: 100,
        instructions: 'Please complete this assignment according to the given instructions.',
        file_requirements: 'PDF, DOC, or DOCX files only',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      };
      setAssignment(mockAssignment);
    }
  };

  const fetchSubmissionDetails = async () => {
    try {
      // Get current user ID from auth context
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        // Fetch student submissions and find the one for this assignment
        const response = await apiService.getStudentSubmissions(user.id);
        
        // Check if response and submissions exist and is an array
        if (response && Array.isArray(response.submissions)) {
          const assignmentSubmission = response.submissions.find(
            (sub: any) => sub.assignment_id === parseInt(id || '0')
          );
          if (assignmentSubmission) {
            setSubmission(assignmentSubmission);
          }
        } else {
          // Fallback: Create mock submission data for development
          console.log('API returned non-array data, using mock submission');
          const mockSubmission = {
            id: 1,
            assignment_id: parseInt(id || '0'),
            student_id: user.id,
            file_name: 'sample_assignment.pdf',
            file_path: '/uploads/assignments/sample_assignment.pdf',
            file_size: 1024000,
            file_type: 'application/pdf',
            version: 1,
            timestamp: '2024-01-20T14:30:00Z',
            submitted_at: '2024-01-20T14:30:00Z',
            status: 'submitted',
            feedback: 'Good work! Your assignment shows understanding of the concepts.',
            grade: 85,
            teacher_name: 'Dr. Sarah Johnson',
            feedback_date: '2024-01-22T10:00:00Z'
          };
          setSubmission(mockSubmission);
        }
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
      // Fallback: Create mock submission data for development
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const mockSubmission = {
        id: 1,
        assignment_id: parseInt(id || '0'),
        student_id: user.id || 1,
        file_name: 'sample_assignment.pdf',
        file_path: '/uploads/assignments/sample_assignment.pdf',
        file_size: 1024000,
        file_type: 'application/pdf',
        version: 1,
        timestamp: '2024-01-20T14:30:00Z',
        submitted_at: '2024-01-20T14:30:00Z',
        status: 'submitted',
        feedback: 'Good work! Your assignment shows understanding of the concepts.',
        grade: 85,
        teacher_name: 'Dr. Sarah Johnson',
        feedback_date: '2024-01-22T10:00:00Z'
      };
      setSubmission(mockSubmission);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile && !submissionText.trim()) {
      alert('Please select a file or write your submission');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      if (submissionText.trim()) {
        formData.append('submission_text', submissionText);
      }
      formData.append('assignment_id', id!);

      const response = await apiService.post('/submissions/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Emit real-time notification
        notificationService.emitRealtimeNotification(
          'assignment_submitted',
          'Assignment Submitted',
          `Assignment "${assignment?.title}" has been submitted successfully`,
          {
            assignment_id: parseInt(id!),
            student_id: 3, // Should be dynamic
            status: 'submitted'
          },
          'high'
        );

        // Refresh submission details
        await fetchSubmissionDetails();
        alert('Assignment submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Error submitting assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAskQuestion = () => {
    // Navigate to messages page with a pre-filled question about this assignment
    const questionText = `Hi! I have a question about the assignment "${assignment?.title}". Could you please help me?`;
    
    // Store the question in localStorage so it can be pre-filled in the messages page
    localStorage.setItem('pendingQuestion', questionText);
    localStorage.setItem('pendingQuestionContext', JSON.stringify({
      type: 'assignment',
      assignmentId: id,
      assignmentTitle: assignment?.title
    }));
    
    // Navigate to messages page
    navigate('/messages');
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      // For development, we'll create a mock download
      // In production, this would use the actual API endpoint
      console.log(`Mock download: ${fileName} from ${filePath}`);
      
      // Create a mock file download
      const mockContent = `This is a mock file for: ${fileName}\n\nAssignment: ${assignment?.title}\nDownloaded at: ${new Date().toLocaleString()}`;
      const blob = new Blob([mockContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Show success message
      alert(`File "${fileName}" downloaded successfully!`);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Assignment Not Found</h2>
          <p className="text-gray-600 mb-4">The assignment you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/assignments')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-yellow-400/20 rounded-full blur-lg animate-pulse delay-500"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/assignments')}
                  className="mr-6 p-3 text-white hover:text-blue-100 hover:bg-white/20 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-4xl font-black text-white mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    {assignment.title}
                  </h1>
                  <p className="text-xl text-blue-100 font-medium max-w-2xl">
                    📝 {assignment.description}
                  </p>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-center">
                    <div className="text-sm text-blue-100 font-medium mb-1">Due Date</div>
                    <div className="text-2xl font-bold text-white">
                      {new Date(assignment.due_date || '').toLocaleDateString()}
                    </div>
                    <div className="text-sm text-blue-200 mt-1">
                      {new Date(assignment.due_date || '').toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="white"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Assignment Brief */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Assignment Brief</h2>
                  <p className="text-gray-600">Complete assignment details and requirements</p>
                </div>
              </div>
              
              {/* Enhanced Assignment Header Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="group flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-blue-800 font-semibold">Due Date</p>
                      <p className="text-blue-900 font-bold">{new Date(assignment.due_date || '').toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="group flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-green-800 font-semibold">Time</p>
                      <p className="text-green-900 font-bold">{new Date(assignment.due_date || '').toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className="group flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-purple-800 font-semibold">Type</p>
                      <p className="text-purple-900 font-bold">Assignment</p>
                    </div>
                  </div>
                  <div className="group flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-orange-800 font-semibold">Weighting</p>
                      <p className="text-orange-900 font-bold">100%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Assignment Description */}
              <div className="prose prose-lg max-w-none mb-8">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Assignment Description
                  </h3>
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg">
                    {assignment.description}
                  </div>
                </div>
              </div>

              {/* Enhanced Submission Guidelines */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  📋 Submission Guidelines
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="text-yellow-800 space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Submit as PDF, DOC, DOCX, ZIP, RAR, or 7Z</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Maximum file size: 10MB</span>
                    </li>
                  </ul>
                  <ul className="text-yellow-800 space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Complete and properly formatted</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span>Late submissions may have penalties</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Enhanced Submission Section */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Submit Assignment</h2>
                  <p className="text-gray-600">Upload your work and submit for review</p>
                </div>
              </div>
              
              {!submission ? (
                <div className="space-y-4">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Assignment File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors bg-gray-50">
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx,.zip,.rar,.7z"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          {selectedFile ? selectedFile.name : 'Click to upload or drag and drop your assignment'}
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                          Supported formats: PDF, DOC, DOCX, ZIP, RAR, 7Z
                        </p>
                        <p className="text-xs text-gray-400">
                          Maximum file size: 10MB
                        </p>
                        {selectedFile && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                              <span className="text-green-800 font-medium">File selected successfully</span>
                            </div>
                            <p className="text-green-700 text-sm mt-1">
                              Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Text Submission */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Or write your submission here
                    </label>
                    <textarea
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      rows={6}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write your assignment submission here..."
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-blue-900 mb-2">📝 Submission Checklist</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Review assignment requirements
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Ensure proper file format (PDF, DOCX, ZIP)
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Check file size (max 10MB)
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                        Verify submission before deadline
                      </li>
                    </ul>
                  </div>

                  <div className="flex space-x-4">
                    {selectedFile && (
                      <button
                        onClick={() => setShowPreview(true)}
                        className="feedback-button feedback-button-info flex-1"
                      >
                        <Eye className="feedback-button-icon" />
                        Preview Submission
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to submit this assignment? You cannot make changes after submission.')) {
                          handleSubmit();
                        }
                      }}
                      disabled={submitting || (!selectedFile && !submissionText.trim())}
                      className={`feedback-button feedback-button-success ${selectedFile ? 'flex-1' : 'w-full'} ${
                        submitting ? 'feedback-button-loading' : ''
                      }`}
                    >
                      {submitting ? (
                        <>
                          Submitting Assignment...
                        </>
                      ) : (
                        <>
                          <Send className="feedback-button-icon" />
                          Submit Assignment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Submission Success */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-green-800">Assignment Submitted Successfully</h3>
                        <p className="text-green-700">
                          Submitted on {new Date(submission?.submitted_at || '').toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">✅</div>
                          <p className="text-sm text-gray-600">Status</p>
                          <p className="font-semibold text-green-800">Submitted</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">📅</div>
                          <p className="text-sm text-gray-600">Submission Date</p>
                          <p className="font-semibold text-blue-800">{new Date(submission?.submitted_at || '').toLocaleDateString()}</p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">⏰</div>
                          <p className="text-sm text-gray-600">Submission Time</p>
                          <p className="font-semibold text-purple-800">{new Date(submission?.submitted_at || '').toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submitted File */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-600" />
                      📄 Submitted File
                    </h4>
                    
                    {submission?.file_path ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Submission File</p>
                                <p className="text-sm text-gray-600">Version {submission?.version}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="feedback-button-group">
                          <button
                            onClick={() => downloadFile(submission?.file_path || '', `submission_${submission?.id}`)}
                            className="feedback-button feedback-button-info"
                          >
                            <Download className="feedback-button-icon" />
                            Download
                          </button>
                          <button
                            onClick={() => window.open(`http://localhost:5006/api/files/${submission?.file_path}`, '_blank')}
                            className="feedback-button feedback-button-success"
                          >
                            <Eye className="feedback-button-icon" />
                            Preview
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-semibold">No file submitted</p>
                        <p className="text-gray-400 text-sm">This submission was made via text only</p>
                      </div>
                    )}
                  </div>

                  {/* Grade and Feedback Section */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                      📊 Grade & Feedback
                    </h4>
                    
                    {submission?.grade ? (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">{submission.grade}</div>
                            <div className="text-green-800 font-semibold">
                              out of {assignment.max_marks || assignment.total_marks || 'N/A'} points
                            </div>
                            <div className="text-sm text-gray-600 mt-2">
                              {((submission.grade / (assignment.max_marks || assignment.total_marks || 100)) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="font-semibold text-blue-900 mb-2">📝 Teacher Feedback</h5>
                          <p className="text-blue-800 text-sm">
                            Your teacher has provided detailed feedback on your submission. 
                            Check the feedback section on the right for more details.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 font-semibold">Awaiting Grade</p>
                        <p className="text-gray-400 text-sm">Your teacher is reviewing your submission</p>
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-800 text-sm">
                            💡 <strong>Tip:</strong> You can ask questions about your submission using the feedback form.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Teacher Communication */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Communication</h3>
              <div className="space-y-3">
                <button 
                  className="feedback-button feedback-button-primary w-full"
                  onClick={() => navigate('/messages')}
                >
                  <MessageCircle className="feedback-button-icon" />
                  Message Teacher
                </button>
                <button 
                  className="feedback-button feedback-button-success w-full"
                  onClick={() => handleAskQuestion()}
                >
                  <Send className="feedback-button-icon" />
                  Ask Question
                </button>
              </div>
            </div>

            {/* Assignment Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">{new Date(assignment.due_date || '').toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">Assignment</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    submission?.status === 'submitted' ? 'bg-green-100 text-green-800' :
                    submission?.status === 'graded' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {submission?.status || 'Not Submitted'}
                  </span>
                </div>
              </div>
            </div>

            {/* Feedback Chat */}
            {submission && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback & Discussion</h3>
                <FeedbackChat
                  assignmentId={parseInt(id!)}
                  studentId={3}
                  currentUserId={3}
                  currentUserRole="student"
                  currentUserName="Student User"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedFile && (
        <SubmissionPreview
          file={selectedFile}
          onClose={() => setShowPreview(false)}
          onSubmit={() => {
            setShowPreview(false);
            handleSubmit();
          }}
          isSubmitting={submitting}
        />
      )}

      {/* Split View for Submitted Assignments */}
      {submission && viewMode === 'split' && (
        <AssignmentSplitView
          assignment={assignment!}
          submission={submission}
          feedback={feedback[0]}
          currentUserId={3} // Should be dynamic
          currentUserRole="student"
          currentUserName="Student"
        />
      )}
    </div>
  );
};

export default AssignmentSubmission;