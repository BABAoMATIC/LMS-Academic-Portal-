import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { Clock, CheckCircle, XCircle, RotateCcw, ArrowLeft } from 'lucide-react';

interface Question {
  id: number;
  question_text: string;
  type: 'multiple_choice' | 'short_answer';
  options?: string[];
  correct_answer?: string;
  hint?: string;
  marks: number;
  order: number;
}

interface Quiz {
  id: number;
  title: string;
  deadline: string;
  duration?: number;
  questions: Question[];
}

interface QuizAttempt {
  id: number;
  attempt_number: number;
  start_time: string;
  status: string;
}

const TakeQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (id) {
      fetchQuiz();
    }
  }, [id]);

  useEffect(() => {
    if (attempt && quiz?.duration) {
      // Calculate time left based on start time and duration
      const startTime = new Date(attempt.start_time);
      const endTime = new Date(startTime.getTime() + (quiz.duration * 60 * 1000));
      const now = new Date();
      
      if (now < endTime) {
        setTimeLeft(Math.floor((endTime.getTime() - now.getTime()) / 1000));
      } else {
        setTimeLeft(0);
        handleSubmitQuiz();
      }
    }
  }, [attempt, quiz]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && attempt?.status === 'in_progress') {
      handleSubmitQuiz();
    }
  }, [timeLeft]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock quiz data for demonstration
      const mockQuiz: Quiz = {
        id: parseInt(id || '1'),
        title: "React Fundamentals Quiz",
        deadline: "2024-12-31T23:59:59Z",
        duration: 30, // 30 minutes
        questions: [
          {
            id: 1,
            question_text: "What is JSX in React?",
            type: "multiple_choice",
            options: [
              "JavaScript XML",
              "JavaScript Extension",
              "Java Syntax Extension",
              "JavaScript Syntax"
            ],
            correct_answer: "JavaScript XML",
            hint: "Think about what JSX stands for - it's a syntax extension that allows you to write HTML-like code in JavaScript.",
            marks: 2,
            order: 1
          },
          {
            id: 2,
            question_text: "Which hook is used to manage state in functional components?",
            type: "multiple_choice",
            options: [
              "useEffect",
              "useState",
              "useContext",
              "useReducer"
            ],
            correct_answer: "useState",
            hint: "This hook allows you to add state to functional components. It returns an array with the current state value and a function to update it.",
            marks: 2,
            order: 2
          },
          {
            id: 3,
            question_text: "What is the purpose of useEffect hook?",
            type: "multiple_choice",
            options: [
              "To manage component state",
              "To perform side effects",
              "To handle events",
              "To create components"
            ],
            correct_answer: "To perform side effects",
            hint: "This hook is used for side effects like data fetching, subscriptions, or manually changing the DOM. It's similar to componentDidMount and componentDidUpdate combined.",
            marks: 3,
            order: 3
          },
          {
            id: 4,
            question_text: "Explain the difference between props and state in React.",
            type: "short_answer",
            correct_answer: "Props are passed down from parent components and are immutable, while state is internal to a component and can be changed using setState or useState.",
            hint: "Think about data flow: props come from outside (parent to child), while state is managed internally within a component. Props are read-only, state can be updated.",
            marks: 5,
            order: 4
          },
          {
            id: 5,
            question_text: "What is the virtual DOM?",
            type: "multiple_choice",
            options: [
              "A real DOM element",
              "A JavaScript representation of the DOM",
              "A CSS framework",
              "A database"
            ],
            correct_answer: "A JavaScript representation of the DOM",
            marks: 3,
            order: 5
          }
        ]
      };
      
      setQuiz(mockQuiz);
      
      // Check if there's an active attempt
      await checkActiveAttempt();
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setError('Failed to fetch quiz');
    } finally {
      setLoading(false);
    }
  };

  const checkActiveAttempt = async () => {
    try {
      // Mock attempt data
      const mockAttempt: QuizAttempt = {
        id: 1,
        attempt_number: 1,
        start_time: new Date().toISOString(),
        status: 'in_progress'
      };
      
      setAttempt(mockAttempt);
    } catch (error) {
      console.error('Error checking attempts:', error);
    }
  };

  const startNewAttempt = async () => {
    try {
      // Mock new attempt
      const mockAttempt: QuizAttempt = {
        id: 1,
        attempt_number: 1,
        start_time: new Date().toISOString(),
        status: 'in_progress'
      };
      
      setAttempt(mockAttempt);
    } catch (error) {
      console.error('Error starting attempt:', error);
      setError('Failed to start quiz attempt');
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const toggleHint = (questionId: number) => {
    setShowHint(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      
      // Calculate score
      let totalMarks = 0;
      let earnedMarks = 0;
      const results: any[] = [];
      
      quiz?.questions.forEach(question => {
        totalMarks += question.marks;
        const userAnswer = answers[question.id] || '';
        const isCorrect = userAnswer.toLowerCase().trim() === question.correct_answer?.toLowerCase().trim();
        
        if (isCorrect) {
          earnedMarks += question.marks;
        }
        
        results.push({
          question_id: question.id,
          question_text: question.question_text,
          user_answer: userAnswer,
          correct_answer: question.correct_answer,
          is_correct: isCorrect,
          marks: question.marks,
          earned_marks: isCorrect ? question.marks : 0
        });
      });
      
      const percentage = totalMarks > 0 ? (earnedMarks / totalMarks) * 100 : 0;
      const passed = percentage >= 60; // 60% passing grade
      
      // Store results in localStorage for the results page
      const quizResults = {
        quiz_id: quiz?.id,
        quiz_title: quiz?.title,
        total_marks: totalMarks,
        earned_marks: earnedMarks,
        percentage: percentage,
        passed: passed,
        results: results,
        submitted_at: new Date().toISOString(),
        teacher_feedback: null, // Will be added by teacher later
        teacher_name: null,
        feedback_date: null
      };
      
      localStorage.setItem('quizResults', JSON.stringify(quizResults));
      
      console.log('✅ Quiz submitted successfully');
      
      // Show success message with immediate results
      const correctCount = results.filter(r => r.is_correct).length;
      const totalCount = results.length;
      const scorePercentage = percentage.toFixed(1);
      
      alert(`🎉 Quiz Submitted Successfully!\n\n📊 Your Results:\n• Score: ${earnedMarks}/${totalMarks} marks\n• Percentage: ${scorePercentage}%\n• Correct Answers: ${correctCount}/${totalCount} questions\n• Status: ${passed ? 'PASSED ✅' : 'FAILED ❌'}\n\nRedirecting to detailed results...`);
      
      // Navigate to results page
      navigate(`/quiz/${id}/results`);
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="text-center">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Error</h2>
          <p className="error-message">{error}</p>
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

  if (!quiz || !attempt) {
    return (
      <div className="error-container">
        <div className="text-center">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Quiz Not Found</h2>
          <p className="error-message">The quiz you're looking for doesn't exist or you don't have access to it.</p>
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

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/quizzes')}
              className="feedback-button feedback-button-secondary"
            >
              <ArrowLeft className="feedback-button-icon" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600">Attempt #{attempt.attempt_number}</p>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            <Clock className="w-5 h-5" />
            <span className="font-semibold text-lg">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
          <span className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>{Math.round(progress)}% Complete</span>
          <span>{currentQ.marks} mark{currentQ.marks !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Question {currentQuestion + 1}</h2>
          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
            {currentQ.marks} mark{currentQ.marks !== 1 ? 's' : ''}
          </div>
        </div>
        
        <div className="mb-8">
          <p className="text-lg text-gray-700 leading-relaxed">{currentQ.question_text}</p>
          
          {/* Hint Section */}
          {currentQ.hint && (
            <div className="mt-4">
              <button
                onClick={() => toggleHint(currentQ.id)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <span className="text-lg">💡</span>
                {showHint[currentQ.id] ? 'Hide Hint' : 'Show Hint'}
              </button>
              
              {showHint[currentQ.id] && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-blue-500 text-lg">💡</span>
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-1">Hint:</h4>
                      <p className="text-blue-700 text-sm leading-relaxed">{currentQ.hint}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="answer-container">
          {currentQ.type === 'multiple_choice' && currentQ.options ? (
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <label key={index} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name={`question_${currentQ.id}`}
                    value={option}
                    checked={answers[currentQ.id] === option}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
              placeholder="Enter your answer here..."
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={6}
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
            className="feedback-button feedback-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="flex gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                  index === currentQuestion 
                    ? 'bg-blue-500 text-white' 
                    : answers[quiz.questions[index].id] 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className={`feedback-button feedback-button-success ${submitting ? 'feedback-button-loading' : ''}`}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="feedback-button feedback-button-primary"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;