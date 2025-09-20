import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import '../components/TeacherDashboard.css';

interface QuizQuestion {
  id: number;
  question_text: string;
  type: string;
  options: string[];
  correct_answer: string;
  marks: number;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  time_limit: number;
  questions: QuizQuestion[];
}

interface QuizTakingProps {
  quizId: number;
  onComplete: (score: number) => void;
  onCancel: () => void;
}

const QuizTaking: React.FC<QuizTakingProps> = ({ quizId, onComplete, onCancel }) => {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (quiz && timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft, quiz]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      
      // Fetch quiz details
      const quizResponse = await axios.get(`/api/quizzes/${quizId}`);
      const quizData = quizResponse.data.quiz;
      
      // Fetch quiz questions
      const questionsResponse = await axios.get(`/api/quizzes/${quizId}/questions`);
      const questions = questionsResponse.data.questions || [];
      
      setQuiz({
        ...quizData,
        questions: questions.map((q: any) => ({
          ...q,
          options: JSON.parse(q.options || '[]')
        }))
      });
      
      // Set timer (30 minutes default)
      setTimeLeft(quizData.time_limit || 30);
      
    } catch (error) {
      console.error('Error fetching quiz:', error);
      // Set fallback quiz data
      setQuiz({
        id: quizId,
        title: "Sample Quiz",
        description: "Test your knowledge",
        time_limit: 30,
        questions: [
          {
            id: 1,
            question_text: "What is 2 + 2?",
            type: "multiple_choice",
            options: ["3", "4", "5", "6"],
            correct_answer: "4",
            marks: 1
          }
        ]
      });
      setTimeLeft(30);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers({
      ...answers,
      [quiz?.questions[currentQuestion]?.id || 0]: answer
    });
  };

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;
    
    try {
      setSubmitting(true);
      
      // Calculate score
      let totalMarks = 0;
      let earnedMarks = 0;
      
      quiz.questions.forEach(question => {
        totalMarks += question.marks;
        const userAnswer = answers[question.id];
        if (userAnswer === question.correct_answer) {
          earnedMarks += question.marks;
        }
      });
      
      const score = totalMarks > 0 ? (earnedMarks / totalMarks) * 100 : 0;
      
      // Submit quiz attempt
      await axios.post('/api/quiz-attempts', {
        student_id: user.id,
        quiz_id: quizId,
        score: score,
        answers: answers
      });
      
      onComplete(score);
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      // Still show score even if submission fails
      const totalMarks = quiz.questions.reduce((sum, q) => sum + q.marks, 0);
      const earnedMarks = quiz.questions.reduce((sum, q) => {
        const userAnswer = answers[q.id];
        return sum + (userAnswer === q.correct_answer ? q.marks : 0);
      }, 0);
      const score = totalMarks > 0 ? (earnedMarks / totalMarks) * 100 : 0;
      onComplete(score);
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
      <div className="professional-card">
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-600">Loading quiz...</span>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="professional-card">
        <div className="text-center py-12">
          <p className="text-red-600">Error loading quiz</p>
          <button onClick={onCancel} className="btn-secondary mt-4">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="professional-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {quiz.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {quiz.description}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
              {formatTime(timeLeft)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Time Remaining</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="professional-card">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {currentQ.question_text}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {currentQ.marks} mark{currentQ.marks !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Answer Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                answers[currentQ.id] === option
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <input
                type="radio"
                name={`question_${currentQ.id}`}
                value={option}
                checked={answers[currentQ.id] === option}
                onChange={() => handleAnswerSelect(option)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                answers[currentQ.id] === option
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {answers[currentQ.id] === option && (
                  <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                )}
              </div>
              <span className="text-gray-900 dark:text-white">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        <div className="flex space-x-3">
          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-success"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn-primary"
            >
              Next →
            </button>
          )}
        </div>
      </div>

      {/* Cancel Button */}
      <div className="text-center">
        <button
          onClick={onCancel}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 underline"
        >
          Cancel Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizTaking;
