import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Award, 
  Clock, 
  Target,
  ArrowLeft,
  MessageSquare,
  X,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';

interface Student {
  id: number;
  name: string;
  email: string;
  studentId: string;
  personalStats: {
    current_gpa: number;
    total_assignments_submitted: number;
    total_quizzes_attempted: number;
    average_quiz_score: number;
    total_reflections: number;
    skills_in_development: string[];
  };
  recentActivity: Array<{
    type: string;
    title: string;
    date: string;
    score?: number;
  }>;
}

const StudentAnalyticsPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'teacher') {
      navigate('/');
      return;
    }

    // Mock student data - in real app, fetch by studentId
    const mockStudent: Student = {
      id: parseInt(studentId || '1'),
      name: 'Alex Johnson',
      email: 'alex.johnson@university.edu',
      studentId: 'STU001',
      personalStats: {
        current_gpa: 3.8,
        total_assignments_submitted: 12,
        total_quizzes_attempted: 8,
        average_quiz_score: 85,
        total_reflections: 5,
        skills_in_development: ['Critical Thinking', 'Problem Solving', 'Communication']
      },
      recentActivity: [
        { type: 'quiz', title: 'Mathematics Quiz', date: '2024-01-20', score: 92 },
        { type: 'assignment', title: 'Research Paper', date: '2024-01-18', score: 88 },
        { type: 'reflection', title: 'Learning Reflection', date: '2024-01-15' }
      ]
    };

    setStudent(mockStudent);
    setLoading(false);
  }, [studentId, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student analytics...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Student not found</p>
          <button 
            onClick={() => navigate('/teacher')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Enhanced chart data
  const weeklyActivityData = [
    { week: 'Week 1', assignments: 2, quizzes: 1, reflections: 1, hours: 12 },
    { week: 'Week 2', assignments: 3, quizzes: 2, reflections: 0, hours: 15 },
    { week: 'Week 3', assignments: 1, quizzes: 1, reflections: 2, hours: 18 },
    { week: 'Week 4', assignments: 2, quizzes: 2, reflections: 1, hours: 14 },
    { week: 'Week 5', assignments: 3, quizzes: 1, reflections: 1, hours: 16 },
    { week: 'Week 6', assignments: 1, quizzes: 1, reflections: 1, hours: 13 }
  ];

  const gradeDistributionData = [
    { name: 'A+ (90-100)', value: 3, color: '#10B981' },
    { name: 'A (80-89)', value: 4, color: '#3B82F6' },
    { name: 'B (70-79)', value: 3, color: '#F59E0B' },
    { name: 'C (60-69)', value: 2, color: '#EF4444' }
  ];

  const skillsProgressData = [
    { skill: 'Critical Thinking', progress: 85 },
    { skill: 'Problem Solving', progress: 78 },
    { skill: 'Communication', progress: 92 },
    { skill: 'Research', progress: 88 }
  ];

  // New comprehensive chart data
  const monthlyPerformanceData = [
    { month: 'Jan', gpa: 3.2, assignments: 4, quizzes: 3, score: 78 },
    { month: 'Feb', gpa: 3.4, assignments: 5, quizzes: 4, score: 82 },
    { month: 'Mar', gpa: 3.6, assignments: 3, quizzes: 2, score: 85 },
    { month: 'Apr', gpa: 3.8, assignments: 4, quizzes: 3, score: 88 },
    { month: 'May', gpa: 3.9, assignments: 6, quizzes: 5, score: 91 },
    { month: 'Jun', gpa: 3.8, assignments: 2, quizzes: 1, score: 89 }
  ];

  const subjectPerformanceData = [
    { subject: 'Mathematics', score: 92, attempts: 8, average: 88 },
    { subject: 'Science', score: 85, attempts: 6, average: 82 },
    { subject: 'English', score: 78, attempts: 5, average: 75 },
    { subject: 'History', score: 88, attempts: 4, average: 85 }
  ];

  const quizAttemptsData = [
    { quiz: 'Algebra Basics', score: 85, date: '2024-01-15', status: 'Passed' },
    { quiz: 'Geometry', score: 92, date: '2024-01-20', status: 'Passed' },
    { quiz: 'Statistics', score: 78, date: '2024-01-25', status: 'Passed' },
    { quiz: 'Calculus', score: 65, date: '2024-01-30', status: 'Failed' },
    { quiz: 'Trigonometry', score: 88, date: '2024-02-05', status: 'Passed' }
  ];

  const assignmentProgressData = [
    { assignment: 'Research Paper', grade: 88, submitted: '2024-01-10', status: 'Graded' },
    { assignment: 'Lab Report', grade: 92, submitted: '2024-01-15', status: 'Graded' },
    { assignment: 'Essay', grade: null, submitted: '2024-01-20', status: 'Pending' },
    { assignment: 'Presentation', grade: 85, submitted: '2024-01-25', status: 'Graded' }
  ];

  const learningPathData = [
    { week: 'Week 1', completed: 60, total: 100 },
    { week: 'Week 2', completed: 75, total: 100 },
    { week: 'Week 3', completed: 80, total: 100 },
    { week: 'Week 4', completed: 85, total: 100 },
    { week: 'Week 5', completed: 90, total: 100 },
    { week: 'Week 6', completed: 88, total: 100 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/teacher')}
                className="group p-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-lg transition-all duration-200 hover:shadow-md"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {student.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {student.name}'s Analytics
                  </h1>
                  <p className="text-gray-600 text-sm">Comprehensive performance insights and progress tracking</p>
                </div>
              </div>
            </div>
            <button className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-1 active:translate-y-0 active:scale-95 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
              <div className="relative flex items-center gap-3">
                <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors duration-200">
                  <MessageSquare className="w-3 h-3" />
                </div>
                <span className="group-hover:tracking-wide transition-all duration-200">Send Message</span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59,130,246,0.15) 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }}></div>
          </div>
          
          {/* Content with Glass Effect */}
          <div className="relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
            {/* Student Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-blue-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <HelpCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{student.personalStats.total_quizzes_attempted}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Quizzes Attempted</h3>
                <p className="text-sm text-gray-600">Total quiz attempts</p>
              </div>

              <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border border-green-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-green-600">{student.personalStats.total_assignments_submitted}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Assignments Submitted</h3>
                <p className="text-sm text-gray-600">Total submissions</p>
              </div>

              <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-purple-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-purple-600">{student.personalStats.average_quiz_score}%</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Average Quiz Score</h3>
                <p className="text-sm text-gray-600">Performance metric</p>
              </div>

              <div className="group bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 shadow-lg border border-orange-200 hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-orange-600">{student.personalStats.current_gpa}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Current GPA</h3>
                <p className="text-sm text-gray-600">Academic standing</p>
              </div>
            </div>

            {/* Enhanced Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Weekly Activity Chart */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Weekly Activity</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyActivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="assignments" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="quizzes" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="reflections" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Grade Distribution Chart */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Grade Distribution</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={gradeDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {gradeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Performance Trend */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Monthly Performance Trend</h3>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="gpa" stroke="#8B5CF6" strokeWidth={3} name="GPA" />
                  <Line yAxisId="right" type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} name="Average Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Subject Performance & Quiz Attempts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Subject Performance */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Subject Performance</h3>
                </div>
                <div className="space-y-4">
                  {subjectPerformanceData.map((subject, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">{subject.subject}</span>
                        <span className="text-lg font-bold text-blue-600">{subject.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                          style={{width: `${subject.score}%`}}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{subject.attempts} attempts</span>
                        <span>Avg: {subject.average}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiz Attempts */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Recent Quiz Attempts</h3>
                </div>
                <div className="space-y-3">
                  {quizAttemptsData.map((quiz, index) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      quiz.status === 'Passed' 
                        ? 'bg-green-50 border-green-400' 
                        : 'bg-red-50 border-red-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-800">{quiz.quiz}</div>
                          <div className="text-sm text-gray-600">{quiz.date}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            quiz.status === 'Passed' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {quiz.score}%
                          </div>
                          <div className={`text-xs ${
                            quiz.status === 'Passed' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {quiz.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Assignment Progress */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Assignment Progress</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignmentProgressData.map((assignment, index) => (
                  <div key={index} className={`p-4 rounded-lg border-2 ${
                    assignment.status === 'Graded' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-800">{assignment.assignment}</div>
                      <div className={`text-lg font-bold ${
                        assignment.grade ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {assignment.grade ? `${assignment.grade}%` : 'Pending'}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">Submitted: {assignment.submitted}</div>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      assignment.status === 'Graded' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {assignment.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Path Progress */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Learning Path Progress</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={learningPathData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10B981" name="Completed" />
                  <Bar dataKey="total" fill="#E5E7EB" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Learning Strengths */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Learning Strengths & Progress</h3>
              </div>
              <div className="space-y-4">
                {skillsProgressData.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold text-gray-900">{skill.skill}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${skill.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-600 w-12 text-right">{skill.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Performance Insights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Strengths
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Consistent assignment submissions</li>
                    <li>• Strong quiz performance</li>
                    <li>• Active in reflections</li>
                    <li>• Good communication skills</li>
                  </ul>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Areas for Improvement
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Increase reflection frequency</li>
                    <li>• Focus on time management</li>
                    <li>• Enhance critical thinking</li>
                    <li>• Improve research skills</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentAnalyticsPage;
