import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  Calendar, 
  User, 
  MessageCircle, 
  Star,
  CheckCircle,
  XCircle,
  Award,
  RotateCcw
} from 'lucide-react';

interface QuizDetailsData {
  id: number;
  title: string;
  description: string;
  deadline: string;
  duration: number;
  total_questions: number;
  max_marks: number;
  status: 'not_attempted' | 'attempted' | 'completed' | 'graded';
  results?: {
    score: number;
    total_marks: number;
    percentage: number;
    passed: boolean;
    submitted_at: string;
    teacher_feedback?: string;
    teacher_name?: string;
    feedback_date?: string;
  };
}

const QuizDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizDetailsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizDetails();
  }, [id]);

  const fetchQuizDetails = async () => {
    try {
      setLoading(true);
      
      // Mock quiz details data
      const mockQuiz: QuizDetailsData = {
        id: parseInt(id || '1'),
        title: "React Fundamentals Quiz",
        description: "Test your knowledge of React basics, components, hooks, and best practices. This quiz covers JSX, state management, lifecycle methods, and component composition.",
        deadline: "2024-12-31T23:59:59Z",
        duration: 30,
        total_questions: 5,
        max_marks: 15,
        status: 'completed',
        results: {
          score: 12,
          total_marks: 15,
          percentage: 80,
          passed: true,
          submitted_at: "2024-01-15T10:30:00Z",
          teacher_feedback: "Great work on this quiz! You demonstrated a solid understanding of React fundamentals. Your answers to the JSX and useState questions were particularly well-explained. Keep up the excellent work!",
          teacher_name: "Dr. Sarah Johnson",
          feedback_date: "2024-01-15T14:30:00Z"
        }
      };

      setQuiz(mockQuiz);
    } catch (error) {
      console.error('Error fetching quiz details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageTeacher = () => {
    const questionText = `Hi! I have a question about the quiz "${quiz?.title}". Could you please help me?`;
    localStorage.setItem('pendingQuestion', questionText);
    localStorage.setItem('pendingQuestionContext', JSON.stringify({
      type: 'quiz',
      quizId: quiz?.id,
      quizTitle: quiz?.title
    }));
    navigate('/messages');
  };

  const handleTakeQuiz = () => {
    navigate(`/quiz/${id}/take`);
  };

  const handleViewResults = () => {
    navigate(`/quiz/${id}/results`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Quiz Not Found</h2>
          <p className="text-gray-600 mb-6">The quiz you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/quizzes')}
            className="feedback-button feedback-button-primary"
          >
            <ArrowLeft className="feedback-button-icon" />
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const isOverdue = new Date(quiz.deadline) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/quizzes')}
                className="feedback-button feedback-button-secondary"
              >
                <ArrowLeft className="feedback-button-icon" />
                Back to Quizzes
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
                <p className="text-gray-600">Quiz Details & Results</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-lg font-semibold ${
              quiz.status === 'completed' ? 'bg-green-100 text-green-700' :
              quiz.status === 'attempted' ? 'bg-yellow-100 text-yellow-700' :
              quiz.status === 'graded' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {quiz.status === 'completed' ? 'Completed' :
               quiz.status === 'attempted' ? 'Attempted' :
               quiz.status === 'graded' ? 'Graded' :
               'Not Attempted'}
            </div>
          </div>
        </div>

        {/* Quiz Information */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz Information</h2>
          <p className="text-gray-700 mb-6">{quiz.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Duration</h3>
              <p className="text-gray-600">{quiz.duration} minutes</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
              <p className="text-gray-600">{quiz.total_questions}</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Total Marks</h3>
              <p className="text-gray-600">{quiz.max_marks}</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Deadline</h3>
              <p className="text-gray-600">{new Date(quiz.deadline).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {quiz.results && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Score</h3>
                <p className="text-3xl font-bold text-green-600">{quiz.results.score} / {quiz.results.total_marks}</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Percentage</h3>
                <p className="text-3xl font-bold text-blue-600">{quiz.results.percentage}%</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  {quiz.results.passed ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Status</h3>
                <p className={`text-3xl font-bold ${quiz.results.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {quiz.results.passed ? 'Passed' : 'Failed'}
                </p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleViewResults}
                className="feedback-button feedback-button-primary"
              >
                <BookOpen className="feedback-button-icon" />
                View Detailed Results
              </button>
            </div>
          </div>
        )}

        {/* Teacher Feedback Section */}
        {quiz.results?.teacher_feedback && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Teacher Feedback</h2>
                  <p className="text-gray-600">Feedback from your instructor</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {quiz.results.teacher_name || 'Your Teacher'}
                      </span>
                      {quiz.results.feedback_date && (
                        <span className="text-sm text-gray-500">
                          • {new Date(quiz.results.feedback_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{quiz.results.teacher_feedback}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleMessageTeacher}
                  className="feedback-button feedback-button-info"
                >
                  <MessageCircle className="feedback-button-icon" />
                  Ask Teacher a Question
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {quiz.status === 'not_attempted' && !isOverdue && (
            <button
              onClick={handleTakeQuiz}
              className="feedback-button feedback-button-success"
            >
              <BookOpen className="feedback-button-icon" />
              Take Quiz
            </button>
          )}
          
          {quiz.status === 'attempted' && (
            <button
              onClick={handleTakeQuiz}
              className="feedback-button feedback-button-warning"
            >
              <RotateCcw className="feedback-button-icon" />
              Retake Quiz
            </button>
          )}
          
          {quiz.status === 'completed' && (
            <button
              onClick={handleViewResults}
              className="feedback-button feedback-button-primary"
            >
              <BookOpen className="feedback-button-icon" />
              View Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizDetails;
