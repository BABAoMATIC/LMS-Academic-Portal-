import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award, 
  RotateCcw, 
  ArrowLeft,
  BookOpen,
  TrendingUp,
  Target,
  MessageCircle,
  Star,
  User
} from 'lucide-react';
import './EnhancedQuizResults.css';

interface QuizResult {
  question_id: number;
  question_text: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  marks: number;
  earned_marks: number;
}

interface QuizResultsData {
  quiz_id: number;
  quiz_title: string;
  total_marks: number;
  earned_marks: number;
  percentage: number;
  passed: boolean;
  results: QuizResult[];
  submitted_at: string;
  teacher_feedback?: string;
  teacher_name?: string;
  feedback_date?: string;
}

const QuizResults: React.FC = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<QuizResultsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get results from localStorage
    const storedResults = localStorage.getItem('quizResults');
    if (storedResults) {
      const parsedResults = JSON.parse(storedResults);
      
      // Add mock teacher feedback for demonstration
      if (!parsedResults.teacher_feedback && parsedResults.quiz_id === 1) {
        parsedResults.teacher_feedback = "Great work on this quiz! You demonstrated a solid understanding of React fundamentals. Your answers to the JSX and useState questions were particularly well-explained. Keep up the excellent work!";
        parsedResults.teacher_name = "Dr. Sarah Johnson";
        parsedResults.feedback_date = new Date().toISOString();
      }
      
      setResults(parsedResults);
    }
    setLoading(false);
  }, []);

  const handleRetakeQuiz = () => {
    if (results) {
      // Clear previous results
      localStorage.removeItem('quizResults');
      // Navigate back to quiz
      navigate(`/quiz/${results.quiz_id}/take`);
    }
  };

  const handleBackToQuizzes = () => {
    localStorage.removeItem('quizResults');
    navigate('/quizzes');
  };

  const handleMessageTeacher = () => {
    const questionText = `Hi! I have a question about my quiz results for "${results?.quiz_title}". Could you please help me?`;
    localStorage.setItem('pendingQuestion', questionText);
    localStorage.setItem('pendingQuestionContext', JSON.stringify({
      type: 'quiz',
      quizId: results?.quiz_id,
      quizTitle: results?.quiz_title,
      score: results?.percentage
    }));
    navigate('/messages');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Quiz Results Found</h2>
          <p className="text-gray-600 mb-6">It looks like you haven't completed any quizzes yet.</p>
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

  const correctAnswers = results.results.filter(r => r.is_correct).length;
  const totalQuestions = results.results.length;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Quiz Results</h1>
            <p className="text-xl text-gray-600">{results.quiz_title}</p>
            <p className="text-sm text-gray-500 mt-2">
              Submitted on {new Date(results.submitted_at).toLocaleDateString()} at {new Date(results.submitted_at).toLocaleTimeString()}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-6xl font-bold ${results.passed ? 'text-green-600' : 'text-red-600'}`}>
              {results.percentage.toFixed(1)}%
            </div>
            <div className={`text-lg font-semibold ${results.passed ? 'text-green-700' : 'text-red-700'}`}>
              {results.passed ? 'PASSED' : 'FAILED'}
            </div>
          </div>
        </div>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{results.earned_marks}/{results.total_marks}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Score</h3>
          <p className="text-sm text-gray-600">Marks obtained</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-green-600">{correctAnswers}/{totalQuestions}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Correct Answers</h3>
          <p className="text-sm text-gray-600">Questions answered correctly</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-red-600">{totalQuestions - correctAnswers}/{totalQuestions}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Incorrect Answers</h3>
          <p className="text-sm text-gray-600">Questions answered incorrectly</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{results.percentage.toFixed(1)}%</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Percentage</h3>
          <p className="text-sm text-gray-600">Overall performance</p>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {((correctAnswers / totalQuestions) * 100).toFixed(1)}%
            </div>
            <p className="text-gray-600">Question Accuracy</p>
            <p className="text-sm text-gray-500">{correctAnswers} out of {totalQuestions} questions correct</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {results.passed ? 'PASSED' : 'FAILED'}
            </div>
            <p className="text-gray-600">Quiz Status</p>
            <p className="text-sm text-gray-500">
              {results.passed ? 'Congratulations! You passed the quiz.' : 'You need to score 60% or higher to pass.'}
            </p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {results.percentage >= 90 ? 'A+' :
               results.percentage >= 80 ? 'A' :
               results.percentage >= 70 ? 'B' :
               results.percentage >= 60 ? 'C' : 'F'}
            </div>
            <p className="text-gray-600">Grade</p>
            <p className="text-sm text-gray-500">Based on percentage score</p>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Question Review</h2>
          <p className="text-gray-600">Review your answers and see the correct solutions</p>
        </div>
        
        <div className="p-6 space-y-6">
          {results.results.map((result, index) => (
            <div key={result.question_id} className={`border rounded-lg p-6 ${
              result.is_correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      result.is_correct ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {result.question_text}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Total Marks:</span>
                      <span className="text-sm font-bold text-gray-900">{result.marks}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Earned:</span>
                      <span className={`text-sm font-bold ${
                        result.is_correct ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.earned_marks}/{result.marks}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`text-sm font-bold ${
                        result.is_correct ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.is_correct ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  {result.is_correct ? (
                    <div className="flex items-center gap-2 text-green-600 bg-green-100 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">✓ Correct</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 bg-red-100 px-3 py-2 rounded-lg">
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">✗ Incorrect</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`rounded-lg p-4 ${
                  result.is_correct ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
                }`}>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      result.is_correct ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    Your Answer:
                  </h4>
                  <p className={`font-medium ${
                    result.is_correct ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.user_answer || 'No answer provided'}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    Correct Answer:
                  </h4>
                  <p className="text-blue-800 font-medium">{result.correct_answer}</p>
                </div>
              </div>
              
              {!result.is_correct && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Tip:</strong> Review the correct answer and understand why your answer was incorrect. 
                    This will help you improve for future quizzes.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Teacher Feedback Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
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
          {results.teacher_feedback ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {results.teacher_name || 'Your Teacher'}
                      </span>
                      {results.feedback_date && (
                        <span className="text-sm text-gray-500">
                          • {new Date(results.feedback_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed">{results.teacher_feedback}</p>
              </div>
            </div>
          </div>

              <div className="flex justify-center">
                <button
                  onClick={handleMessageTeacher}
                  className="feedback-button feedback-button-info"
                >
                  <MessageCircle className="feedback-button-icon" />
                  Ask Teacher a Question
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Feedback Yet</h3>
              <p className="text-gray-600 mb-4">
                Your teacher hasn't provided feedback yet. You can still ask questions about your quiz results.
              </p>
              <button
                onClick={handleMessageTeacher}
                className="feedback-button feedback-button-primary"
              >
                <MessageCircle className="feedback-button-icon" />
                Message Teacher
              </button>
            </div>
          )}
        </div>
          </div>

          {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleBackToQuizzes}
          className="feedback-button feedback-button-primary"
        >
          <ArrowLeft className="feedback-button-icon" />
          Back to Quizzes
        </button>
        
        {!results.passed && (
            <button
            onClick={handleRetakeQuiz}
            className="feedback-button feedback-button-warning"
            >
            <RotateCcw className="feedback-button-icon" />
              Retake Quiz
            </button>
        )}
        
            <button
          onClick={() => window.print()}
          className="feedback-button feedback-button-info"
            >
          <BookOpen className="feedback-button-icon" />
          Print Results
            </button>
      </div>
    </div>
  );
};

export default QuizResults;