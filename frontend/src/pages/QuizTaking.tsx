import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import notificationService from '../services/notificationService';
import FeedbackChat from '../components/FeedbackChat';
import { Quiz } from '../types';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Play,
  Pause,
  Flag,
  Send
} from 'lucide-react';

interface QuizTakingProps {}

interface Question {
  id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer?: string;
  points: number;
}

interface Answer {
  question_id: number;
  answer_text: string;
  is_correct?: boolean;
}

const QuizTaking: React.FC<QuizTakingProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchQuizDetails();
      // Reset quiz state when starting a new quiz
      resetQuizState();
    }
  }, [id]);

  const resetQuizState = () => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setQuizStarted(false);
    setQuizCompleted(false);
    setShowResults(false);
    setQuizResults(null);
    setTimeLeft(0);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft]);

  const fetchQuizDetails = async () => {
    try {
      const response = await apiService.get(`/quiz/${id}`);
      setQuiz(response.data);
      
      // Questions are already included in the quiz response
      if (response.data && response.data.questions) {
        setQuestions(Array.isArray(response.data.questions) ? response.data.questions : []);
      } else {
        setQuestions([]);
      }
      
      // Check if student has already attempted this quiz
      const attemptResponse = await apiService.get(`/quiz-attempts/${id}/student/3`);
      if (attemptResponse.data && attemptResponse.data.length > 0) {
        const attempt = attemptResponse.data[0];
        if (attempt.status === 'completed') {
          setQuizCompleted(true);
          setQuizResults(attempt);
        }
      }
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      setQuestions([]); // Ensure questions is always an array
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    setQuizStarted(true);
    setTimeLeft(quiz?.duration || 30); // duration in minutes, convert to seconds
    setAnswers([]);
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.question_id === questionId);
      if (existingIndex >= 0) {
        const newAnswers = [...prev];
        newAnswers[existingIndex] = { question_id: questionId, answer_text: answer };
        return newAnswers;
      } else {
        return [...prev, { question_id: questionId, answer_text: answer }];
      }
    });
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const response = await apiService.post('/quiz-attempts/submit', {
        quiz_id: parseInt(id!),
        student_id: 3,
        answers: answers,
        time_taken: (quiz?.duration || 30) * 60 - timeLeft
      });

      if (response.data.success) {
        setQuizCompleted(true);
        setQuizResults(response.data.results);
        setShowResults(true);
        
        // Emit real-time notification
        notificationService.emitRealtimeNotification(
          'quiz_completed',
          'Quiz Completed Successfully!',
          `You scored ${response.data.results.percentage?.toFixed(1)}% on ${quiz?.title}`,
          {
            quiz_id: parseInt(id!),
            student_id: 3,
            percentage: response.data.results.percentage,
            grade: response.data.results.grade
          },
          'high'
        );
        
        // Emit socket event for real-time updates
        notificationService.emit('quiz_completed', {
          quiz_id: parseInt(id!),
          student_id: 3,
          percentage: response.data.results.percentage,
          grade: response.data.results.grade,
          message: 'Quiz completed successfully'
        });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCurrentAnswer = (questionId: number) => {
    const answer = answers.find(a => a.question_id === questionId);
    return answer?.answer_text || '';
  };

  const getProgressPercentage = () => {
    if (!Array.isArray(questions) || questions.length === 0) return 0;
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
          <p className="text-gray-600 mb-4">The quiz you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/quizzes')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  if (quizCompleted && showResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/quizzes')}
                  className="mr-4 p-2 rounded-lg hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quiz Results - Left Side */}
            <div className="lg:col-span-2">
              <div className="quiz-results-card">
                <div className="text-center mb-8">
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
                  <p className="text-xl text-gray-600 mb-6">{quiz.title}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="quiz-score-card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{quizResults?.marks_obtained || 0}</div>
                    <div className="text-sm font-semibold text-blue-800">Marks Obtained</div>
                    <div className="text-xs text-blue-600 mt-1">out of {quizResults?.total_marks || 0}</div>
                  </div>
                  <div className="quiz-score-card bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">{quizResults?.percentage || 0}%</div>
                    <div className="text-sm font-semibold text-green-800">Percentage</div>
                    <div className="text-xs text-green-600 mt-1">overall score</div>
                  </div>
                  <div className="quiz-score-card bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{quizResults?.grade || 'N/A'}</div>
                    <div className="text-sm font-semibold text-purple-800">Grade</div>
                    <div className="text-xs text-purple-600 mt-1">final grade</div>
                  </div>
                </div>

                {/* Individual Question Results */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Question Breakdown</h3>
                  <div className="space-y-4">
                    {Array.isArray(questions) && questions.map((question, index) => {
                      const userAnswer = getCurrentAnswer(question.id);
                      const isCorrect = userAnswer === question.correct_answer;
                      return (
                        <div key={question.id} className={`p-6 rounded-xl border-2 shadow-sm transition-all duration-300 hover:shadow-md ${isCorrect ? 'border-green-200 bg-gradient-to-r from-green-50 to-green-100' : 'border-red-200 bg-gradient-to-r from-red-50 to-red-100'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3 ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                  {index + 1}
                                </div>
                                <div className="font-bold text-gray-900">Question {index + 1}</div>
                                <div className="ml-auto text-sm text-gray-500">
                                  {question.points} point{question.points !== 1 ? 's' : ''}
                                </div>
                              </div>
                              <div className="text-gray-700 mb-4 leading-relaxed">{question.question_text}</div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className={`p-3 rounded-lg border ${isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                                  <div className="text-xs font-semibold text-gray-600 mb-1">Your Answer:</div>
                                  <div className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                    {userAnswer || 'Not answered'}
                                  </div>
                                </div>
                                
                                {!isCorrect && (
                                  <div className="p-3 rounded-lg border border-green-300 bg-green-50">
                                    <div className="text-xs font-semibold text-gray-600 mb-1">Correct Answer:</div>
                                    <div className="font-medium text-green-800">{question.correct_answer}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className={`ml-4 px-4 py-2 rounded-full text-sm font-bold flex items-center ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {isCorrect ? (
                                <>
                                  <span className="mr-1">✓</span>
                                  Correct
                                </>
                              ) : (
                                <>
                                  <span className="mr-1">✗</span>
                                  Incorrect
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex space-x-4 justify-center">
                  <button
                    onClick={() => navigate('/quizzes')}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg"
                  >
                    Back to Quizzes
                  </button>
                  <button
                    onClick={() => setShowResults(false)}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold shadow-lg"
                  >
                    Review Answers
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Teacher Feedback - Right Side */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">👨‍🏫 Teacher Feedback</h3>
                    <p className="text-sm text-gray-600">Real-time communication & guidance</p>
                  </div>
                </div>

                {/* Performance Analysis */}
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-5 mb-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <span className="font-bold text-yellow-800">📊 Performance Analysis</span>
                    </div>
                    <p className="text-sm text-yellow-700 leading-relaxed">
                      {quizResults?.percentage >= 90 
                        ? "🌟 Outstanding performance! You've mastered this material and demonstrated excellent understanding."
                        : quizResults?.percentage >= 80 
                        ? "🎉 Excellent work! You've demonstrated a strong understanding of the material with just a few areas to review."
                        : quizResults?.percentage >= 70
                        ? "👍 Good effort! You're on the right track. Focus on reviewing the incorrect answers to strengthen your knowledge."
                        : quizResults?.percentage >= 60
                        ? "📚 Keep practicing! Review the incorrect answers and don't hesitate to ask questions about challenging concepts."
                        : "💪 Don't give up! Focus on the areas where you struggled. Consider reviewing the material and practicing similar questions."
                      }
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-bold text-blue-800">🎯 Recommended Next Steps</span>
                    </div>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        Review incorrect answers and understand the reasoning
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        Practice similar questions to reinforce learning
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        Ask questions about challenging concepts
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                        Prepare for upcoming quizzes and assignments
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Teacher Chat Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-gray-900">💬 Chat with Teacher</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Have questions about your quiz results? Chat directly with your teacher for personalized feedback and guidance.
                  </p>
                  <FeedbackChat
                    quizId={parseInt(id!)}
                    studentId={3}
                    currentUserId={3}
                    currentUserRole="student"
                    currentUserName="Student User"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted && !showResults) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/quizzes')}
                  className="mr-4 p-2 rounded-lg hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Already Completed</h2>
            <p className="text-gray-600 mb-6">You have already taken this quiz.</p>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowResults(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 mr-4"
              >
                View Results
              </button>
              <button
                onClick={() => navigate('/quizzes')}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
              >
                Back to Quizzes
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/quizzes')}
                  className="mr-4 p-2 rounded-lg hover:bg-gray-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quiz Instructions</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-700">Duration: {quiz.duration} minutes</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-700">Questions: {Array.isArray(questions) ? questions.length : 0}</span>
              </div>
              <div className="flex items-center">
                <Flag className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-700">Total Points: {Array.isArray(questions) ? questions.reduce((sum, q) => sum + (q.points || 0), 0) : 0}</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-yellow-800 mb-2">Important Notes:</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• You cannot pause or restart the quiz once started</li>
                <li>• The quiz will auto-submit when time runs out</li>
                <li>• Make sure you have a stable internet connection</li>
                <li>• Answer all questions before submitting</li>
              </ul>
            </div>

            <button
              onClick={startQuiz}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = Array.isArray(questions) && questions.length > 0 ? questions[currentQuestionIndex] : null;

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Questions Available</h2>
          <p className="text-gray-600 mb-4">This quiz doesn't have any questions yet.</p>
          <button
            onClick={() => navigate('/quizzes')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen quiz-taking-container">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/quizzes')}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg shadow-md">
                <Clock className="w-4 h-4 mr-2" />
                <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
              Question {currentQuestionIndex + 1} of {Array.isArray(questions) ? questions.length : 0}
            </span>
            <span className="text-sm font-semibold text-gray-700 bg-green-100 text-green-800 px-3 py-1 rounded-full">
              {Math.round(getProgressPercentage())}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div 
              className="quiz-progress-bar"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="quiz-question-card">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Question {currentQuestionIndex + 1}
              </h2>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                {currentQuestion.points} Point{currentQuestion.points !== 1 ? 's' : ''}
              </div>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">{currentQuestion.question_text}</p>
          </div>

          <div className="space-y-4 mb-8">
            {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <label key={index} className={`quiz-option flex items-center ${getCurrentAnswer(currentQuestion.id) === option ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name={`question_${currentQuestion.id}`}
                      value={option}
                      checked={getCurrentAnswer(currentQuestion.id) === option}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="mr-4 w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.question_type === 'true_false' && (
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 cursor-pointer transition-all duration-200 group">
                  <input
                    type="radio"
                    name={`question_${currentQuestion.id}`}
                    value="true"
                    checked={getCurrentAnswer(currentQuestion.id) === 'true'}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="mr-4 w-5 h-5 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-gray-700 font-medium group-hover:text-green-700">True</span>
                </label>
                <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 cursor-pointer transition-all duration-200 group">
                  <input
                    type="radio"
                    name={`question_${currentQuestion.id}`}
                    value="false"
                    checked={getCurrentAnswer(currentQuestion.id) === 'false'}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="mr-4 w-5 h-5 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-gray-700 font-medium group-hover:text-red-700">False</span>
                </label>
              </div>
            )}

            {currentQuestion.question_type === 'short_answer' && (
              <textarea
                value={getCurrentAnswer(currentQuestion.id)}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your answer here..."
              />
            )}
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-md"
            >
              ← Previous
            </button>

            <div className="flex space-x-3">
              {Array.isArray(questions) && currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center transition-all duration-200 font-semibold shadow-lg"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Quiz
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;
