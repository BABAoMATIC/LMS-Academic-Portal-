import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Download, 
  MessageCircle, 
  Star, 
  ThumbsUp, 
  Calendar, 
  User, 
  FileText, 
  Image, 
  Video, 
  Code, 
  Link,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Minimize,
  Send,
  Paperclip,
  Smile,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import '../styles/enhanced-styles.css';

interface FeedbackData {
  id: number;
  assignment_id: number;
  student_id: number;
  teacher_id: number;
  teacher_name: string;
  feedback_text: string;
  grade: number;
  max_marks: number;
  created_at: string;
  updated_at: string;
}

interface SubmissionData {
  id: number;
  assignment_id: number;
  student_id: number;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: string;
  submitted_at: string;
  status: string;
}

interface AssignmentData {
  id: number;
  title: string;
  description: string;
  due_date: string;
  max_marks: number;
  instructions: string;
}

interface EnhancedViewFeedbackProps {
  assignmentId: number;
  studentId: number;
}

const EnhancedViewFeedback: React.FC<EnhancedViewFeedbackProps> = ({
  assignmentId,
  studentId
}) => {
  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'submission' | 'feedback' | 'chat'>('submission');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [assignmentId, studentId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch assignment, submission, and feedback data
      // This would be replaced with actual API calls
      const mockData = {
        assignment: {
          id: assignmentId,
          title: "Advanced React Development",
          description: "Build a comprehensive React application with modern features",
          due_date: "2024-01-15T23:59:59Z",
          max_marks: 100,
          instructions: "Create a full-stack React application with authentication, state management, and API integration."
        },
        submission: {
          id: 1,
          assignment_id: assignmentId,
          student_id: studentId,
          file_path: "submissions/react-app.zip",
          file_name: "react-app.zip",
          file_type: "application/zip",
          file_size: "2.5 MB",
          submitted_at: "2024-01-14T15:30:00Z",
          status: "graded"
        },
        feedback: {
          id: 1,
          assignment_id: assignmentId,
          student_id: studentId,
          teacher_id: 1,
          teacher_name: "Dr. Sarah Johnson",
          feedback_text: "Excellent work on the React application! Your implementation shows strong understanding of modern React patterns. The authentication system is well-implemented and the state management using Redux is clean and efficient. The UI/UX design is modern and responsive. Areas for improvement: Consider adding more comprehensive error handling and implementing accessibility features. Overall grade: 92/100",
          grade: 92,
          max_marks: 100,
          created_at: "2024-01-16T10:00:00Z",
          updated_at: "2024-01-16T10:00:00Z"
        }
      };

      setAssignment(mockData.assignment);
      setSubmission(mockData.submission);
      setFeedback(mockData.feedback);
    } catch (error) {
      console.error('Error fetching feedback data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <Image className="w-8 h-8" />;
    if (fileType.includes('video')) return <Video className="w-8 h-8" />;
    if (fileType.includes('pdf')) return <FileText className="w-8 h-8" />;
    if (fileType.includes('zip')) return <Code className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  const getGradeColor = (grade: number, maxMarks: number) => {
    const percentage = (grade / maxMarks) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        sender: 'student',
        content: newMessage,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="enhanced-loading w-12 h-12 mx-auto mb-4"></div>
          <p className="enhanced-text">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="enhanced-container py-6">
          <div className="enhanced-flex enhanced-flex--between">
            <div>
              <h1 className="enhanced-heading enhanced-heading--h2">
                {assignment?.title}
              </h1>
              <p className="enhanced-text">
                Feedback & Submission Review
              </p>
            </div>
            <div className="enhanced-flex gap-4">
              {feedback && (
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getGradeColor(feedback.grade, feedback.max_marks)}`}>
                    {feedback.grade}/{feedback.max_marks}
                  </div>
                  <div className="enhanced-text enhanced-text--small">
                    {((feedback.grade / feedback.max_marks) * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="enhanced-container py-8">
        <div className="enhanced-grid enhanced-grid--2 gap-8">
          {/* Left Side - Submission */}
          <div className="enhanced-card">
            <div className="enhanced-flex enhanced-flex--between mb-6">
              <h2 className="enhanced-heading enhanced-heading--h3">Your Submission</h2>
              <div className="enhanced-flex gap-2">
                <button
                  onClick={handleZoomOut}
                  className="enhanced-btn enhanced-btn--outline"
                  disabled={zoomLevel <= 50}
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="enhanced-text enhanced-text--small px-2 py-1 bg-gray-100 rounded">
                  {zoomLevel}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="enhanced-btn enhanced-btn--outline"
                  disabled={zoomLevel >= 200}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleFullscreen}
                  className="enhanced-btn enhanced-btn--outline"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {submission && (
              <div className="space-y-6">
                {/* File Info */}
                <div className="enhanced-flex gap-4 p-4 bg-gray-50 rounded-lg">
                  {getFileIcon(submission.file_type)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{submission.file_name}</h3>
                    <div className="enhanced-flex gap-4 text-sm text-gray-600">
                      <span>Size: {submission.file_size}</span>
                      <span>Type: {submission.file_type}</span>
                      <span>Submitted: {formatDate(submission.submitted_at)}</span>
                    </div>
                  </div>
                  <button className="enhanced-btn enhanced-btn--primary">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                </div>

                {/* File Preview */}
                <div 
                  className="border border-gray-200 rounded-lg overflow-hidden"
                  style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
                >
                  <div className="h-96 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">File Preview</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Click download to view the full file
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Feedback */}
          <div className="enhanced-card">
            <div className="enhanced-flex enhanced-flex--between mb-6">
              <h2 className="enhanced-heading enhanced-heading--h3">Teacher Feedback</h2>
              <div className="enhanced-flex gap-2">
                <button className="enhanced-btn enhanced-btn--outline">
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Helpful
                </button>
                <button className="enhanced-btn enhanced-btn--outline">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Reply
                </button>
              </div>
            </div>

            {feedback && (
              <div className="space-y-6">
                {/* Teacher Info */}
                <div className="enhanced-flex gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feedback.teacher_name}</h3>
                    <p className="enhanced-text enhanced-text--small">
                      Feedback provided on {formatDate(feedback.created_at)}
                    </p>
                  </div>
                </div>

                {/* Grade Display */}
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className={`text-4xl font-bold mb-2 ${getGradeColor(feedback.grade, feedback.max_marks)}`}>
                    {feedback.grade}/{feedback.max_marks}
                  </div>
                  <div className="enhanced-progress mb-2">
                    <div 
                      className="enhanced-progress__bar"
                      style={{ width: `${(feedback.grade / feedback.max_marks) * 100}%` }}
                    ></div>
                  </div>
                  <p className="enhanced-text enhanced-text--small">
                    {((feedback.grade / feedback.max_marks) * 100).toFixed(1)}% - Excellent Work!
                  </p>
                </div>

                {/* Feedback Text */}
                <div className="p-4 bg-white border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Detailed Feedback</h4>
                  <div className="prose max-w-none">
                    <p className="enhanced-text leading-relaxed">
                      {feedback.feedback_text}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="enhanced-flex gap-3">
                  <button className="enhanced-btn enhanced-btn--success flex-1">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Read
                  </button>
                  <button className="enhanced-btn enhanced-btn--primary flex-1">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Ask Question
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Section */}
        <div className="mt-8">
          <div className="enhanced-card">
            <h2 className="enhanced-heading enhanced-heading--h3 mb-6">Discussion</h2>
            
            {/* Messages */}
            <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'student' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          message.sender === 'student'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'student' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatDate(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="enhanced-flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="enhanced-input pr-12"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700">
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="enhanced-btn enhanced-btn--primary"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedViewFeedback;
