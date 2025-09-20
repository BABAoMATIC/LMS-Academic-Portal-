import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  BookOpen, 
  FileText, 
  Award, 
  Target, 
  Clock,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  X,
  HelpCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar
} from 'recharts';

interface StudentPersonalData {
  personalStats: {
    total_quizzes_attempted: number;
    total_assignments_submitted: number;
    average_quiz_score: number;
    average_assignment_grade: number;
    completion_rate: number;
    current_gpa: number;
  };
  recentQuizAttempts: Array<{
    quiz_title: string;
    score: number;
    max_score: number;
    attempt_date: string;
    status: 'passed' | 'failed';
  }>;
  recentSubmissions: Array<{
    assignment_title: string;
    grade: number | null;
    submitted_date: string;
    status: 'graded' | 'pending';
  }>;
  subjectPerformance: Array<{
    subject: string;
    average_score: number;
    total_attempts: number;
  }>;
  monthlyProgress: Array<{
    month: string;
    quizzes_taken: number;
    assignments_submitted: number;
    average_score: number;
  }>;
  weeklyActivity: Array<{
    week: string;
    study_hours: number;
    quiz_attempts: number;
    assignment_submissions: number;
  }>;
  gradeDistribution: Array<{
    grade_range: string;
    count: number;
    color: string;
  }>;
  learningStrengths: Array<{
    subject: string;
    strength_score: number;
    color: string;
  }>;
}

const StudentPersonalAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<StudentPersonalData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching student's personal analytics data
    const fetchPersonalAnalytics = async () => {
      try {
        setLoading(true);
        
        // Mock data - in real app, this would come from API
        const mockData: StudentPersonalData = {
          personalStats: {
            total_quizzes_attempted: 12,
            total_assignments_submitted: 8,
            average_quiz_score: 85.5,
            average_assignment_grade: 88.2,
            completion_rate: 92,
            current_gpa: 3.7
          },
          recentQuizAttempts: [
            { quiz_title: "React Fundamentals", score: 18, max_score: 20, attempt_date: "2024-01-15", status: "passed" },
            { quiz_title: "JavaScript ES6", score: 15, max_score: 20, attempt_date: "2024-01-12", status: "passed" },
            { quiz_title: "CSS Grid Layout", score: 12, max_score: 20, attempt_date: "2024-01-10", status: "failed" },
            { quiz_title: "Node.js Basics", score: 19, max_score: 20, attempt_date: "2024-01-08", status: "passed" }
          ],
          recentSubmissions: [
            { assignment_title: "Todo App Project", grade: 92, submitted_date: "2024-01-14", status: "graded" },
            { assignment_title: "API Integration", grade: 88, submitted_date: "2024-01-11", status: "graded" },
            { assignment_title: "Database Design", grade: null, submitted_date: "2024-01-16", status: "pending" },
            { assignment_title: "Frontend Portfolio", grade: 95, submitted_date: "2024-01-09", status: "graded" }
          ],
          subjectPerformance: [
            { subject: "Web Development", average_score: 89.2, total_attempts: 6 },
            { subject: "JavaScript", average_score: 87.5, total_attempts: 4 },
            { subject: "React", average_score: 91.0, total_attempts: 3 },
            { subject: "CSS", average_score: 82.3, total_attempts: 2 }
          ],
          monthlyProgress: [
            { month: "Oct", quizzes_taken: 3, assignments_submitted: 2, average_score: 85 },
            { month: "Nov", quizzes_taken: 4, assignments_submitted: 3, average_score: 88 },
            { month: "Dec", quizzes_taken: 2, assignments_submitted: 1, average_score: 90 },
            { month: "Jan", quizzes_taken: 3, assignments_submitted: 2, average_score: 87 }
          ],
          weeklyActivity: [
            { week: "Week 1", study_hours: 12, quiz_attempts: 2, assignment_submissions: 1 },
            { week: "Week 2", study_hours: 15, quiz_attempts: 3, assignment_submissions: 2 },
            { week: "Week 3", study_hours: 18, quiz_attempts: 2, assignment_submissions: 1 },
            { week: "Week 4", study_hours: 14, quiz_attempts: 4, assignment_submissions: 3 },
            { week: "Week 5", study_hours: 16, quiz_attempts: 3, assignment_submissions: 2 },
            { week: "Week 6", study_hours: 20, quiz_attempts: 2, assignment_submissions: 1 }
          ],
          gradeDistribution: [
            { grade_range: "90-100", count: 8, color: "#10b981" },
            { grade_range: "80-89", count: 12, color: "#3b82f6" },
            { grade_range: "70-79", count: 6, color: "#f59e0b" },
            { grade_range: "60-69", count: 2, color: "#ef4444" },
            { grade_range: "Below 60", count: 1, color: "#6b7280" }
          ],
          learningStrengths: [
            { subject: "React", strength_score: 95, color: "#3b82f6" },
            { subject: "JavaScript", strength_score: 88, color: "#f59e0b" },
            { subject: "CSS", strength_score: 82, color: "#10b981" },
            { subject: "Node.js", strength_score: 75, color: "#8b5cf6" },
            { subject: "Database", strength_score: 70, color: "#ef4444" }
          ]
        };
        
        setData(mockData);
      } catch (error) {
        console.error('Error fetching personal analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load your analytics data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Performance Analytics</h2>
            <p className="text-gray-600">Track your learning progress and achievements</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-blue-200">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-semibold">Live Data</span>
          </div>
        </div>
      </div>

      {/* Personal Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-blue-600">{data.personalStats.total_quizzes_attempted}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Quizzes Attempted</h3>
          <p className="text-sm text-gray-600">Total quiz attempts</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-green-600">{data.personalStats.total_assignments_submitted}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Assignments Submitted</h3>
          <p className="text-sm text-gray-600">Total submissions</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-purple-600">{data.personalStats.average_quiz_score}%</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Average Quiz Score</h3>
          <p className="text-sm text-gray-600">Your quiz performance</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-orange-600">{data.personalStats.average_assignment_grade}%</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Average Assignment Grade</h3>
          <p className="text-sm text-gray-600">Your assignment performance</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-indigo-600">{data.personalStats.completion_rate}%</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Completion Rate</h3>
          <p className="text-sm text-gray-600">Overall completion</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-emerald-600">{data.personalStats.current_gpa}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Current GPA</h3>
          <p className="text-sm text-gray-600">Your academic standing</p>
        </div>
      </div>

      {/* Recent Quiz Attempts */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Recent Quiz Attempts</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Last 30 days</span>
          </div>
        </div>
        <div className="space-y-4">
          {data.recentQuizAttempts.map((quiz, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  quiz.status === 'passed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {quiz.status === 'passed' ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{quiz.quiz_title}</h4>
                  <p className="text-sm text-gray-600">{quiz.attempt_date}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{quiz.score}/{quiz.max_score}</div>
                <div className={`text-sm font-medium ${
                  quiz.status === 'passed' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.round((quiz.score / quiz.max_score) * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Recent Assignment Submissions</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Activity className="w-4 h-4" />
            <span>Latest submissions</span>
          </div>
        </div>
        <div className="space-y-4">
          {data.recentSubmissions.map((submission, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  submission.status === 'graded' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {submission.status === 'graded' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{submission.assignment_title}</h4>
                  <p className="text-sm text-gray-600">{submission.submitted_date}</p>
                </div>
              </div>
              <div className="text-right">
                {submission.grade ? (
                  <>
                    <div className="text-lg font-bold text-gray-900">{submission.grade}%</div>
                    <div className="text-sm text-green-600 font-medium">Graded</div>
                  </>
                ) : (
                  <div className="text-sm text-yellow-600 font-medium">Pending</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Performance */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Performance by Subject</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BarChart3 className="w-4 h-4" />
            <span>Average scores</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.subjectPerformance.map((subject, index) => (
            <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{subject.subject}</h4>
                <span className="text-lg font-bold text-blue-600">{subject.average_score}%</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{subject.total_attempts} attempts</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${subject.average_score}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Performance Analytics</h3>
          <p className="text-gray-600">Visual insights into your learning progress</p>
        </div>

        {/* Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Monthly Progress Line Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900">Monthly Progress Trend</h4>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="average_score" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                  name="Average Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="quizzes_taken" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                  name="Quizzes Taken"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Weekly Activity Area Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900">Weekly Study Activity</h4>
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="study_hours" 
                  stackId="1" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.6}
                  name="Study Hours"
                />
                <Area 
                  type="monotone" 
                  dataKey="quiz_attempts" 
                  stackId="2" 
                  stroke="#f59e0b" 
                  fill="#f59e0b" 
                  fillOpacity={0.6}
                  name="Quiz Attempts"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 3: Grade Distribution Pie Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900">Grade Distribution</h4>
              <PieChart className="w-5 h-5 text-purple-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={data.gradeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ grade_range, count }) => `${grade_range}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 4: Subject Performance Bar Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900">Subject Performance</h4>
              <BarChart3 className="w-5 h-5 text-orange-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.subjectPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="subject" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar 
                  dataKey="average_score" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  name="Average Score"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 5: Learning Strengths Radial Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900">Learning Strengths</h4>
              <Target className="w-5 h-5 text-indigo-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={data.learningStrengths}>
                <RadialBar 
                  dataKey="strength_score" 
                  cornerRadius={10} 
                  fill="#3b82f6"
                  name="Strength Score"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {data.learningStrengths.map((strength, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: strength.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{strength.subject}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{strength.strength_score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 6: Assignment vs Quiz Performance */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold text-gray-900">Performance Comparison</h4>
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Bar 
                  dataKey="quizzes_taken" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                  name="Quizzes Taken"
                />
                <Bar 
                  dataKey="assignments_submitted" 
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]}
                  name="Assignments Submitted"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPersonalAnalytics;
