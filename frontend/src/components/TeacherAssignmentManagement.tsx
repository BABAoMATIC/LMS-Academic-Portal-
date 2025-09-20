import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  X, 
  Star,
  MessageSquare,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import '../styles/assignment-management-enhanced.css';

interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  totalSubmissions: number;
  gradedSubmissions: number;
  averageGrade: number;
  status: 'active' | 'completed' | 'draft';
  createdDate: string;
  submissions: StudentSubmission[];
  attachedFile?: {
    name: string;
    size: number;
    type: string;
  } | null;
}

interface StudentSubmission {
  id: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedDate: string;
  grade: number | null;
  feedback: string | null;
  status: 'submitted' | 'graded' | 'late';
  fileUrl?: string;
  comments: Comment[];
}

interface Comment {
  id: number;
  author: string;
  authorType: 'teacher' | 'student';
  content: string;
  timestamp: string;
}

const TeacherAssignmentManagement: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'draft'>('all');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [createAssignmentForm, setCreateAssignmentForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxMarks: 100,
    attachedFile: null as File | null,
    fileName: ''
  });

  useEffect(() => {
    // Mock data for assignments
    const mockAssignments: Assignment[] = [
      {
        id: 1,
        title: "React Todo App Project",
        description: "Create a fully functional todo application using React with CRUD operations",
        dueDate: "2024-01-20",
        totalSubmissions: 15,
        gradedSubmissions: 12,
        averageGrade: 87.5,
        status: 'active',
        createdDate: "2024-01-10",
        submissions: [
          {
            id: 1,
            studentId: "STU001",
            studentName: "John Smith",
            studentEmail: "john.smith@email.com",
            submittedDate: "2024-01-18",
            grade: 92,
            feedback: "Excellent work! Great use of React hooks and clean code structure.",
            status: 'graded',
            comments: [
              {
                id: 1,
                author: "John Smith",
                authorType: 'student',
                content: "Thank you for the feedback! I'm glad you liked the implementation.",
                timestamp: "2024-01-19T10:30:00Z"
              }
            ]
          },
          {
            id: 2,
            studentId: "STU002",
            studentName: "Sarah Johnson",
            studentEmail: "sarah.johnson@email.com",
            submittedDate: "2024-01-19",
            grade: 85,
            feedback: "Good implementation. Consider improving the UI design and adding more features.",
            status: 'graded',
            comments: []
          },
          {
            id: 3,
            studentId: "STU003",
            studentName: "Mike Wilson",
            studentEmail: "mike.wilson@email.com",
            submittedDate: "2024-01-20",
            grade: null,
            feedback: null,
            status: 'submitted',
            comments: []
          }
        ]
      },
      {
        id: 2,
        title: "JavaScript ES6 Features",
        description: "Demonstrate understanding of ES6 features with practical examples",
        dueDate: "2024-01-15",
        totalSubmissions: 18,
        gradedSubmissions: 18,
        averageGrade: 82.3,
        status: 'completed',
        createdDate: "2024-01-05",
        submissions: [
          {
            id: 4,
            studentId: "STU001",
            studentName: "John Smith",
            studentEmail: "john.smith@email.com",
            submittedDate: "2024-01-14",
            grade: 88,
            feedback: "Well done! Good use of arrow functions and destructuring.",
            status: 'graded',
            comments: []
          }
        ]
      }
    ];

    setAssignments(mockAssignments);
    setLoading(false);
  }, []);

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleGradeSubmission = () => {
    if (selectedSubmission && grade && feedbackText.trim()) {
      // Update the submission with grade and feedback
      const updatedAssignments = assignments.map(assignment => {
        if (assignment.id === selectedAssignment?.id) {
          return {
            ...assignment,
            submissions: assignment.submissions.map(submission => 
              submission.id === selectedSubmission.id
                ? { ...submission, grade: parseFloat(grade), feedback: feedbackText, status: 'graded' as const }
                : submission
            )
          };
        }
        return assignment;
      });
      setAssignments(updatedAssignments);
      setShowFeedbackModal(false);
      setFeedbackText('');
      setGrade('');
      setSelectedSubmission(null);
      alert('Grade and feedback submitted successfully!');
    }
  };

  const handleAddComment = (submissionId: number, content: string) => {
    if (content.trim()) {
      const newComment: Comment = {
        id: Date.now(),
        author: user?.name || 'Teacher',
        authorType: 'teacher',
        content: content.trim(),
        timestamp: new Date().toISOString()
      };

      const updatedAssignments = assignments.map(assignment => {
        if (assignment.id === selectedAssignment?.id) {
          return {
            ...assignment,
            submissions: assignment.submissions.map(submission => 
              submission.id === submissionId
                ? { ...submission, comments: [...submission.comments, newComment] }
                : submission
            )
          };
        }
        return assignment;
      });
      setAssignments(updatedAssignments);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png'
      ];
      
      if (allowedTypes.includes(file.type)) {
        setCreateAssignmentForm({
          ...createAssignmentForm,
          attachedFile: file,
          fileName: file.name
        });
      } else {
        alert('Please upload a valid file type (PDF, DOC, DOCX, TXT, JPG, PNG)');
        event.target.value = '';
      }
    }
  };

  const handleRemoveFile = () => {
    setCreateAssignmentForm({
      ...createAssignmentForm,
      attachedFile: null,
      fileName: ''
    });
  };

  const handleCreateAssignment = () => {
    if (createAssignmentForm.title.trim() && createAssignmentForm.description.trim() && createAssignmentForm.dueDate) {
      // Create new assignment object
      const newAssignment: Assignment = {
        id: assignments.length + 1, // Simple ID generation
        title: createAssignmentForm.title,
        description: createAssignmentForm.description,
        dueDate: createAssignmentForm.dueDate,
        totalSubmissions: 0,
        gradedSubmissions: 0,
        averageGrade: 0,
        status: 'active',
        createdDate: new Date().toISOString().split('T')[0],
        submissions: [],
        attachedFile: createAssignmentForm.attachedFile ? {
          name: createAssignmentForm.fileName,
          size: createAssignmentForm.attachedFile.size,
          type: createAssignmentForm.attachedFile.type
        } : null
      };

      // Add to assignments list
      setAssignments(prevAssignments => [newAssignment, ...prevAssignments]);
      
      // Reset form and close modal
      setCreateAssignmentForm({
        title: '',
        description: '',
        dueDate: '',
        maxMarks: 100,
        attachedFile: null,
        fileName: ''
      });
      setShowCreateAssignment(false);
      
      console.log('Created new assignment:', newAssignment);
      alert('Assignment created successfully!');
    }
  };

  if (loading) {
    return (
      <div className="assignment-management-loading">
        <div className="assignment-management-spinner"></div>
      </div>
    );
  }

  return (
    <div className="assignment-management-container">
      {/* Header */}
      <div className="assignment-management-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Assignment Management</h2>
            <p className="text-white/80">Manage assignments and review student submissions</p>
          </div>
          <button 
            onClick={() => setShowCreateAssignment(true)}
            className="assignment-management-button success"
          >
            <Plus className="w-4 h-4" />
            Create Assignment
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="assignment-management-search">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="assignment-management-search-icon w-5 h-5" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="assignment-management-search-input w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="assignment-management-filter"
            >
              <option value="all">All Assignments</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="assignment-management-grid">
        {filteredAssignments.map((assignment, index) => (
          <div
            key={assignment.id}
            className={`assignment-management-card ${assignment.status} assignment-management-fade-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{assignment.title}</h3>
                <p className="text-white/80 text-sm mb-3">{assignment.description}</p>
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {assignment.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{assignment.totalSubmissions} submissions</span>
                  </div>
                </div>
              </div>
              <div className={`assignment-management-status-badge ${assignment.status}`}>
                {assignment.status}
              </div>
            </div>

            <div className="assignment-management-stats">
              <div className="assignment-management-stat">
                <div className="assignment-management-stat-value">{assignment.totalSubmissions}</div>
                <div className="assignment-management-stat-label">Total</div>
              </div>
              <div className="assignment-management-stat">
                <div className="assignment-management-stat-value">{assignment.gradedSubmissions}</div>
                <div className="assignment-management-stat-label">Graded</div>
              </div>
              <div className="assignment-management-stat">
                <div className="assignment-management-stat-value">{assignment.averageGrade}%</div>
                <div className="assignment-management-stat-label">Avg Grade</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedAssignment(assignment)}
                className="assignment-management-button flex-1"
              >
                <Eye className="w-4 h-4" />
                View Submissions
              </button>
              <button className="assignment-management-button secondary">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Submissions Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="assignment-management-modal w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="assignment-management-modal-header">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedAssignment.title}</h3>
                  <p className="text-white/80">{selectedAssignment.description}</p>
                </div>
                <button
                  onClick={() => setSelectedAssignment(null)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {selectedAssignment.submissions.map((submission, index) => (
                  <div key={submission.id} className={`assignment-management-submission-card assignment-management-slide-up`} style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="assignment-management-student-avatar">
                          {submission.studentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{submission.studentName}</h4>
                          <p className="text-sm text-white/70">{submission.studentId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`assignment-management-submission-status-badge ${submission.status}`}>
                          {submission.status}
                        </div>
                        {submission.grade && (
                          <div className="text-lg font-bold text-white">{submission.grade}%</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-white/70 mb-3">
                      <span>Submitted: {submission.submittedDate}</span>
                      <div className="flex gap-2">
                        <button className="assignment-management-button success text-sm px-3 py-1">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setShowFeedbackModal(true);
                          }}
                          className="assignment-management-button text-sm px-3 py-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Grade & Feedback
                        </button>
                      </div>
                    </div>

                    {submission.feedback && (
                      <div className="bg-white/10 rounded-lg p-3 mb-3 backdrop-blur-sm">
                        <h5 className="font-medium text-white mb-1">Feedback:</h5>
                        <p className="text-sm text-white/80">{submission.feedback}</p>
                      </div>
                    )}

                    {/* Comments Section */}
                    <div className="border-t border-white/20 pt-3">
                      <h5 className="font-medium text-white mb-2">Comments:</h5>
                      <div className="space-y-2 mb-3">
                        {submission.comments.map((comment) => (
                          <div key={comment.id} className="assignment-management-comment flex gap-2">
                            <div className={`assignment-management-comment-avatar ${comment.authorType}`}>
                              {comment.author.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm text-white">{comment.author}</span>
                                <span className="text-xs text-white/60">{comment.timestamp}</span>
                              </div>
                              <p className="text-sm text-white/80">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/60 focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(submission.id, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <button className="assignment-management-button success px-4 py-2 text-sm">
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="assignment-management-feedback-modal p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              Grade & Feedback for {selectedSubmission.studentName}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Grade (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="assignment-management-feedback-input w-full"
                  placeholder="Enter grade (0-100)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Feedback</label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Enter your feedback for the student..."
                  className="assignment-management-feedback-textarea w-full h-32 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleGradeSubmission}
                className="assignment-management-button flex-1"
              >
                Submit Grade & Feedback
              </button>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackText('');
                  setGrade('');
                  setSelectedSubmission(null);
                }}
                className="assignment-management-button secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="assignment-management-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="assignment-management-modal-header">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Create New Assignment</h3>
                  <p className="text-white/80">Set up a new assignment for your students</p>
                </div>
                <button
                  onClick={() => setShowCreateAssignment(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateAssignment();
              }} className="space-y-6">
                {/* Assignment Title */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={createAssignmentForm.title}
                    onChange={(e) => setCreateAssignmentForm({...createAssignmentForm, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="Enter assignment title..."
                  />
                </div>

                {/* Assignment Description */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={createAssignmentForm.description}
                    onChange={(e) => setCreateAssignmentForm({...createAssignmentForm, description: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="Describe the assignment requirements and instructions..."
                  />
                </div>

                {/* Assignment Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={createAssignmentForm.dueDate}
                      onChange={(e) => setCreateAssignmentForm({...createAssignmentForm, dueDate: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Maximum Marks
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={createAssignmentForm.maxMarks}
                      onChange={(e) => setCreateAssignmentForm({...createAssignmentForm, maxMarks: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Attach File (Optional)
                  </label>
                  <div className="assignment-file-upload-container">
                    {!createAssignmentForm.attachedFile ? (
                      <div className="assignment-file-upload-area">
                        <input
                          type="file"
                          id="file-upload"
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                          className="assignment-file-input"
                        />
                        <label htmlFor="file-upload" className="assignment-file-upload-label">
                          <div className="assignment-file-upload-icon">
                            <FileText className="w-8 h-8" />
                          </div>
                          <div className="assignment-file-upload-text">
                            <span className="assignment-file-upload-title">Click to upload file</span>
                            <span className="assignment-file-upload-subtitle">
                              PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
                            </span>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="assignment-file-preview">
                        <div className="assignment-file-info">
                          <div className="assignment-file-icon">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="assignment-file-details">
                            <div className="assignment-file-name">{createAssignmentForm.fileName}</div>
                            <div className="assignment-file-size">
                              {(createAssignmentForm.attachedFile.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="assignment-file-remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignment Preview */}
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <h4 className="text-lg font-semibold text-white mb-3">Assignment Preview</h4>
                  <div className="space-y-2 text-sm text-white/80">
                    <p><strong>Title:</strong> {createAssignmentForm.title || 'Untitled Assignment'}</p>
                    <p><strong>Description:</strong> {createAssignmentForm.description || 'No description provided'}</p>
                    <p><strong>Due Date:</strong> {createAssignmentForm.dueDate || 'Not set'}</p>
                    <p><strong>Max Marks:</strong> {createAssignmentForm.maxMarks}</p>
                    {createAssignmentForm.attachedFile && (
                      <p><strong>Attached File:</strong> {createAssignmentForm.fileName} ({(createAssignmentForm.attachedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="assignment-management-button success flex-1"
                  >
                    <Plus className="w-4 h-4" />
                    Create Assignment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateAssignment(false)}
                    className="assignment-management-button secondary flex-1"
                  >
                    Cancel
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

export default TeacherAssignmentManagement;
