import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './EnhancedQuizResults.css';
import '../styles/quiz-results-enhanced.css';

interface QuizResult {
  id: number;
  quiz_title: string;
  student_name: string;
  score: number;
  total_marks: number;
  percentage: number;
  status: 'pass' | 'fail';
  completed_at: string;
}

interface QuizStats {
  total_attempts: number;
  pass_rate: number;
  average_score: number;
  total_students: number;
}

const QuizResultsDashboard: React.FC = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [stats, setStats] = useState<QuizStats>({
    total_attempts: 0,
    pass_rate: 0,
    average_score: 0,
    total_students: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchQuizResults();
  }, [selectedQuiz]);

  const fetchQuizResults = async () => {
    try {
      setLoading(true);
      
      // Mock data for quiz results
      const mockResults = [
        {
          id: 1,
          quiz_title: "React Fundamentals Quiz",
          student_name: "John Smith",
          score: 85,
          total_marks: 100,
          percentage: 85,
          status: "pass" as const,
          completed_at: "2024-01-15T10:30:00Z"
        },
        {
          id: 2,
          quiz_title: "JavaScript ES6 Features",
          student_name: "Sarah Johnson",
          score: 72,
          total_marks: 100,
          percentage: 72,
          status: "pass" as const,
          completed_at: "2024-01-12T14:20:00Z"
        },
        {
          id: 3,
          quiz_title: "CSS Grid and Flexbox",
          student_name: "Mike Davis",
          score: 45,
          total_marks: 100,
          percentage: 45,
          status: "fail" as const,
          completed_at: "2024-01-10T09:15:00Z"
        }
      ];

      const mockStats = {
        total_attempts: 3,
        pass_rate: 66.7,
        average_score: 67.3,
        total_students: 3
      };

      setResults(mockResults);
      setStats(mockStats);
      
    } catch (error) {
      console.error('Error fetching quiz results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'pass' ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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

  if (loading) {
    return (
      <div className="quiz-results-loading">
        <div className="quiz-results-spinner"></div>
      </div>
    );
  }

  return (
    <div className="quiz-results-container">
      <div className="quiz-results-header">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Results Dashboard</h3>
            <p className="text-gray-600">Monitor student performance and quiz analytics</p>
          </div>
          <button
            onClick={fetchQuizResults}
            className="enhanced-quiz-results-button success"
          >
            <TrendingUp className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="quiz-stats-grid">
        <div className="quiz-stat-card total-attempts quiz-results-fade-in">
          <div className="quiz-stat-icon blue">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Attempts</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total_attempts}</p>
            <p className="text-xs text-gray-500 mt-1">Quiz submissions</p>
          </div>
        </div>

        <div className="quiz-stat-card pass-rate quiz-results-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="quiz-stat-icon green">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Pass Rate</p>
            <p className="text-3xl font-bold text-gray-900">{stats.pass_rate.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Success rate</p>
          </div>
        </div>

        <div className="quiz-stat-card average-score quiz-results-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="quiz-stat-icon orange">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Average Score</p>
            <p className="text-3xl font-bold text-gray-900">{stats.average_score.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Mean performance</p>
          </div>
        </div>

        <div className="quiz-stat-card total-students quiz-results-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="quiz-stat-icon purple">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total_students}</p>
            <p className="text-xs text-gray-500 mt-1">Active participants</p>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="quiz-results-table quiz-results-slide-up">
        <div className="quiz-results-table-header">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <Award className="w-5 h-5 mr-2 text-purple-600" />
            Recent Quiz Results
          </h4>
        </div>
        
        {results.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No quiz results available</p>
            <p className="text-sm">Results will appear here once students complete quizzes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Quiz
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Completed
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={result.id} className="quiz-results-table-row quiz-results-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                            <span className="text-sm font-bold text-white">
                              {result.student_name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {result.student_name}
                          </div>
                          <div className="text-xs text-gray-500">Student</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{result.quiz_title}</div>
                      <div className="text-xs text-gray-500">Quiz Assessment</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {result.score}/{result.total_marks}
                      </div>
                      <div className="text-xs text-gray-500">Marks obtained</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-bold text-gray-900 mr-2">
                          {result.percentage.toFixed(1)}%
                        </div>
                        <div className="quiz-percentage-bar w-16">
                          <div 
                            className={`quiz-percentage-fill ${
                              result.percentage >= 80 ? 'high' : 
                              result.percentage >= 60 ? 'medium' : 'low'
                            }`}
                            style={{ width: `${result.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(result.status)}
                        <span className={`ml-2 quiz-status-badge ${result.status}`}>
                          {result.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        <div>
                          <div className="font-medium">{formatDate(result.completed_at)}</div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResultsDashboard;
