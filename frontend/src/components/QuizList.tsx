import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import QuizTaking from './QuizTaking';
import QuizResults from './QuizResults';
import '../components/TeacherDashboard.css';

interface Quiz {
  id: number;
  title: string;
  description: string;
  due_date: string;
  time_limit: number;
  module_name?: string;
}

interface QuizListProps {
  onBack?: () => void;
}

const QuizList: React.FC<QuizListProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/quizzes');
      setQuizzes(response.data.quizzes || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      // Fallback data
      setQuizzes([
        {
          id: 68,
          title: "Mathematics Fundamentals Quiz",
          description: "Test your knowledge of basic mathematics concepts",
          due_date: "2024-12-31T23:59:59",
          time_limit: 30,
          module_name: "Mathematics"
        },
        {
          id: 69,
          title: "Science Knowledge Quiz", 
          description: "Test your understanding of basic science concepts",
          due_date: "2024-12-31T23:59:59",
          time_limit: 30,
          module_name: "Science"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setShowResults(false);
  };

  const handleQuizComplete = (score: number) => {
    setFinalScore(score);
    setTotalQuestions(selectedQuiz ? 5 : 0); // Assuming 5 questions per quiz
    setCorrectAnswers(Math.round((score / 100) * (selectedQuiz ? 5 : 0)));
    
    // Store results in localStorage for the QuizResults component
    const quizResults = {
      quiz_id: selectedQuiz?.id || 1,
      quiz_title: selectedQuiz?.title || 'Quiz',
      total_marks: selectedQuiz ? 15 : 0, // Assuming 15 total marks
      earned_marks: Math.round((score / 100) * (selectedQuiz ? 15 : 0)),
      percentage: score,
      passed: score >= 60,
      results: [], // Empty for now, could be populated with actual question results
      submitted_at: new Date().toISOString()
    };
    
    localStorage.setItem('quizResults', JSON.stringify(quizResults));
    setShowResults(true);
  };

  const handleRetakeQuiz = () => {
    setShowResults(false);
    setSelectedQuiz(null);
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setSelectedQuiz(null);
  };

  const handleCancelQuiz = () => {
    setSelectedQuiz(null);
    setShowResults(false);
  };

  if (showResults) {
    return <QuizResults />;
  }

  if (selectedQuiz) {
    return (
      <QuizTaking
        quizId={selectedQuiz.id}
        onComplete={handleQuizComplete}
        onCancel={handleCancelQuiz}
      />
    );
  }

  if (loading) {
    return (
      <div className="professional-card">
        <div className="flex items-center justify-center py-12">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-600">Loading quizzes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="professional-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Available Quizzes
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Test your knowledge with these interactive quizzes
            </p>
          </div>
          {onBack && (
            <button onClick={onBack} className="btn-secondary">
              ← Back
            </button>
          )}
        </div>
      </div>

      {/* Quiz List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="professional-card">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {quiz.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {quiz.description}
              </p>
              
              {quiz.module_name && (
                <div className="mb-3">
                  <span className="status-badge completed">
                    {quiz.module_name}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Time Limit:</span>
                <span className="text-gray-900 dark:text-white">{quiz.time_limit} minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                <span className="text-gray-900 dark:text-white">
                  {new Date(quiz.due_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleStartQuiz(quiz)}
              className="btn-primary w-full"
            >
              Start Quiz
            </button>
          </div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="professional-card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No quizzes available at the moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizList;
