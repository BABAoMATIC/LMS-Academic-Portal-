import React, { useState, useEffect } from 'react';
import { HelpCircle, Calendar, Clock, CheckCircle, AlertCircle, Play, Award, Eye, Trophy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import LiveQuizTaker from './LiveQuizTaker';

interface Quiz {
  id: number;
  title: string;
  description: string;
  deadline: string;
  duration: number;
  total_marks: number;
  teacher_name: string;
  status: 'available' | 'completed' | 'passed' | 'failed';
  attempt_id?: number;
  score?: number;
  completed_at?: string;
  created_at: string;
}

const QuizzesList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [submitting, setSubmitting] = useState(false);
  const [showQuizTaker, setShowQuizTaker] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`/api/quizzes?user_id=${user?.id}`);
      const data = await response.json();
      if (data.quizzes) {
        setQuizzes(data.quizzes);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizQuestions = async (quizId: number) => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}/questions`);
      const data = await response.json();
      if (data.questions) {
        setQuizQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
    }
  };

  const handleStartQuiz = async (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowQuizTaker(true);
  };

  const viewQuizResults = (quiz: Quiz) => {
    if (quiz.attempt_id) {
      // Navigate to quiz results
      window.open(`/quizzes/${quiz.id}/results/${quiz.attempt_id}`, '_blank');
    }
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz || !user?.id) return;

    setSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, answerText]) => ({
        question_id: parseInt(questionId),
        answer_text: answerText
      }));

      const response = await fetch('/api/quizzes/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: user.id,
          quiz_id: selectedQuiz.id,
          answers: answersArray
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Quiz submitted successfully:', result);
        
        // Refresh quizzes list
        await fetchQuizzes();
        setSelectedQuiz(null);
        setQuizQuestions([]);
        setAnswers({});
        
        // Show results
        alert(`Quiz completed! Score: ${result.score}/${result.total_marks} (${result.percentage.toFixed(1)}%) - ${result.status.toUpperCase()}`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Play className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // If showing quiz taker, render it instead of the list
  if (showQuizTaker && selectedQuiz) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setShowQuizTaker(false);
              setSelectedQuiz(null);
              fetchQuizzes(); // Refresh the list
            }}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            ← Back to Quizzes
          </button>
        </div>
        <LiveQuizTaker quizId={selectedQuiz.id} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quizzes</h3>
        <button
          onClick={fetchQuizzes}
          className="text-green-600 hover:text-green-800 text-sm"
        >
          Refresh
        </button>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No quizzes available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <HelpCircle className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quiz.status)}`}>
                      {quiz.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2">{quiz.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Due: {formatDate(quiz.deadline)}</span>
                      {isDeadlinePassed(quiz.deadline) && (
                        <span className="ml-2 text-red-500">(Overdue)</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{quiz.duration} minutes</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      <span>{quiz.total_marks} marks</span>
                    </div>
                    <div className="flex items-center">
                      <span>By: {quiz.teacher_name}</span>
                    </div>
                  </div>

                  {quiz.status === 'completed' && quiz.score !== undefined && (
                    <div className="mt-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Completed - Score: {quiz.score}/{quiz.total_marks}
                      {quiz.completed_at && ` on ${formatDate(quiz.completed_at)}`}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {getStatusIcon(quiz.status)}
                  
                  {quiz.status === 'available' && !isDeadlinePassed(quiz.deadline) && (
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Start Quiz
                    </button>
                  )}
                  
                  {(quiz.status === 'completed' || quiz.status === 'passed' || quiz.status === 'failed') && (
                    <button
                      onClick={() => viewQuizResults(quiz)}
                      className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Results
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz Modal */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{selectedQuiz.title}</h3>
              <button
                onClick={() => setSelectedQuiz(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center justify-between text-sm text-green-800">
                <span>Duration: {selectedQuiz.duration} minutes</span>
                <span>Total Marks: {selectedQuiz.total_marks}</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {quizQuestions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Question {index + 1} ({question.marks} marks)
                  </h4>
                  <p className="text-gray-700 mb-3">{question.question_text}</p>
                  
                  {question.type === 'multiple_choice' && question.options ? (
                    <div className="space-y-2">
                      {JSON.parse(question.options).map((option: string, optIndex: number) => (
                        <label key={optIndex} className="flex items-center">
                          <input
                            type="radio"
                            name={`question_${question.id}`}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={(e) => setAnswers({...answers, [question.id]: e.target.value})}
                            className="mr-2"
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={answers[question.id] || ''}
                      onChange={(e) => setAnswers({...answers, [question.id]: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter your answer..."
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedQuiz(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizzesList;
