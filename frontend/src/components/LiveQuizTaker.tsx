import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Send, AlertCircle, Trophy, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Question {
  id: number;
  question_text: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: string[];
  correct_answer: string;
  marks: number;
  order_index: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  deadline: string;
  duration: number;
  total_marks: number;
  teacher_name: string;
}

interface QuizResult {
  attempt_id: number;
  score: number;
  total_marks: number;
  percentage: number;
  status: 'pass' | 'fail';
  correct_answers: number;
  total_questions: number;
  question_feedback: Array<{
    question_id: number;
    question_text: string;
    student_answer: string;
    correct_answer: string;
    is_correct: boolean;
    marks_obtained: number;
    total_marks: number;
    feedback: string;
  }>;
}

const LiveQuizTaker: React.FC<{ quizId: number }> = ({ quizId }) => {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchQuizDetails();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmitQuiz();
    }
  }, [timeLeft, isSubmitted]);

  const fetchQuizDetails = async () => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`);
      const data = await response.json();
      
      if (data.quiz) {
        setQuiz(data.quiz);
        setQuestions(data.questions);
        
        // Calculate time left
        const deadline = new Date(data.quiz.deadline);
        const now = new Date();
        const timeDiff = deadline.getTime() - now.getTime();
        
        if (timeDiff > 0) {
          // Use quiz duration or time until deadline, whichever is smaller
          const durationMs = data.quiz.duration * 60 * 1000; // Convert minutes to milliseconds
          setTimeLeft(Math.min(durationMs / 1000, timeDiff / 1000));
        } else {
          setError('Quiz deadline has passed');
        }
      }
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitQuiz = async () => {
    if (isSubmitting || isSubmitted) return;
    
    setIsSubmitting(true);
    
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
          student_id: user?.id,
          quiz_id: quizId,
          answers: answersArray
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        setIsSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return <BookOpen className="w-5 h-5" />;
      case 'true_false':
        return <CheckCircle className="w-5 h-5" />;
      case 'short_answer':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Quiz Found</h3>
        <p className="text-gray-600">The quiz you're looking for doesn't exist or has no questions.</p>
      </div>
    );
  }

  if (isSubmitted && result) {
    return (
      <div className="space-y-6">
        {/* Results Header */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
              Quiz Results: {quiz.title}
            </h2>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${
              result.status === 'pass' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {result.status.toUpperCase()}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{result.score}</div>
              <div className="text-sm text-blue-600">Score</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{result.percentage.toFixed(1)}%</div>
              <div className="text-sm text-green-600">Percentage</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{result.correct_answers}</div>
              <div className="text-sm text-purple-600">Correct</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{result.total_questions}</div>
              <div className="text-sm text-orange-600">Total Questions</div>
            </div>
          </div>
        </div>

        {/* Question-by-Question Feedback */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Feedback</h3>
          <div className="space-y-4">
            {result.question_feedback.map((feedback, index) => (
              <div key={feedback.question_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    Question {index + 1}: {feedback.question_text}
                  </h4>
                  <div className="flex items-center">
                    {feedback.is_correct ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="ml-2 text-sm text-gray-600">
                      {feedback.marks_obtained}/{feedback.total_marks} marks
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Your Answer:</span>
                    <p className="text-gray-600 mt-1">{feedback.student_answer}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Correct Answer:</span>
                    <p className="text-gray-600 mt-1">{feedback.correct_answer}</p>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Feedback:</span>
                  <p className="text-gray-600 mt-1">{feedback.feedback}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600 mt-1">{quiz.description}</p>
            <p className="text-sm text-gray-500 mt-2">
              Created by: {quiz.teacher_name} • Total Marks: {quiz.total_marks}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-lg font-semibold text-blue-600 mb-2">
              <Clock className="w-5 h-5 mr-2" />
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-gray-500">Time Remaining</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Question {currentQuestion + 1} of {questions.length}
        </p>
      </div>

      {/* Current Question */}
      {questions[currentQuestion] && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            {getQuestionTypeIcon(questions[currentQuestion].type)}
            <span className="ml-2 text-sm font-medium text-gray-600 capitalize">
              {questions[currentQuestion].type.replace('_', ' ')}
            </span>
            <span className="ml-auto text-sm text-gray-500">
              {questions[currentQuestion].marks} marks
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {questions[currentQuestion].question_text}
          </h3>
          
          <div className="space-y-3">
            {questions[currentQuestion].type === 'multiple_choice' && (
              questions[currentQuestion].options.map((option, index) => (
                <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name={`question_${questions[currentQuestion].id}`}
                    value={option}
                    checked={answers[questions[currentQuestion].id] === option}
                    onChange={(e) => handleAnswerChange(questions[currentQuestion].id, e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))
            )}
            
            {questions[currentQuestion].type === 'true_false' && (
              questions[currentQuestion].options.map((option, index) => (
                <label key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name={`question_${questions[currentQuestion].id}`}
                    value={option}
                    checked={answers[questions[currentQuestion].id] === option}
                    onChange={(e) => handleAnswerChange(questions[currentQuestion].id, e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))
            )}
            
            {questions[currentQuestion].type === 'short_answer' && (
              <textarea
                value={answers[questions[currentQuestion].id] || ''}
                onChange={(e) => handleAnswerChange(questions[currentQuestion].id, e.target.value)}
                placeholder="Enter your answer here..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex space-x-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium ${
                  index === currentQuestion
                    ? 'bg-blue-600 text-white'
                    : answers[questions[index].id]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting || Object.keys(answers).length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Quiz
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              disabled={currentQuestion === questions.length - 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveQuizTaker;
