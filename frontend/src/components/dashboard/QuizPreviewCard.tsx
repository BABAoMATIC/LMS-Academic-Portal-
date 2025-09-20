import React from 'react';
import { Brain, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

interface Quiz {
  id: number;
  title: string;
  module_name: string;
  score?: number;
  status: 'attempted' | 'not_attempted';
  due_date: string;
  duration: number;
}

interface QuizPreviewCardProps {
  quizzes: Quiz[];
  loading: boolean;
}

const QuizPreviewCard: React.FC<QuizPreviewCardProps> = ({ quizzes, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const attemptedQuizzes = quizzes.filter(q => q.status === 'attempted');
  const upcomingQuizzes = quizzes.filter(q => q.status === 'not_attempted');
  const overdueQuizzes = quizzes.filter(q => {
    const dueDate = new Date(q.due_date);
    const now = new Date();
    return dueDate < now && q.status === 'not_attempted';
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusIcon = (quiz: Quiz) => {
    if (quiz.status === 'attempted') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (overdueQuizzes.some(q => q.id === quiz.id)) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    return <Clock className="w-5 h-5 text-blue-500" />;
  };

  const getStatusColor = (quiz: Quiz) => {
    if (quiz.status === 'attempted') {
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    }
    if (overdueQuizzes.some(q => q.id === quiz.id)) {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
    return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
          <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quizzes & Tests</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {quizzes.length} total quizzes
          </p>
        </div>
      </div>

      {/* Quiz Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {attemptedQuizzes.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {upcomingQuizzes.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Upcoming</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {overdueQuizzes.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Overdue</div>
        </div>
      </div>

      {/* Quiz List */}
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {quizzes.slice(0, 3).map((quiz) => (
          <div key={quiz.id} className={`flex items-center gap-3 p-3 rounded-lg border ${getStatusColor(quiz)}`}>
            <div className="flex-shrink-0">
              {getStatusIcon(quiz)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {quiz.title}
                </h4>
                {quiz.score !== undefined && (
                  <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                    {quiz.score}%
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span className="truncate">{quiz.module_name}</span>
                <div className="flex items-center gap-2">
                  <span>{quiz.duration} min</span>
                  <span className="font-medium">{formatDate(quiz.due_date)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {quizzes.length > 3 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
            View all {quizzes.length} quizzes
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizPreviewCard;
