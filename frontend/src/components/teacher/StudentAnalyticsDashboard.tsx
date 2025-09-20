import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Activity,
  Target,
  Award,
  BookOpen,
  Clock,
  CheckCircle,
  Star,
  ArrowLeft,
  Download,
  Filter,
  Eye,
  MessageSquare,
  FileText,
  Brain,
  Zap,
  LineChart,
  BarChart,
  PieChart as PieChartIcon,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Target as TargetIcon,
  BookOpen as BookOpenIcon,
  Award as AwardIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  ArrowLeft as ArrowLeftIcon,
  Download as DownloadIcon,
  Filter as FilterIcon,
  Eye as EyeIcon,
  MessageSquare as MessageSquareIcon,
  FileText as FileTextIcon,
  Brain as BrainIcon,
  Zap as ZapIcon,
  Monitor,
  Home
} from 'lucide-react';
import { 
  LineChart as RechartsLineChart, 
  Line, 
  BarChart as RechartsBarChart, 
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
import '../styles/student-analytics-dashboard-enhanced.css';

import { User } from '../../types';

interface StudentAnalyticsDashboardProps {
  student: User;
  onClose: () => void;
}

const StudentAnalyticsDashboard: React.FC<StudentAnalyticsDashboardProps> = ({ student, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchStudentAnalytics();
  }, [student.id]);

  const fetchStudentAnalytics = async () => {
    try {
      setLoading(true);
      // Simulate API call with demo data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const demoAnalytics = {
        kpis: {
          quizAverage: 91.5,
          completionRate: 96,
          gpa: 3.8,
          quizzesTaken: 10,
          assignmentsSubmitted: 7
        },
        weeklyProgress: [
          { week: 'Week 1', score: 85, activities: 8 },
          { week: 'Week 2', score: 88, activities: 10 },
          { week: 'Week 3', score: 92, activities: 12 },
          { week: 'Week 4', score: 89, activities: 9 },
          { week: 'Week 5', score: 94, activities: 11 },
          { week: 'Week 6', score: 91, activities: 13 }
        ],
        performanceData: [
          { month: 'Jan', quizzes: 2, assignments: 1, avg_score: 85 },
          { month: 'Feb', quizzes: 3, assignments: 2, avg_score: 88 },
          { month: 'Mar', quizzes: 1, assignments: 1, avg_score: 92 },
          { month: 'Apr', quizzes: 4, assignments: 2, avg_score: 89 },
          { month: 'May', quizzes: 2, assignments: 1, avg_score: 94 },
          { month: 'Jun', quizzes: 3, assignments: 2, avg_score: 91 }
        ],
        engagementData: [
          { week: 'Week 1', hours_studied: 15, quizzes_taken: 2, assignments_submitted: 1 },
          { week: 'Week 2', hours_studied: 18, quizzes_taken: 3, assignments_submitted: 2 },
          { week: 'Week 3', hours_studied: 12, quizzes_taken: 1, assignments_submitted: 1 },
          { week: 'Week 4', hours_studied: 20, quizzes_taken: 4, assignments_submitted: 2 },
          { week: 'Week 5', hours_studied: 16, quizzes_taken: 2, assignments_submitted: 1 },
          { week: 'Week 6', hours_studied: 19, quizzes_taken: 3, assignments_submitted: 2 }
        ],
        subjectPerformance: [
          { subject: 'Color Theory', score: 94.5, attempts: 4 },
          { subject: 'Typography', score: 91.2, attempts: 3 },
          { subject: 'Design Principles', score: 89.8, attempts: 5 },
          { subject: 'Digital Media', score: 87.3, attempts: 3 },
          { subject: 'User Experience', score: 92.1, attempts: 4 }
        ],
        subjectDistribution: [
          { name: 'Color Theory', value: 25, color: '#3b82f6' },
          { name: 'Typography', value: 20, color: '#10b981' },
          { name: 'Design Principles', value: 30, color: '#8b5cf6' },
          { name: 'Digital Media', value: 15, color: '#f59e0b' },
          { name: 'User Experience', value: 10, color: '#ef4444' }
        ]
      };
      
      setAnalytics(demoAnalytics);
    } catch (error) {
      console.error('Error fetching student analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="student-analytics-dashboard">
        <div className="analytics-loading">
          <div className="analytics-loading-spinner"></div>
          <div className="analytics-loading-text">Loading student analytics...</div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="student-analytics-dashboard">
        <div className="analytics-loading">
          <div className="analytics-loading-text">No analytics data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-analytics-dashboard">
      {/* Dashboard Header */}
      <div className="analytics-dashboard-header">
        <div className="student-info-section">
          <div className="student-avatar-container">
            <div className="student-avatar">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
          <div className="student-details">
            <h1 className="student-name">{student.name}'s Dashboard</h1>
            <div className="student-meta">
              <span className="student-id">STU{student.id.toString().padStart(3, '0')}</span>
              <span className="student-course">• Graphic Design</span>
            </div>
            <div className="student-email">{student.email}</div>
            <div className="student-status">
              <span className="status-badge">Active Student</span>
              <span className="status-indicator"></span>
              <span>Enrolled</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="close-button"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              padding: '0.5rem',
              color: '#ef4444',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-cards-grid">
        <div className="kpi-card quiz-average analytics-animate-in">
          <div className="kpi-card-header">
            <div className="kpi-card-icon quiz">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <div className="kpi-card-value">{analytics.kpis.quizAverage}%</div>
          <div className="kpi-card-label">Quiz Average</div>
          <div className="kpi-card-description">Average score across all quizzes</div>
        </div>

        <div className="kpi-card completion-rate analytics-animate-in">
          <div className="kpi-card-header">
            <div className="kpi-card-icon completion">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
          <div className="kpi-card-value">{analytics.kpis.completionRate}%</div>
          <div className="kpi-card-label">Completion Rate</div>
          <div className="kpi-card-description">Tasks completed successfully</div>
        </div>

        <div className="kpi-card gpa analytics-animate-in">
          <div className="kpi-card-header">
            <div className="kpi-card-icon gpa">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="kpi-card-value">{analytics.kpis.gpa}</div>
          <div className="kpi-card-label">GPA</div>
          <div className="kpi-card-description">Current grade point average</div>
        </div>

        <div className="kpi-card quizzes-taken analytics-animate-in">
          <div className="kpi-card-header">
            <div className="kpi-card-icon quizzes">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div className="kpi-card-value">{analytics.kpis.quizzesTaken}</div>
          <div className="kpi-card-label">Quizzes Taken</div>
          <div className="kpi-card-description">{analytics.kpis.assignmentsSubmitted} assignments submitted</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="section-title">
          <div className="section-icon">
            <BarChart3 className="w-6 h-6" />
          </div>
          Performance Analytics
        </div>
        
        <div className="charts-grid">
          {/* Performance Trend Chart */}
          <div className="chart-container analytics-animate-scale">
            <div className="chart-header">
              <div className="chart-title">
                <div className="chart-icon performance">
                  <TrendingUp className="w-5 h-5" />
                </div>
                Performance Trend
              </div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={analytics.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#6366f1', strokeWidth: 2 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Performance Chart */}
          <div className="chart-container analytics-animate-scale">
            <div className="chart-header">
              <div className="chart-title">
                <div className="chart-icon subjects">
                  <PieChart className="w-5 h-5" />
                </div>
                Subject Distribution
              </div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={analytics.subjectDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.subjectDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engagement Chart */}
          <div className="chart-container analytics-animate-scale">
            <div className="chart-header">
              <div className="chart-title">
                <div className="chart-icon engagement">
                  <Activity className="w-5 h-5" />
                </div>
                Weekly Engagement
              </div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={analytics.engagementData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="hours" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="activities" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="chart-container analytics-animate-scale">
            <div className="chart-header">
              <div className="chart-title">
                <div className="chart-icon progress">
                  <TrendingUp className="w-5 h-5" />
                </div>
                Monthly Progress
              </div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="quizzes" 
                    stackId="1" 
                    stroke="#3b82f6" 
                    fill="url(#colorQuizzes)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="assignments" 
                    stackId="1" 
                    stroke="#10b981" 
                    fill="url(#colorAssignments)" 
                  />
                  <defs>
                    <linearGradient id="colorQuizzes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorAssignments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Progress Chart */}
          <div className="chart-container analytics-animate-scale">
            <div className="chart-header">
              <div className="chart-title">
                <div className="chart-icon weekly">
                  <Activity className="w-5 h-5" />
                </div>
                Weekly Progress
              </div>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={analytics.weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="week" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#8b5cf6', strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activities" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#f59e0b', strokeWidth: 2 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Performance Section */}
      <div className="subject-performance-section">
        <div className="section-title">
          <div className="section-icon">
            <BookOpen className="w-6 h-6" />
          </div>
          Subject Performance
        </div>
        
        <div className="subject-list">
          {analytics.subjectPerformance.map((subject: any, index: number) => (
            <div key={index} className="subject-item analytics-animate-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="subject-header">
                <div className="subject-name">{subject.subject}</div>
                <div className="subject-score">{subject.score}%</div>
              </div>
              <div className="subject-meta">
                <span>{subject.attempts} attempts</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${subject.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentAnalyticsDashboard;
