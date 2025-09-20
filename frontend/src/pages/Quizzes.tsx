import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import statusService, { QuizStatus } from '../services/statusService';
import useRealTimeSync from '../hooks/useRealTimeSync';
import LoadingSpinner from '../components/LoadingSpinner';
import { BookOpen, Clock, Calendar, CheckCircle, Play, Eye, RotateCcw } from 'lucide-react';
import { Quiz } from '../types';

const Quizzes: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'not_attempted' | 'attempted' | 'graded'>('all');

  // Real-time sync for quizzes
  useRealTimeSync({
    userId: user?.id,
    onQuizUpdate: (data: any) => {
      console.log('🔄 Quiz update received:', data);
      if (data.data.quiz_id) {
        updateQuizStatus(
          data.data.quiz_id, 
          data.data.status, 
          data.data.marks_obtained, 
          data.data.total_marks, 
          data.data.percentage
        );
      }
    },
    onDashboardRefresh: (data: any) => {
      if (data.type === 'quizzes' || !data.type) {
        console.log('🔄 Refreshing quizzes...');
        fetchQuizzes();
      }
    }
  });

  useEffect(() => {
    fetchQuizzes();
    
    // Subscribe to real-time status updates
    const unsubscribeQuizStatus = statusService.on('quiz_status_update', (data: any) => {
      if (data.student_id === user?.id) {
        updateQuizStatus(data.quiz_id!, data.status, data.marks_obtained, data.total_marks, data.percentage);
      }
    });

    const unsubscribeQuizGraded = statusService.on('quiz_graded', (data: any) => {
      if (data.student_id === user?.id) {
        updateQuizStatus(data.quiz_id!, 'graded', data.marks_obtained, data.total_marks, data.percentage);
      }
    });

    const unsubscribeQuizCompleted = statusService.on('quiz_completed', (data: any) => {
      if (data.student_id === user?.id) {
        updateQuizStatus(data.quiz_id!, 'completed', data.marks_obtained, data.total_marks, data.percentage);
        // Show success notification
        console.log('🎉 Quiz completed successfully!', data);
      }
    });

    return () => {
      unsubscribeQuizStatus();
      unsubscribeQuizGraded();
      unsubscribeQuizCompleted();
    };
  }, [user?.id]);

  const updateQuizStatus = (quizId: number, status: string, marksObtained?: number, totalMarks?: number, percentage?: number) => {
    setQuizzes(prev => prev.map(quiz => 
      quiz.id === quizId 
        ? { 
            ...quiz, 
            status: status as any,
            marks_obtained: marksObtained,
            total_marks: totalMarks,
            percentage: percentage
          }
        : quiz
    ));
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch quizzes with status from API
      if (user?.id) {
        const response = await apiService.get(`/student/${user.id}/quiz-status`);
        const fetchedQuizzes: Quiz[] = response.data.quizzes || [];
        setQuizzes(fetchedQuizzes);
      } else {
        setQuizzes([]);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError('Failed to load quizzes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'attempted':
        return 'Attempted';
      case 'graded':
        return 'Graded';
      case 'in_progress':
        return 'In Progress';
      default:
        return 'Not Attempted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'graded':
        return 'text-blue-600 bg-blue-100';
      case 'attempted':
        return 'text-yellow-600 bg-yellow-100';
      case 'in_progress':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    if (filter === 'all') return true;
    return quiz.status === filter;
  });

  const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
  };

  const handleStartQuiz = (quizId: number) => {
    // Navigate to quiz taking page
    navigate(`/quiz/${quizId}/take`);
  };

  const handleRetakeQuiz = async (quizId: number) => {
    try {
      const response = await fetch(`/api/quiz/${quizId}/retake`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Quiz retake started successfully');
        
        // Navigate to quiz taking page
        window.location.href = `/take-quiz/${quizId}`;
      } else {
        const error = await response.json();
        alert(`Error retaking quiz: ${error.error}`);
      }
    } catch (error) {
      console.error('Error retaking quiz:', error);
      alert('Error retaking quiz');
    }
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
          <h2 className="error-title">Oops! Something went wrong</h2>
          <p className="error-message">{error}</p>
          <button
            onClick={fetchQuizzes}
            className="action-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quizzes-page">
      {/* Header */}
      <div className="quizzes-header">
        <h1 className="welcome-title">Quizzes</h1>
        <p className="welcome-subtitle">
          Test your knowledge and track your performance
        </p>
        
        {/* Filters */}
        <div className="assignments-filters">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({quizzes.length})
          </button>
          <button
            className={`filter-button ${filter === 'not_attempted' ? 'active' : ''}`}
            onClick={() => setFilter('not_attempted')}
          >
            Not Attempted ({quizzes.filter(q => q.status === 'not_attempted').length})
          </button>
          <button
            className={`filter-button ${filter === 'attempted' ? 'active' : ''}`}
            onClick={() => setFilter('attempted')}
          >
            Attempted ({quizzes.filter(q => q.status === 'attempted').length})
          </button>
          <button
            className={`filter-button ${filter === 'graded' ? 'active' : ''}`}
            onClick={() => setFilter('graded')}
          >
            Graded ({quizzes.filter(q => q.status === 'graded').length})
          </button>
        </div>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredQuizzes.map((quiz) => (
          <div key={quiz.id} className="quiz-card">
            {/* Quiz Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="quiz-title">{quiz.title}</h3>
                <p className="quiz-description">{quiz.description}</p>
                <span className="quiz-module-badge">
                  {quiz.module_name}
                </span>
              </div>
              <div className="text-right">
                {quiz.status === 'graded' && quiz.percentage !== undefined && (
                  <>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {quiz.percentage.toFixed(1)}%
                    </div>
                    {quiz.marks_obtained !== undefined && (
                      <div className="text-sm text-gray-500">
                        {quiz.marks_obtained}/{quiz.total_marks} marks
                      </div>
                    )}
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getStatusColor(quiz.status)}`}>
                      ✅ Graded
                    </div>
                  </>
                )}
                {quiz.status === 'completed' && quiz.percentage !== undefined && (
                  <>
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {quiz.percentage.toFixed(1)}%
                    </div>
                    {quiz.marks_obtained !== undefined && (
                      <div className="text-sm text-gray-500">
                        {quiz.marks_obtained}/{quiz.total_marks} marks
                      </div>
                    )}
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getStatusColor(quiz.status)}`}>
                      🎯 Completed
                    </div>
                  </>
                )}
                {quiz.status === 'attempted' && (
                  <>
                    <div className="text-3xl font-bold text-yellow-600 mb-1">
                      {quiz.percentage ? quiz.percentage.toFixed(1) + '%' : '--'}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getStatusColor(quiz.status)}`}>
                      ⏳ Attempted
                    </div>
                  </>
                )}
                {quiz.status === 'in_progress' && (
                  <>
                    <div className="text-3xl font-bold text-purple-600 mb-1">--</div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getStatusColor(quiz.status)}`}>
                      🔄 In Progress
                    </div>
                  </>
                )}
                {quiz.status === 'not_attempted' && (
                  <>
                    <div className="text-3xl font-bold text-gray-400 mb-1">--</div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getStatusColor(quiz.status)}`}>
                      📝 Not Started
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Quiz Stats */}
            <div className="quiz-stats-grid">
              <div className="quiz-stat-item">
                <Clock className="quiz-stat-icon" />
                <div className="quiz-stat-value">{quiz.duration}</div>
                <div className="quiz-stat-label">minutes</div>
              </div>
              <div className="quiz-stat-item">
                <BookOpen className="quiz-stat-icon" />
                <div className="quiz-stat-value">{quiz.total_questions}</div>
                <div className="quiz-stat-label">questions</div>
              </div>
              <div className="quiz-stat-item">
                <Calendar className="quiz-stat-icon" />
                <div className="quiz-stat-value">{new Date(quiz.deadline).toLocaleDateString()}</div>
                <div className="quiz-stat-label">due date</div>
              </div>
            </div>
            
            {/* Quiz Actions */}
            <div className="flex flex-col space-y-3">
              {quiz.status === 'not_attempted' && (
                <>
                  {isOverdue(quiz.deadline) ? (
                    <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                      <span className="text-red-600 text-sm font-medium">⏰ Overdue</span>
                    </div>
                  ) : (
                    <button 
                      className="quiz-button quiz-button-start"
                      onClick={() => navigate(`/quiz/${quiz.id}/take`)}
                    >
                      <Play className="w-5 h-5" />
                      Take Test
                    </button>
                  )}
                  <button 
                    className="quiz-button quiz-button-secondary"
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                  >
                    <Eye className="w-5 h-5" />
                    View Details
                  </button>
                </>
              )}
              
              {quiz.status === 'in_progress' && (
                <>
                  <button 
                    className="quiz-button quiz-button-continue"
                    onClick={() => navigate(`/quiz/${quiz.id}/take`)}
                  >
                    <Play className="w-5 h-5" />
                    Continue Test
                  </button>
                  <button 
                    className="quiz-button quiz-button-secondary"
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                  >
                    <Eye className="w-5 h-5" />
                    View Details
                  </button>
                </>
              )}
              
              {quiz.status === 'attempted' && (
                <>
                  <button 
                    className="quiz-button quiz-button-results"
                    onClick={() => navigate(`/quiz/${quiz.id}/results`)}
                  >
                    <Eye className="w-5 h-5" />
                    View Results
                  </button>
                  {!isOverdue(quiz.deadline) && (
                    <button 
                      className="quiz-button quiz-button-retake"
                      onClick={() => handleRetakeQuiz(quiz.id)}
                    >
                      <RotateCcw className="w-5 h-5" />
                      Retake Quiz
                    </button>
                  )}
                </>
              )}
              
              {quiz.status === 'completed' && (
                <>
                  <button 
                    className="quiz-button quiz-button-results"
                    onClick={() => navigate(`/quiz/${quiz.id}/results`)}
                  >
                    <Eye className="w-5 h-5" />
                    View Results
                  </button>
                  <button 
                    className="quiz-button quiz-button-secondary"
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                  >
                    <BookOpen className="w-5 h-5" />
                    View Details
                  </button>
                </>
              )}
              
              {quiz.status === 'graded' && (
                <>
                  <button 
                    className="quiz-button quiz-button-results"
                    onClick={() => navigate(`/quiz/${quiz.id}/results`)}
                  >
                    <Eye className="w-5 h-5" />
                    View Results
                  </button>
                  <button 
                    className="quiz-button quiz-button-secondary"
                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                  >
                    <BookOpen className="w-5 h-5" />
                    View Details
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No quizzes found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'You don\'t have any quizzes yet.'
              : `No ${filter.replace('_', ' ')} quizzes found.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Quizzes;
