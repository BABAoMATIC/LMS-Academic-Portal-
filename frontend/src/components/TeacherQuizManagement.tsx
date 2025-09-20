import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  HelpCircle, 
  Clock, 
  CheckCircle, 
  X, 
  Star,
  MessageSquare,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  TrendingUp,
  Award
} from 'lucide-react';
import '../styles/quiz-management-enhanced.css';

interface Quiz {
  id: number;
  title: string;
  description: string;
  totalQuestions: number;
  timeLimit: number; // in minutes
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  status: 'active' | 'completed' | 'draft';
  createdDate: string;
  attempts: StudentQuizAttempt[];
}

interface StudentQuizAttempt {
  id: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
  attemptDate: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'passed' | 'failed';
  timeSpent: number; // in minutes
  answers: QuizAnswer[];
  feedback: string | null;
  comments: Comment[];
}

interface QuizAnswer {
  questionId: number;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface Comment {
  id: number;
  author: string;
  authorType: 'teacher' | 'student';
  content: string;
  timestamp: string;
}

const TeacherQuizManagement: React.FC = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'draft'>('all');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<StudentQuizAttempt | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [createQuizForm, setCreateQuizForm] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    totalQuestions: 10,
    passPercentage: 60
  });

  useEffect(() => {
    // Mock data for quizzes
    const mockQuizzes: Quiz[] = [
      {
        id: 1,
        title: "React Fundamentals Quiz",
        description: "Test your knowledge of React basics, components, and hooks",
        totalQuestions: 20,
        timeLimit: 30,
        totalAttempts: 25,
        averageScore: 78.5,
        passRate: 85,
        status: 'active',
        createdDate: "2024-01-10",
        attempts: [
          {
            id: 1,
            studentId: "STU001",
            studentName: "John Smith",
            studentEmail: "john.smith@email.com",
            attemptDate: "2024-01-15",
            score: 18,
            maxScore: 20,
            percentage: 90,
            status: 'passed',
            timeSpent: 25,
            feedback: "Excellent work! Great understanding of React concepts.",
            answers: [
              {
                questionId: 1,
                question: "What is JSX?",
                selectedAnswer: "JavaScript XML",
                correctAnswer: "JavaScript XML",
                isCorrect: true
              },
              {
                questionId: 2,
                question: "What is the purpose of useState?",
                selectedAnswer: "To manage state in functional components",
                correctAnswer: "To manage state in functional components",
                isCorrect: true
              }
            ],
            comments: [
              {
                id: 1,
                author: "John Smith",
                authorType: 'student',
                content: "Thank you for the feedback! I'm glad I understood the concepts well.",
                timestamp: "2024-01-15T14:30:00Z"
              }
            ]
          },
          {
            id: 2,
            studentId: "STU002",
            studentName: "Sarah Johnson",
            studentEmail: "sarah.johnson@email.com",
            attemptDate: "2024-01-15",
            score: 14,
            maxScore: 20,
            percentage: 70,
            status: 'failed',
            timeSpent: 28,
            feedback: "Good attempt! Review React hooks and component lifecycle.",
            answers: [
              {
                questionId: 1,
                question: "What is JSX?",
                selectedAnswer: "JavaScript XML",
                correctAnswer: "JavaScript XML",
                isCorrect: true
              },
              {
                questionId: 2,
                question: "What is the purpose of useState?",
                selectedAnswer: "To create components",
                correctAnswer: "To manage state in functional components",
                isCorrect: false
              }
            ],
            comments: []
          }
        ]
      },
      {
        id: 2,
        title: "JavaScript ES6 Features",
        description: "Test knowledge of modern JavaScript features",
        totalQuestions: 15,
        timeLimit: 25,
        totalAttempts: 20,
        averageScore: 82.3,
        passRate: 90,
        status: 'completed',
        createdDate: "2024-01-05",
        attempts: [
          {
            id: 3,
            studentId: "STU001",
            studentName: "John Smith",
            studentEmail: "john.smith@email.com",
            attemptDate: "2024-01-12",
            score: 13,
            maxScore: 15,
            percentage: 87,
            status: 'passed',
            timeSpent: 22,
            feedback: "Well done! Good understanding of ES6 features.",
            answers: [],
            comments: []
          }
        ]
      }
    ];

    setQuizzes(mockQuizzes);
    setLoading(false);
  }, []);

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || quiz.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSendFeedback = () => {
    if (selectedAttempt && feedbackText.trim()) {
      // Update the attempt with feedback
      const updatedQuizzes = quizzes.map(quiz => {
        if (quiz.id === selectedQuiz?.id) {
          return {
            ...quiz,
            attempts: quiz.attempts.map(attempt => 
              attempt.id === selectedAttempt.id
                ? { ...attempt, feedback: feedbackText }
                : attempt
            )
          };
        }
        return quiz;
      });
      setQuizzes(updatedQuizzes);
      setShowFeedbackModal(false);
      setFeedbackText('');
      setSelectedAttempt(null);
      alert('Feedback sent successfully!');
    }
  };

  const handleCreateQuiz = () => {
    if (createQuizForm.title.trim() && createQuizForm.description.trim()) {
      // Create new quiz object
      const newQuiz: Quiz = {
        id: quizzes.length + 1, // Simple ID generation
        title: createQuizForm.title,
        description: createQuizForm.description,
        totalQuestions: createQuizForm.totalQuestions,
        timeLimit: createQuizForm.timeLimit,
        totalAttempts: 0,
        averageScore: 0,
        passRate: createQuizForm.passPercentage,
        status: 'draft',
        createdDate: new Date().toISOString().split('T')[0],
        attempts: []
      };

      // Add to quizzes list
      setQuizzes(prevQuizzes => [newQuiz, ...prevQuizzes]);
      
      // Reset form and close modal
      setCreateQuizForm({
        title: '',
        description: '',
        timeLimit: 30,
        totalQuestions: 10,
        passPercentage: 60
      });
      setShowCreateQuiz(false);
      
      console.log('Created new quiz:', newQuiz);
      alert('Quiz created successfully!');
    }
  };

  const handleAddComment = (attemptId: number, content: string) => {
    if (content.trim()) {
      const newComment: Comment = {
        id: Date.now(),
        author: user?.name || 'Teacher',
        authorType: 'teacher',
        content: content.trim(),
        timestamp: new Date().toISOString()
      };

      const updatedQuizzes = quizzes.map(quiz => {
        if (quiz.id === selectedQuiz?.id) {
          return {
            ...quiz,
            attempts: quiz.attempts.map(attempt => 
              attempt.id === attemptId
                ? { ...attempt, comments: [...attempt.comments, newComment] }
                : attempt
            )
          };
        }
        return quiz;
      });
      setQuizzes(updatedQuizzes);
    }
  };

  if (loading) {
    return (
      <div className="quiz-management-loading">
        <div className="quiz-management-spinner"></div>
      </div>
    );
  }

  return (
    <div className="quiz-management-container">
      {/* Header */}
      <div className="quiz-management-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Quiz Management</h2>
            <p className="text-white/80">Manage quizzes and review student attempts</p>
          </div>
          <button 
            onClick={() => setShowCreateQuiz(true)}
            className="quiz-management-button success"
          >
            <Plus className="w-4 h-4" />
            Create Quiz
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="quiz-management-search">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="quiz-management-search-icon w-5 h-5" />
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="quiz-management-search-input w-full"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="quiz-management-filter"
            >
              <option value="all">All Quizzes</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="quiz-management-grid">
        {filteredQuizzes.map((quiz, index) => (
          <div
            key={quiz.id}
            className={`quiz-management-card ${quiz.status} quiz-management-fade-in`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{quiz.title}</h3>
                <p className="text-white/80 text-sm mb-3">{quiz.description}</p>
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <div className="flex items-center gap-1">
                    <HelpCircle className="w-4 h-4" />
                    <span>{quiz.totalQuestions} questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{quiz.timeLimit} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{quiz.totalAttempts} attempts</span>
                  </div>
                </div>
              </div>
              <div className={`quiz-management-status-badge ${quiz.status}`}>
                {quiz.status}
              </div>
            </div>

            <div className="quiz-management-stats">
              <div className="quiz-management-stat">
                <div className="quiz-management-stat-value">{quiz.totalAttempts}</div>
                <div className="quiz-management-stat-label">Attempts</div>
              </div>
              <div className="quiz-management-stat">
                <div className="quiz-management-stat-value">{quiz.averageScore}%</div>
                <div className="quiz-management-stat-label">Avg Score</div>
              </div>
              <div className="quiz-management-stat">
                <div className="quiz-management-stat-value">{quiz.passRate}%</div>
                <div className="quiz-management-stat-label">Pass Rate</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedQuiz(quiz)}
                className="quiz-management-button flex-1"
              >
                <Eye className="w-4 h-4" />
                View Attempts
              </button>
              <button className="quiz-management-button secondary">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quiz Attempts Modal */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="quiz-management-modal w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="quiz-management-modal-header">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">{selectedQuiz.title}</h3>
                  <p className="text-white/80">{selectedQuiz.description}</p>
                </div>
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {selectedQuiz.attempts.map((attempt, index) => (
                  <div key={attempt.id} className={`quiz-management-attempt-card quiz-management-slide-up`} style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="quiz-management-student-avatar">
                          {attempt.studentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{attempt.studentName}</h4>
                          <p className="text-sm text-white/70">{attempt.studentId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`quiz-management-status-badge ${attempt.status}`}>
                          {attempt.status}
                        </div>
                        <div className="text-lg font-bold text-white">{attempt.percentage}%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-white/70 mb-3">
                      <span>Attempted: {attempt.attemptDate}</span>
                      <span>Time spent: {attempt.timeSpent} minutes</span>
                      <span>Score: {attempt.score}/{attempt.maxScore}</span>
                    </div>

                    {attempt.feedback && (
                      <div className="bg-white/10 rounded-lg p-3 mb-3 backdrop-blur-sm">
                        <h5 className="font-medium text-white mb-1">Feedback:</h5>
                        <p className="text-sm text-white/80">{attempt.feedback}</p>
                      </div>
                    )}

                    {/* Quiz Answers */}
                    <div className="border-t border-white/20 pt-3 mb-3">
                      <h5 className="font-medium text-white mb-2">Quiz Answers:</h5>
                      <div className="space-y-2">
                        {attempt.answers.map((answer, index) => (
                          <div key={index} className="quiz-management-answer-card">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm font-medium text-white">{answer.question}</p>
                              <div className={answer.isCorrect ? 'quiz-management-answer-correct' : 'quiz-management-answer-incorrect'}>
                                {answer.isCorrect ? (
                                  <CheckCircle className="w-3 h-3" />
                                ) : (
                                  <X className="w-3 h-3" />
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-white/70">
                              <p><span className="font-medium">Selected:</span> {answer.selectedAnswer}</p>
                              <p><span className="font-medium">Correct:</span> {answer.correctAnswer}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div className="border-t border-white/20 pt-3">
                      <h5 className="font-medium text-white mb-2">Comments:</h5>
                      <div className="space-y-2 mb-3">
                        {attempt.comments.map((comment) => (
                          <div key={comment.id} className="quiz-management-comment flex gap-2">
                            <div className={`quiz-management-comment-avatar ${comment.authorType}`}>
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
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(attempt.id, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                        <button className="quiz-management-button success px-4 py-2 text-sm">
                          Send
                        </button>
                      </div>
                    </div>

                    {/* Feedback Action Button */}
                    <div className="border-t border-white/20 pt-3 mt-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedAttempt(attempt);
                            setFeedbackText(attempt.feedback || '');
                            setShowFeedbackModal(true);
                          }}
                          className="quiz-management-button flex-1"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {attempt.feedback ? 'Edit Feedback' : 'Add Feedback'}
                        </button>
                        <button
                          onClick={() => {
                            // Navigate to student's quiz results
                            // In a real app, this would open the student's results page
                            alert(`Viewing ${attempt.studentName}'s quiz results`);
                          }}
                          className="quiz-management-button secondary"
                        >
                          <Eye className="w-4 h-4" />
                          View Results
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
      {showFeedbackModal && selectedAttempt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="quiz-management-feedback-modal p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              Send Feedback to {selectedAttempt.studentName}
            </h3>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Enter your feedback for the student..."
              className="quiz-management-feedback-textarea w-full h-32 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleSendFeedback}
                className="quiz-management-button flex-1"
              >
                Send Feedback
              </button>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedbackText('');
                  setSelectedAttempt(null);
                }}
                className="quiz-management-button secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="quiz-management-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="quiz-management-modal-header">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Create New Quiz</h3>
                  <p className="text-white/80">Set up a new quiz for your students</p>
                </div>
                <button
                  onClick={() => setShowCreateQuiz(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                handleCreateQuiz();
              }} className="space-y-6">
                {/* Quiz Title */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={createQuizForm.title}
                    onChange={(e) => setCreateQuizForm({...createQuizForm, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="Enter quiz title..."
                  />
                </div>

                {/* Quiz Description */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={createQuizForm.description}
                    onChange={(e) => setCreateQuizForm({...createQuizForm, description: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="Describe what this quiz covers..."
                  />
                </div>

                {/* Quiz Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Time Limit (minutes) *
                    </label>
                    <input
                      type="number"
                      required
                      min="5"
                      max="180"
                      value={createQuizForm.timeLimit}
                      onChange={(e) => setCreateQuizForm({...createQuizForm, timeLimit: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Number of Questions *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={createQuizForm.totalQuestions}
                      onChange={(e) => setCreateQuizForm({...createQuizForm, totalQuestions: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Pass Percentage *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={createQuizForm.passPercentage}
                      onChange={(e) => setCreateQuizForm({...createQuizForm, passPercentage: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Quiz Preview */}
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <h4 className="text-lg font-semibold text-white mb-3">Quiz Preview</h4>
                  <div className="space-y-2 text-sm text-white/80">
                    <p><strong>Title:</strong> {createQuizForm.title || 'Untitled Quiz'}</p>
                    <p><strong>Description:</strong> {createQuizForm.description || 'No description provided'}</p>
                    <p><strong>Time Limit:</strong> {createQuizForm.timeLimit} minutes</p>
                    <p><strong>Questions:</strong> {createQuizForm.totalQuestions}</p>
                    <p><strong>Pass Rate:</strong> {createQuizForm.passPercentage}%</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="quiz-management-button success flex-1"
                  >
                    <Plus className="w-4 h-4" />
                    Create Quiz
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateQuiz(false)}
                    className="quiz-management-button secondary flex-1"
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

export default TeacherQuizManagement;
