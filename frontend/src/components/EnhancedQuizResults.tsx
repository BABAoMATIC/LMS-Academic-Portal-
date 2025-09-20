import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award,
  Zap,
  Sparkles,
  Crown,
  Medal,
  Gift,
  Heart,
  ThumbsUp
} from 'lucide-react';
import '../styles/enhanced-styles.css';

interface QuizResult {
  id: number;
  quiz_id: number;
  student_id: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  percentage: number;
  time_taken: number;
  completed_at: string;
  feedback?: string;
}

interface QuestionResult {
  id: number;
  question: string;
  correct_answer: string;
  student_answer: string;
  is_correct: boolean;
  explanation?: string;
}

interface EnhancedQuizResultsProps {
  result: QuizResult;
  questions: QuestionResult[];
  onRetake?: () => void;
  onViewDetails?: () => void;
}

const EnhancedQuizResults: React.FC<EnhancedQuizResultsProps> = ({
  result,
  questions,
  onRetake,
  onViewDetails
}) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    // Trigger animations on mount
    setShowAnimation(true);
    
    // Animate score counter
    const timer = setTimeout(() => {
      animateScore();
    }, 500);

    // Trigger celebration for high scores
    if (result.percentage >= 90) {
      setTimeout(() => setCelebrating(true), 1500);
    }

    return () => clearTimeout(timer);
  }, []);

  const animateScore = () => {
    const duration = 2000;
    const steps = 60;
    const increment = result.score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= result.score) {
        setCurrentScore(result.score);
        clearInterval(timer);
      } else {
        setCurrentScore(Math.floor(current));
      }
    }, duration / steps);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 95) return <Crown className="w-8 h-8" />;
    if (percentage >= 90) return <Trophy className="w-8 h-8" />;
    if (percentage >= 80) return <Medal className="w-8 h-8" />;
    if (percentage >= 70) return <Award className="w-8 h-8" />;
    return <Target className="w-8 h-8" />;
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 95) return "Outstanding! You're a quiz master! 🏆";
    if (percentage >= 90) return "Excellent work! You've mastered this topic! 🌟";
    if (percentage >= 80) return "Great job! You have a solid understanding! 👍";
    if (percentage >= 70) return "Good work! Keep practicing to improve! 📚";
    return "Keep studying! You'll get there! 💪";
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Celebration Animation */}
      {celebrating && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-1/4 left-1/4 animate-bounce">
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="absolute top-1/3 right-1/4 animate-bounce delay-300">
            <Star className="w-6 h-6 text-blue-500" />
          </div>
          <div className="absolute bottom-1/3 left-1/3 animate-bounce delay-500">
            <Heart className="w-7 h-7 text-red-500" />
          </div>
          <div className="absolute bottom-1/4 right-1/3 animate-bounce delay-700">
            <Gift className="w-6 h-6 text-green-500" />
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce delay-1000">
            <Trophy className="w-12 h-12 text-yellow-600" />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="enhanced-container py-12">
        {/* Results Header */}
        <div className={`text-center mb-12 ${showAnimation ? 'animate-fade-in-down' : ''}`}>
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-full shadow-2xl mb-6 animate-bounce-in">
            {getScoreIcon(result.percentage)}
          </div>
          <h1 className="enhanced-heading enhanced-heading--h1 mb-4">
            Quiz Complete! 🎉
          </h1>
          <p className="enhanced-text enhanced-text--large">
            {getScoreMessage(result.percentage)}
          </p>
        </div>

        {/* Score Display */}
        <div className={`enhanced-card text-center mb-8 ${showAnimation ? 'animate-fade-in-up' : ''}`}>
          <div className="relative">
            {/* Animated Score Circle */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.percentage / 100)}`}
                  className={`transition-all duration-2000 ease-out ${getScoreColor(result.percentage)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(result.percentage)}`}>
                    {result.percentage}%
                  </div>
                  <div className="enhanced-text enhanced-text--small">
                    {currentScore}/{result.total_questions}
                  </div>
                </div>
              </div>
            </div>

            {/* Score Details */}
            <div className="enhanced-grid enhanced-grid--3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {result.correct_answers}
                </div>
                <div className="enhanced-text enhanced-text--small">
                  Correct Answers
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {result.total_questions - result.correct_answers}
                </div>
                <div className="enhanced-text enhanced-text--small">
                  Incorrect Answers
                </div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatTime(result.time_taken)}
                </div>
                <div className="enhanced-text enhanced-text--small">
                  Time Taken
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`enhanced-flex enhanced-flex--center gap-6 mb-8 ${showAnimation ? 'animate-fade-in-up' : ''}`}>
          <button
            onClick={onRetake}
            className="enhanced-btn enhanced-btn--primary"
          >
            <Zap className="w-5 h-5 mr-2" />
            Retake Quiz
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="enhanced-btn enhanced-btn--secondary"
          >
            <Target className="w-5 h-5 mr-2" />
            {showDetails ? 'Hide' : 'View'} Details
          </button>
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="enhanced-btn enhanced-btn--outline"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              View Progress
            </button>
          )}
        </div>

        {/* Detailed Results */}
        {showDetails && (
          <div className={`enhanced-card ${showAnimation ? 'animate-fade-in-up' : ''}`}>
            <h2 className="enhanced-heading enhanced-heading--h3 mb-6">Question Breakdown</h2>
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                    question.is_correct
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="enhanced-flex enhanced-flex--between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      Question {index + 1}
                    </h3>
                    <div className={`flex items-center gap-2 ${
                      question.is_correct ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {question.is_correct ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                      <span className="font-medium">
                        {question.is_correct ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                  </div>
                  <p className="enhanced-text mb-3">{question.question}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Your Answer:</h4>
                      <p className={`p-2 rounded ${
                        question.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {question.student_answer}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Correct Answer:</h4>
                      <p className="p-2 rounded bg-blue-100 text-blue-800">
                        {question.correct_answer}
                      </p>
                    </div>
                  </div>
                  {question.explanation && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-1">Explanation:</h4>
                      <p className="text-blue-800 text-sm">{question.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback Section */}
        {result.feedback && (
          <div className={`enhanced-card ${showAnimation ? 'animate-fade-in-up' : ''}`}>
            <h2 className="enhanced-heading enhanced-heading--h3 mb-4">Teacher Feedback</h2>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="enhanced-text">{result.feedback}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedQuizResults;
