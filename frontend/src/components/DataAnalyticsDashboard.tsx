import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, BookOpen, Award, Target, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

interface AnalyticsData {
  studentProgress: Array<{
    student_name: string;
    assignments_completed: number;
    quizzes_taken: number;
    average_score: number;
    reflections_count: number;
  }>;
  assignmentStats: Array<{
    assignment_title: string;
    total_submissions: number;
    average_score: number;
    completion_rate: number;
  }>;
  quizStats: Array<{
    quiz_title: string;
    total_attempts: number;
    pass_rate: number;
    average_score: number;
  }>;
  learningOutcomes: Array<{
    outcome_name: string;
    evidence_count: number;
    students_count: number;
  }>;
  monthlyActivity: Array<{
    month: string;
    assignments: number;
    quizzes: number;
    submissions: number;
  }>;
  overallStats: {
    total_students: number;
    total_assignments: number;
    total_quizzes: number;
    total_submissions: number;
    average_completion_rate: number;
    top_performing_student: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DataAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const { user } = useAuth();

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedTimeframe]);

  const fetchAnalyticsData = async () => {
    try {
      // Try to fetch from API service first
      const response = await apiService.getAnalytics(selectedTimeframe);
      const analyticsData = response.data || response;
      
      if (analyticsData && typeof analyticsData === 'object' && !Array.isArray(analyticsData)) {
        setData(analyticsData as AnalyticsData);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Use mock data for demonstration
      setData({
        studentProgress: [
          { student_name: 'John Doe', assignments_completed: 8, quizzes_taken: 5, average_score: 85, reflections_count: 12 },
          { student_name: 'Jane Smith', assignments_completed: 7, quizzes_taken: 6, average_score: 92, reflections_count: 15 },
          { student_name: 'Mike Johnson', assignments_completed: 9, quizzes_taken: 4, average_score: 78, reflections_count: 10 },
          { student_name: 'Sarah Wilson', assignments_completed: 6, quizzes_taken: 7, average_score: 88, reflections_count: 14 },
          { student_name: 'David Brown', assignments_completed: 8, quizzes_taken: 5, average_score: 81, reflections_count: 11 }
        ],
        assignmentStats: [
          { assignment_title: 'Programming Assignment 1', total_submissions: 25, average_score: 82, completion_rate: 100 },
          { assignment_title: 'Data Structures Project', total_submissions: 23, average_score: 78, completion_rate: 92 },
          { assignment_title: 'Algorithm Design', total_submissions: 24, average_score: 85, completion_rate: 96 },
          { assignment_title: 'Database Design', total_submissions: 22, average_score: 79, completion_rate: 88 }
        ],
        quizStats: [
          { quiz_title: 'Python Basics', total_attempts: 30, pass_rate: 87, average_score: 84 },
          { quiz_title: 'OOP Concepts', total_attempts: 28, pass_rate: 82, average_score: 79 },
          { quiz_title: 'Data Structures', total_attempts: 26, pass_rate: 77, average_score: 76 },
          { quiz_title: 'Algorithms', total_attempts: 25, pass_rate: 72, average_score: 73 }
        ],
        learningOutcomes: [
          { outcome_name: 'Problem Solving', evidence_count: 45, students_count: 25 },
          { outcome_name: 'Collaboration', evidence_count: 38, students_count: 22 },
          { outcome_name: 'Communication', evidence_count: 42, students_count: 24 },
          { outcome_name: 'Critical Thinking', evidence_count: 35, students_count: 20 },
          { outcome_name: 'Technical Skills', evidence_count: 48, students_count: 25 }
        ],
        monthlyActivity: [
          { month: 'Jan', assignments: 2, quizzes: 3, submissions: 45 },
          { month: 'Feb', assignments: 3, quizzes: 4, submissions: 52 },
          { month: 'Mar', assignments: 2, quizzes: 3, submissions: 38 },
          { month: 'Apr', assignments: 4, quizzes: 5, submissions: 67 },
          { month: 'May', assignments: 3, quizzes: 4, submissions: 58 }
        ],
        overallStats: {
          total_students: 25,
          total_assignments: 14,
          total_quizzes: 16,
          total_submissions: 260,
          average_completion_rate: 89,
          top_performing_student: 'Jane Smith'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Data Analytics Dashboard</h3>
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{data?.overallStats?.total_students || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{data?.overallStats?.total_assignments || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Quizzes</p>
              <p className="text-2xl font-bold text-gray-900">{data?.overallStats?.total_quizzes || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{data?.overallStats?.total_submissions || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data?.overallStats?.average_completion_rate || 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Award className="w-6 h-6 text-pink-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Top Student</p>
              <p className="text-sm font-bold text-gray-900">{data?.overallStats?.top_performing_student || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Progress Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Student Progress Overview</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.studentProgress || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="student_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="assignments_completed" fill="#8884d8" name="Assignments" />
              <Bar dataKey="quizzes_taken" fill="#82ca9d" name="Quizzes" />
              <Bar dataKey="reflections_count" fill="#ffc658" name="Reflections" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Learning Outcomes Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Learning Outcomes Evidence</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data?.learningOutcomes || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="evidence_count"
              >
                {(data?.learningOutcomes || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment Performance */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Assignment Performance</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.assignmentStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="assignment_title" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="average_score" fill="#8884d8" name="Average Score" />
              <Bar dataKey="completion_rate" fill="#82ca9d" name="Completion Rate" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quiz Performance */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Quiz Performance</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.quizStats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quiz_title" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="pass_rate" fill="#8884d8" name="Pass Rate" />
              <Bar dataKey="average_score" fill="#82ca9d" name="Average Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Activity Trend */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Monthly Activity Trend</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data?.monthlyActivity || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="assignments" stroke="#8884d8" name="Assignments" />
            <Line type="monotone" dataKey="quizzes" stroke="#82ca9d" name="Quizzes" />
            <Line type="monotone" dataKey="submissions" stroke="#ffc658" name="Submissions" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DataAnalyticsDashboard;
