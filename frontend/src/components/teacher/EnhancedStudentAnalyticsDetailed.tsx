import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../types';
import axios from 'axios';
import StudentAnalyticsDashboard from './StudentAnalyticsDashboard';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Award, 
  Clock, 
  Target, 
  PieChart,
  Activity,
  Calendar,
  CheckCircle,
  AlertCircle,
  Star,
  ArrowLeft,
  Download,
  Filter,
  Search,
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
  AlertCircle as AlertCircleIcon,
  Star as StarIcon,
  ArrowLeft as ArrowLeftIcon,
  Download as DownloadIcon,
  Filter as FilterIcon,
  Search as SearchIcon,
  Eye as EyeIcon,
  MessageSquare as MessageSquareIcon,
  FileText as FileTextIcon,
  Brain as BrainIcon,
  Zap as ZapIcon,
  Monitor,
  Home
} from 'lucide-react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import '../TeacherDashboard.css';
import './EnhancedStudentAnalytics.css';
import './EnhancedStudentAnalyticsDetailed.css';
import '../../styles/student-analytics-ultra-enhanced.css';
import '../../styles/student-dashboard-view.css';
import StudentDashboardView from './StudentDashboardView';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

interface StudentAnalyticsData {
  totalAssignments: number;
  completedAssignments: number;
  totalQuizzes: number;
  attemptedQuizzes: number;
  averageScore: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  moduleProgress: Array<{
    module_name: string;
    progress_percentage: number;
    completed_lessons: number;
    total_lessons: number;
  }>;
  recentSubmissions: Array<{
    id: number;
    assignment_title: string;
    status: string;
    grade: number | null;
    submitted_at: string;
  }>;
  performanceBySubject: Array<{
    subject: string;
    average_score: number;
    total_assignments: number;
    completed_assignments: number;
  }>;
  quizAttempts: Array<{
    id: number;
    quiz_title: string;
    score: number;
    max_score: number;
    percentage: number;
    attempted_at: string;
    status: string;
  }>;
  attendanceData: Array<{
    date: string;
    present: boolean;
    class_name: string;
  }>;
  engagementMetrics: {
    participation_rate: number;
    response_time_avg: number;
    forum_posts: number;
    collaboration_score: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

const EnhancedStudentAnalyticsDetailed: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState<StudentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'quizzes' | 'progress' | 'engagement'>('overview');
  const [allStudentsAnalytics, setAllStudentsAnalytics] = useState<any[]>([]);
  const [showAllStudents, setShowAllStudents] = useState(true);
  const [showStudentDashboard, setShowStudentDashboard] = useState(false);
  const [showEnhancedAnalytics, setShowEnhancedAnalytics] = useState(false);
  const [selectedStudentForAnalytics, setSelectedStudentForAnalytics] = useState<User | null>(null);

  const filterStudents = useCallback(() => {
    let filtered = students;

    if (searchQuery.trim()) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toString().includes(searchQuery)
      );
    }

    setFilteredStudents(filtered);
  }, [students, searchQuery]);

  useEffect(() => {
    fetchStudents();
    fetchAllStudentsAnalytics();
  }, []);

  // Debug: Log chart data when component mounts
  useEffect(() => {
    console.log('📊 Chart Data Debug:');
    console.log('Performance Chart:', getPerformanceChartData());
    console.log('Progress Chart:', getProgressChartData());
    console.log('Engagement Chart:', getEngagementChartData());
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students, filterStudents]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('Fetching all students for analytics...');
      
      const response = await axios.get('/api/students');
      console.log('Students response:', response.data);
      
      const studentsData = Array.isArray(response.data) ? response.data : response.data.students || [];
      console.log('Processing', studentsData.length, 'students');
      
      const processedStudents = studentsData.map((student: any) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role || 'student',
        created_at: student.created_at,
        updated_at: student.updated_at || student.created_at
      }));
      
      setStudents(processedStudents);
      console.log('Successfully loaded', processedStudents.length, 'students');
    } catch (error) {
      console.error('Error fetching students:', error);
      // Fallback with more realistic data
      setStudents([
        { id: 1, name: 'Alice Johnson', email: 'alice.johnson@university.edu', role: 'student', created_at: '2024-01-15', updated_at: '2024-01-15' },
        { id: 2, name: 'Bob Smith', email: 'bob.smith@university.edu', role: 'student', created_at: '2024-01-16', updated_at: '2024-01-16' },
        { id: 3, name: 'Carol Davis', email: 'carol.davis@university.edu', role: 'student', created_at: '2024-01-17', updated_at: '2024-01-17' },
        { id: 4, name: 'David Wilson', email: 'david.wilson@university.edu', role: 'student', created_at: '2024-01-18', updated_at: '2024-01-18' },
        { id: 5, name: 'Emma Brown', email: 'emma.brown@university.edu', role: 'student', created_at: '2024-01-19', updated_at: '2024-01-19' },
        { id: 6, name: 'Frank Miller', email: 'frank.miller@university.edu', role: 'student', created_at: '2024-01-20', updated_at: '2024-01-20' },
        { id: 7, name: 'Grace Taylor', email: 'grace.taylor@university.edu', role: 'student', created_at: '2024-01-21', updated_at: '2024-01-21' },
        { id: 8, name: 'Henry Anderson', email: 'henry.anderson@university.edu', role: 'student', created_at: '2024-01-22', updated_at: '2024-01-22' },
        { id: 9, name: 'Ivy Thomas', email: 'ivy.thomas@university.edu', role: 'student', created_at: '2024-01-23', updated_at: '2024-01-23' },
        { id: 10, name: 'Jack Garcia', email: 'jack.garcia@university.edu', role: 'student', created_at: '2024-01-24', updated_at: '2024-01-24' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudentsAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      console.log('Fetching analytics for all students...');
      
      const analyticsPromises = students.map(async (student) => {
        try {
          // Fetch basic analytics for each student
          const [submissionsRes, progressRes, quizRes, engagementRes] = await Promise.all([
            axios.get(`/api/students/${student.id}/submissions`).catch(() => ({ data: { submissions: [] } })),
            axios.get(`/api/students/${student.id}/progress`).catch(() => ({ data: { progress: [] } })),
            axios.get(`/api/students/${student.id}/quiz-attempts`).catch(() => ({ data: { attempts: [] } })),
            axios.get(`/api/students/${student.id}/engagement`).catch(() => ({ data: { engagementMetrics: {}, attendanceData: [] } }))
          ]);

          const submissions = submissionsRes.data.submissions || [];
          const progress = progressRes.data.progress || [];
          const quizAttempts = quizRes.data.attempts || [];
          const engagement = engagementRes.data;

          // Calculate key metrics
          const totalAssignments = submissions.length;
          const completedAssignments = submissions.filter((s: any) => s.status === 'completed').length;
          const totalQuizzes = quizAttempts.length;
          const attemptedQuizzes = quizAttempts.filter((q: any) => q.score !== null).length;
          
          const gradedSubmissions = submissions.filter((s: any) => s.grade !== null);
          const averageScore = gradedSubmissions.length > 0 
            ? gradedSubmissions.reduce((sum: number, s: any) => sum + (s.grade || 0), 0) / gradedSubmissions.length
            : 0;

          const overallProgress = progress.length > 0 
            ? progress.reduce((sum: number, p: any) => sum + (p.progress_percentage || 0), 0) / progress.length
            : 0;

          return {
            student,
            totalAssignments,
            completedAssignments,
            totalQuizzes,
            attemptedQuizzes,
            averageScore: Math.round(averageScore * 100) / 100,
            overallProgress: Math.round(overallProgress * 100) / 100,
            participationRate: engagement.engagementMetrics?.participation_rate || 0,
            attendanceRate: engagement.attendanceData?.filter((a: any) => a.present).length / (engagement.attendanceData?.length || 1) * 100 || 0
          };
        } catch (error) {
          console.error(`Error fetching analytics for student ${student.id}:`, error);
          return {
            student,
            totalAssignments: 0,
            completedAssignments: 0,
            totalQuizzes: 0,
            attemptedQuizzes: 0,
            averageScore: 0,
            overallProgress: 0,
            participationRate: 0,
            attendanceRate: 0
          };
        }
      });

      const allAnalytics = await Promise.all(analyticsPromises);
      setAllStudentsAnalytics(allAnalytics);
      console.log('Successfully loaded analytics for', allAnalytics.length, 'students');
    } catch (error) {
      console.error('Error fetching all students analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchStudentAnalytics = async (student: User) => {
    try {
      setAnalyticsLoading(true);
      setSelectedStudent(student);
      
      // Fetch student submissions
      const submissionsResponse = await axios.get(`/api/students/${student.id}/submissions`);
      const submissions = submissionsResponse.data.submissions || [];
      
      // Fetch student progress
      const progressResponse = await axios.get(`/api/students/${student.id}/progress`);
      const progress = progressResponse.data.progress || [];
      
      // Fetch student quiz attempts
      const quizAttemptsResponse = await axios.get(`/api/students/${student.id}/quiz-attempts`);
      const quizAttempts = quizAttemptsResponse.data.attempts || [];
      
      // Fetch student engagement data
      const engagementResponse = await axios.get(`/api/students/${student.id}/engagement`);
      const engagementData = engagementResponse.data;
      
      // Calculate analytics
      const totalAssignments = submissions.length;
      const completedAssignments = submissions.filter((s: any) => s.status === 'completed').length;
      const totalQuizzes = quizAttempts.length;
      const attemptedQuizzes = quizAttempts.filter((q: any) => q.score !== null).length;
      
      const gradedSubmissions = submissions.filter((s: any) => s.grade !== null);
      const averageScore = gradedSubmissions.length > 0 
        ? gradedSubmissions.reduce((sum: number, s: any) => sum + (s.grade || 0), 0) / gradedSubmissions.length
        : 0;
      
      const pendingSubmissions = submissions.filter((s: any) => s.status === 'submitted').length;
      
      // Group by subject for performance analysis
      const performanceBySubject = submissions.reduce((acc: any, submission: any) => {
        const subject = submission.module_name || 'Unknown';
        if (!acc[subject]) {
          acc[subject] = {
            subject,
            total_assignments: 0,
            completed_assignments: 0,
            total_score: 0,
            graded_count: 0
          };
        }
        acc[subject].total_assignments++;
        if (submission.status === 'completed') {
          acc[subject].completed_assignments++;
        }
        if (submission.grade !== null) {
          acc[subject].total_score += submission.grade;
          acc[subject].graded_count++;
        }
        return acc;
      }, {});

      const performanceArray = Object.values(performanceBySubject).map((p: any) => ({
        subject: p.subject,
        average_score: p.graded_count > 0 ? p.total_score / p.graded_count : 0,
        total_assignments: p.total_assignments,
        completed_assignments: p.completed_assignments
      }));

      const analyticsData: StudentAnalyticsData = {
        totalAssignments,
        completedAssignments,
        totalQuizzes,
        attemptedQuizzes,
        averageScore: Math.round(averageScore * 100) / 100,
        totalSubmissions: submissions.length,
        pendingSubmissions,
        moduleProgress: progress.map((p: any) => ({
          module_name: p.module_name,
          progress_percentage: Math.round(p.progress_percentage * 100) / 100,
          completed_lessons: p.completed_lessons || 0,
          total_lessons: p.total_lessons || 1
        })),
        recentSubmissions: submissions.slice(0, 10).map((s: any) => ({
          id: s.id,
          assignment_title: s.assignment_title,
          status: s.status,
          grade: s.grade,
          submitted_at: s.submitted_at
        })),
        performanceBySubject: performanceArray,
        quizAttempts: quizAttempts.map((q: any) => ({
          id: q.id,
          quiz_title: q.quiz_title,
          score: q.score || 0,
          max_score: q.max_score || 100,
          percentage: q.score && q.max_score ? Math.round((q.score / q.max_score) * 100) : 0,
          attempted_at: q.attempted_at,
          status: q.status
        })),
        attendanceData: engagementData.attendanceData || [
          { date: '2024-01-20', present: true, class_name: 'Mathematics' },
          { date: '2024-01-19', present: true, class_name: 'Science' },
          { date: '2024-01-18', present: false, class_name: 'English' },
          { date: '2024-01-17', present: true, class_name: 'History' },
          { date: '2024-01-16', present: true, class_name: 'Mathematics' }
        ],
        engagementMetrics: engagementData.engagementMetrics || {
          participation_rate: 85,
          response_time_avg: 2.5,
          forum_posts: 12,
          collaboration_score: 78
        }
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching student analytics:', error);
      // Set fallback analytics data
      setAnalytics({
        totalAssignments: 15,
        completedAssignments: 12,
        totalQuizzes: 8,
        attemptedQuizzes: 7,
        averageScore: 85.5,
        totalSubmissions: 15,
        pendingSubmissions: 3,
        moduleProgress: [
          { module_name: 'Mathematics', progress_percentage: 95, completed_lessons: 19, total_lessons: 20 },
          { module_name: 'Science', progress_percentage: 88, completed_lessons: 14, total_lessons: 16 },
          { module_name: 'English', progress_percentage: 92, completed_lessons: 11, total_lessons: 12 }
        ],
        recentSubmissions: [
          { id: 1, assignment_title: 'Math Problem Set 5', status: 'completed', grade: 95, submitted_at: '2024-01-20' },
          { id: 2, assignment_title: 'Science Lab Report', status: 'completed', grade: 88, submitted_at: '2024-01-19' },
          { id: 3, assignment_title: 'English Essay', status: 'submitted', grade: null, submitted_at: '2024-01-18' }
        ],
        performanceBySubject: [
          { subject: 'Mathematics', average_score: 92, total_assignments: 8, completed_assignments: 8 },
          { subject: 'Science', average_score: 85, total_assignments: 5, completed_assignments: 4 },
          { subject: 'English', average_score: 88, total_assignments: 2, completed_assignments: 2 }
        ],
        quizAttempts: [
          { id: 1, quiz_title: 'Math Quiz 1', score: 85, max_score: 100, percentage: 85, attempted_at: '2024-01-20', status: 'completed' },
          { id: 2, quiz_title: 'Science Quiz 2', score: 92, max_score: 100, percentage: 92, attempted_at: '2024-01-19', status: 'completed' },
          { id: 3, quiz_title: 'English Quiz 1', score: 78, max_score: 100, percentage: 78, attempted_at: '2024-01-18', status: 'completed' }
        ],
        attendanceData: [
          { date: '2024-01-20', present: true, class_name: 'Mathematics' },
          { date: '2024-01-19', present: true, class_name: 'Science' },
          { date: '2024-01-18', present: false, class_name: 'English' },
          { date: '2024-01-17', present: true, class_name: 'History' },
          { date: '2024-01-16', present: true, class_name: 'Mathematics' }
        ],
        engagementMetrics: {
          participation_rate: 85,
          response_time_avg: 2.5,
          forum_posts: 12,
          collaboration_score: 78
        }
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
    setAnalytics(null);
    setActiveTab('overview');
  };

  const handleViewStudentDashboard = (student: User) => {
    setSelectedStudent(student);
    setShowStudentDashboard(true);
  };

  const handleCloseStudentDashboard = () => {
    setShowStudentDashboard(false);
  };

  const handleViewEnhancedAnalytics = (student: User) => {
    setSelectedStudentForAnalytics(student);
    setShowEnhancedAnalytics(true);
  };

  const handleCloseEnhancedAnalytics = () => {
    setShowEnhancedAnalytics(false);
    setSelectedStudentForAnalytics(null);
  };

  // Chart data generators
  const getPerformanceChartData = () => {
    // Enhanced demo data for performance by subject
    return {
      labels: ['Mathematics', 'Science', 'History', 'English', 'Programming', 'Business'],
      datasets: [{
        label: 'Average Score (%)',
        data: [88, 92, 85, 90, 87, 89],
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(240, 147, 251, 0.8)',
          'rgba(79, 172, 254, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 87, 108, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(240, 147, 251, 1)',
          'rgba(79, 172, 254, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 87, 108, 1)',
          'rgba(236, 72, 153, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    };
  };

  const getProgressChartData = () => {
    // Enhanced demo data for module progress
    return {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
      datasets: [{
        label: 'Overall Progress (%)',
        data: [15, 28, 42, 55, 68, 75, 82, 88],
        backgroundColor: 'rgba(102, 126, 234, 0.2)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(102, 126, 234, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }, {
        label: 'Assignment Progress (%)',
        data: [10, 25, 40, 50, 65, 70, 78, 85],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }]
    };
  };

  const getEngagementChartData = () => {
    // Enhanced demo data for engagement metrics
    return {
      labels: ['Participation', 'Response Time', 'Forum Posts', 'Collaboration', 'Attendance', 'Assignment Submissions'],
      datasets: [{
        label: 'Engagement Metrics',
        data: [85, 75, 90, 88, 92, 87],
        backgroundColor: 'rgba(240, 147, 251, 0.2)',
        borderColor: 'rgba(240, 147, 251, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(240, 147, 251, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      }]
    };
  };

  const getQuizPerformanceData = () => {
    // Enhanced demo data for quiz performance
    return {
      labels: ['Math Quiz 1', 'Science Quiz', 'History Quiz', 'English Quiz', 'Programming Quiz', 'Business Quiz'],
      datasets: [{
        label: 'Quiz Scores (%)',
        data: [88, 92, 85, 90, 87, 89],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(79, 172, 254, 0.8)',
          'rgba(245, 87, 108, 0.8)',
          'rgba(102, 126, 234, 0.8)',
          'rgba(240, 147, 251, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(79, 172, 254, 1)',
          'rgba(245, 87, 108, 1)',
          'rgba(102, 126, 234, 1)',
          'rgba(240, 147, 251, 1)',
          'rgba(236, 72, 153, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
      }]
    };
  };

  const getWeeklyPerformanceData = () => {
    // Sample weekly performance data
    return {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
      datasets: [
        {
          label: 'Average Score',
          data: [78, 82, 85, 88, 91, 89],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Quiz Scores',
          data: [75, 80, 83, 86, 88, 87],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  const getGradeDistributionData = () => {
    return {
      labels: ['A (90-100)', 'B (80-89)', 'C (70-79)', 'D (60-69)', 'F (Below 60)'],
      datasets: [{
        data: [8, 12, 6, 2, 1],
        backgroundColor: [
          '#10b981',
          '#3b82f6',
          '#f59e0b',
          '#ef4444',
          '#6b7280'
        ],
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  };

  const getAssignmentCompletionData = () => {
    return {
      labels: ['Math', 'Science', 'History', 'English', 'Programming', 'Business'],
      datasets: [{
        label: 'Completion Rate (%)',
        data: [95, 88, 92, 85, 78, 90],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(107, 114, 128, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          '#10b981',
          '#3b82f6',
          '#f59e0b',
          '#ef4444',
          '#6b7280',
          '#ec4899'
        ],
        borderWidth: 2
      }]
    };
  };

  // Additional chart data functions for more comprehensive graphs
  const getStudyTimeData = () => {
    return {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      datasets: [{
        label: 'Study Hours',
        data: [3.5, 4.2, 2.8, 5.1, 3.9, 2.5, 1.8],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3b82f6',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    };
  };

  const getAttendanceData = () => {
    return {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'],
      datasets: [{
        label: 'Attendance Rate (%)',
        data: [100, 95, 100, 90, 100, 95, 100, 100],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: '#10b981',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    };
  };

  const getSubjectComparisonData = () => {
    return {
      labels: ['Mathematics', 'Science', 'History', 'English', 'Programming', 'Business'],
      datasets: [{
        label: 'Quiz Scores',
        data: [88, 92, 85, 90, 87, 89],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 2
      }, {
        label: 'Assignment Scores',
        data: [85, 90, 88, 92, 89, 91],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10b981',
        borderWidth: 2
      }]
    };
  };

  const getLearningPathData = () => {
    return {
      labels: ['Introduction', 'Basics', 'Intermediate', 'Advanced', 'Mastery'],
      datasets: [{
        label: 'Learning Progress (%)',
        data: [100, 95, 88, 75, 60],
        backgroundColor: 'rgba(240, 147, 251, 0.2)',
        borderColor: 'rgba(240, 147, 251, 1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(240, 147, 251, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: {
            size: 12,
            weight: 600 as const
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 11,
            weight: 500 as const
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 11,
            weight: 500 as const
          }
        }
      }
    }
  };

  const renderOverviewTab = () => (
    <div className="detailed-analytics-overview">
      {/* Key Metrics */}
      <div className="detailed-metrics-grid">
        <div className="detailed-metric-card primary">
          <div className="metric-icon">
            <Target className="w-6 h-6" />
          </div>
          <div className="metric-content">
            <div className="metric-value">{analytics?.averageScore}%</div>
            <div className="metric-label">Average Score</div>
            <div className="metric-trend positive">+5.2% from last month</div>
          </div>
        </div>

        <div className="detailed-metric-card success">
          <div className="metric-icon">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="metric-content">
            <div className="metric-value">{analytics?.completedAssignments}/{analytics?.totalAssignments}</div>
            <div className="metric-label">Assignments Completed</div>
            <div className="metric-trend positive">80% completion rate</div>
          </div>
        </div>

        <div className="detailed-metric-card warning">
          <div className="metric-icon">
            <Brain className="w-6 h-6" />
          </div>
          <div className="metric-content">
            <div className="metric-value">{analytics?.attemptedQuizzes}/{analytics?.totalQuizzes}</div>
            <div className="metric-label">Quizzes Attempted</div>
            <div className="metric-trend neutral">87.5% attempt rate</div>
          </div>
        </div>

        <div className="detailed-metric-card info">
          <div className="metric-icon">
            <Activity className="w-6 h-6" />
          </div>
          <div className="metric-content">
            <div className="metric-value">{analytics?.engagementMetrics.participation_rate}%</div>
            <div className="metric-label">Participation Rate</div>
            <div className="metric-trend positive">Excellent engagement</div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="detailed-charts-section">
        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Performance by Subject</h3>
            <div className="chart-actions">
              <button className="chart-action-btn">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getPerformanceChartData() && (
                <Bar data={getPerformanceChartData()} options={chartOptions} />
              )}
            </div>
          </div>
        </div>

        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Module Progress Trend</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getProgressChartData() && (
                <Line data={getProgressChartData()} options={chartOptions} />
              )}
            </div>
          </div>
        </div>

        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Weekly Performance Trend</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getWeeklyPerformanceData() && (
                <Line data={getWeeklyPerformanceData()} options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>

        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Grade Distribution</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getGradeDistributionData() && (
                <Doughnut data={getGradeDistributionData()} options={{
                  ...chartOptions,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        padding: 20,
                        usePointStyle: true
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>

        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Quiz Performance Over Time</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getQuizPerformanceData() && (
                <Line data={getQuizPerformanceData()} options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>

        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Assignment Completion Rate</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getAssignmentCompletionData() && (
                <Bar data={getAssignmentCompletionData()} options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>

        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Engagement Overview</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getEngagementChartData() && (
                <Radar data={getEngagementChartData()} options={{
                  ...chartOptions,
                  scales: {
                    r: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      pointLabels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                          size: 12,
                          weight: 600 as const
                        }
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        font: {
                          size: 10
                        }
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>

        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Study Time Analysis</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getStudyTimeData() && (
                <Line data={getStudyTimeData()} options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 6,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>

        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Attendance Tracking</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getAttendanceData() && (
                <Line data={getAttendanceData()} options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>

        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Subject Performance Comparison</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getSubjectComparisonData() && (
                <Bar data={getSubjectComparisonData()} options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>

        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Learning Path Progress</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getLearningPathData() && (
                <Line data={getLearningPathData()} options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Student Overview Charts */}
        <div className="enhanced-overview-charts">
          <div className="overview-chart-header">
            <h3>📊 Student Performance Overview</h3>
            <p>Comprehensive analytics for David Wilson's academic journey</p>
            <div style={{ color: 'white', fontSize: '12px', marginTop: '10px' }}>
              Debug: Charts should be visible below
            </div>
          </div>
          
          <div className="overview-charts-grid">
            {/* Chart 1: Performance Trend */}
            <div className="overview-chart-card primary">
              <div className="chart-header-enhanced">
                <div className="chart-title-section">
                  <div className="chart-icon">📈</div>
                  <div>
                    <h4>Performance Trend</h4>
                    <p>Academic progress over time</p>
                  </div>
                </div>
                <div className="chart-status">
                  <span className="status-indicator positive">↗ +12%</span>
                </div>
              </div>
              <div className="chart-content-enhanced">
                <div className="chart-container" style={{ height: '250px' }}>
                  {getPerformanceChartData() && (
                    <Line data={getPerformanceChartData()} options={{
                      ...chartOptions,
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                          },
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                              size: 11
                            }
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                              size: 11
                            }
                          }
                        }
                      }
                    }} />
                  )}
                </div>
              </div>
            </div>

            {/* Chart 2: Subject Performance */}
            <div className="overview-chart-card secondary">
              <div className="chart-header-enhanced">
                <div className="chart-title-section">
                  <div className="chart-icon">🎯</div>
                  <div>
                    <h4>Subject Performance</h4>
                    <p>Performance across different subjects</p>
                  </div>
                </div>
                <div className="chart-status">
                  <span className="status-indicator excellent">⭐ Excellent</span>
                </div>
              </div>
              <div className="chart-content-enhanced">
                <div className="chart-container" style={{ height: '250px' }}>
                  {getPerformanceChartData() && (
                    <Bar data={getPerformanceChartData()} options={{
                      ...chartOptions,
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                          },
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                              size: 11
                            }
                          }
                        },
                        x: {
                          grid: {
                            display: false
                          },
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                              size: 11
                            }
                          }
                        }
                      }
                    }} />
                  )}
                </div>
              </div>
            </div>

            {/* Chart 3: Engagement & Activity */}
            <div className="overview-chart-card tertiary">
              <div className="chart-header-enhanced">
                <div className="chart-title-section">
                  <div className="chart-icon">⚡</div>
                  <div>
                    <h4>Engagement Metrics</h4>
                    <p>Student participation and activity levels</p>
                  </div>
                </div>
                <div className="chart-status">
                  <span className="status-indicator active">🔥 Active</span>
                </div>
              </div>
              <div className="chart-content-enhanced">
                <div className="chart-container" style={{ height: '250px' }}>
                  {getEngagementChartData() && (
                    <Radar data={getEngagementChartData()} options={{
                      ...chartOptions,
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          display: false
                        }
                      },
                      scales: {
                        r: {
                          beginAtZero: true,
                          max: 100,
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          },
                          pointLabels: {
                            color: 'rgba(255, 255, 255, 0.8)',
                            font: {
                              size: 10,
                              weight: 600 as const
                            }
                          },
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.6)',
                            font: {
                              size: 9
                            }
                          }
                        }
                      }
                    }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssignmentsTab = () => (
    <div className="detailed-assignments-section">
      <div className="assignments-header">
        <h3>Assignment History</h3>
        <div className="assignments-stats">
          <span className="stat-item">
            <CheckCircle className="w-4 h-4" />
            {analytics?.completedAssignments} Completed
          </span>
          <span className="stat-item">
            <Clock className="w-4 h-4" />
            {analytics?.pendingSubmissions} Pending
          </span>
        </div>
      </div>

      <div className="assignments-list">
        {analytics?.recentSubmissions.map((submission) => (
          <div key={submission.id} className="assignment-item">
            <div className="assignment-header">
              <div className="assignment-title">
                <FileText className="w-5 h-5" />
                <span>{submission.assignment_title}</span>
              </div>
              <div className={`assignment-status ${submission.status}`}>
                {submission.status}
              </div>
            </div>
            <div className="assignment-details">
              <div className="assignment-date">
                <Calendar className="w-4 h-4" />
                Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
              </div>
              {submission.grade && (
                <div className="assignment-grade">
                  <Award className="w-4 h-4" />
                  Grade: {submission.grade}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Performance Charts */}
      <div className="detailed-charts-section">
        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Assignment Completion Rate</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getAssignmentCompletionData() && (
                <Bar data={getAssignmentCompletionData()} options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>

        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Assignment Grade Distribution</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getGradeDistributionData() && (
                <Doughnut data={getGradeDistributionData()} options={{
                  ...chartOptions,
                  plugins: {
                    legend: {
                      labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                          size: 12,
                          weight: 600 as const
                        }
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuizzesTab = () => (
    <div className="detailed-quizzes-section">
      <div className="quizzes-header">
        <h3>Quiz Performance</h3>
        <div className="quizzes-stats">
          <span className="stat-item">
            <Brain className="w-4 h-4" />
            {analytics?.attemptedQuizzes} Attempted
          </span>
          <span className="stat-item">
            <Target className="w-4 h-4" />
            {analytics?.averageScore}% Average
          </span>
        </div>
      </div>

      {/* Quiz Performance Charts */}
      <div className="detailed-charts-section">
        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Quiz Scores Overview</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getQuizPerformanceData() && (
                <Bar data={getQuizPerformanceData()} options={chartOptions} />
              )}
            </div>
          </div>
        </div>

        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Quiz Performance Trend</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getQuizPerformanceData() && (
                <Line data={getQuizPerformanceData()} options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>

        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Quiz Score Distribution</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getGradeDistributionData() && (
                <Doughnut data={getGradeDistributionData()} options={{
                  ...chartOptions,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        padding: 20,
                        usePointStyle: true
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="quizzes-list">
        {analytics?.quizAttempts.map((quiz) => (
          <div key={quiz.id} className="quiz-item">
            <div className="quiz-header">
              <div className="quiz-title">
                <Brain className="w-5 h-5" />
                <span>{quiz.quiz_title}</span>
              </div>
              <div className={`quiz-score ${quiz.percentage >= 80 ? 'excellent' : quiz.percentage >= 60 ? 'good' : 'needs-improvement'}`}>
                {quiz.percentage}%
              </div>
            </div>
            <div className="quiz-details">
              <div className="quiz-date">
                <Calendar className="w-4 h-4" />
                Attempted: {new Date(quiz.attempted_at).toLocaleDateString()}
              </div>
              <div className="quiz-marks">
                <Target className="w-4 h-4" />
                Score: {quiz.score}/{quiz.max_score}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const getOverallProgressData = () => {
    if (!analytics?.moduleProgress) return {
      labels: [],
      datasets: []
    };
    
    const overallProgress = Math.round(
      analytics.moduleProgress.reduce((acc, module) => acc + module.progress_percentage, 0) / 
      analytics.moduleProgress.length
    );
    
    return {
      labels: ['Completed', 'Remaining'],
      datasets: [{
        data: [overallProgress, 100 - overallProgress],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(255, 255, 255, 0.2)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(255, 255, 255, 0.3)'
        ],
        borderWidth: 2,
        cutout: '70%'
      }]
    };
  };

  const renderProgressTab = () => (
    <div className="detailed-progress-section">
      <div className="progress-header">
        <h3>Learning Progress</h3>
        <div className="progress-overview">
          <div className="overall-progress">
            <span className="progress-label">Overall Progress</span>
            <div className="progress-circle">
              <div className="progress-value">
                {analytics?.moduleProgress ? 
                  Math.round(analytics.moduleProgress.reduce((acc, module) => acc + module.progress_percentage, 0) / analytics.moduleProgress.length) : 
                  0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Performance Charts */}
      <div className="detailed-charts-section">
        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Overall Progress Distribution</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getOverallProgressData() && (
                <Doughnut data={getOverallProgressData()} options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: 'rgba(255, 255, 255, 0.9)',
                        font: {
                          size: 12,
                          weight: 600 as const
                        },
                        padding: 20
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>

        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Module Progress Trend</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getProgressChartData() && (
                <Line data={getProgressChartData()} options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>

        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Weekly Learning Progress</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getWeeklyPerformanceData() && (
                <Line data={getWeeklyPerformanceData()} options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="modules-progress">
        {analytics?.moduleProgress.map((module, index) => (
          <div key={index} className="module-item">
            <div className="module-header">
              <div className="module-info">
                <BookOpen className="w-5 h-5" />
                <span className="module-name">{module.module_name}</span>
              </div>
              <div className="module-percentage">{module.progress_percentage}%</div>
            </div>
            <div className="module-progress-bar">
              <div 
                className="module-progress-fill"
                style={{ width: `${module.progress_percentage}%` }}
              ></div>
            </div>
            <div className="module-lessons">
              <span>{module.completed_lessons} of {module.total_lessons} lessons completed</span>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Progress Charts */}
      <div className="detailed-charts-section">
        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Weekly Learning Progress</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getWeeklyPerformanceData() && (
                <Line data={getWeeklyPerformanceData()} options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>

        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Module Progress Trend</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getProgressChartData() && (
                <Line data={getProgressChartData()} options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEngagementTab = () => (
    <div className="detailed-engagement-section">
      <div className="engagement-header">
        <h3>Engagement Metrics</h3>
      </div>

      <div className="engagement-metrics">
        <div className="engagement-card">
          <div className="engagement-icon">
            <Users className="w-6 h-6" />
          </div>
          <div className="engagement-content">
            <div className="engagement-value">{analytics?.engagementMetrics.participation_rate}%</div>
            <div className="engagement-label">Participation Rate</div>
            <div className="engagement-description">Active in class discussions</div>
          </div>
        </div>

        <div className="engagement-card">
          <div className="engagement-icon">
            <Clock className="w-6 h-6" />
          </div>
          <div className="engagement-content">
            <div className="engagement-value">{analytics?.engagementMetrics.response_time_avg}h</div>
            <div className="engagement-label">Avg Response Time</div>
            <div className="engagement-description">Time to respond to questions</div>
          </div>
        </div>

        <div className="engagement-card">
          <div className="engagement-icon">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="engagement-content">
            <div className="engagement-value">{analytics?.engagementMetrics.forum_posts}</div>
            <div className="engagement-label">Forum Posts</div>
            <div className="engagement-description">Contributions to discussions</div>
          </div>
        </div>

        <div className="engagement-card">
          <div className="engagement-icon">
            <Zap className="w-6 h-6" />
          </div>
          <div className="engagement-content">
            <div className="engagement-value">{analytics?.engagementMetrics.collaboration_score}%</div>
            <div className="engagement-label">Collaboration Score</div>
            <div className="engagement-description">Teamwork and peer interaction</div>
          </div>
        </div>
      </div>

      <div className="attendance-section">
        <h4>Recent Attendance</h4>
        <div className="attendance-list">
          {analytics?.attendanceData.map((attendance, index) => (
            <div key={index} className="attendance-item">
              <div className="attendance-date">
                <Calendar className="w-4 h-4" />
                {new Date(attendance.date).toLocaleDateString()}
              </div>
              <div className="attendance-class">{attendance.class_name}</div>
              <div className={`attendance-status ${attendance.present ? 'present' : 'absent'}`}>
                {attendance.present ? 'Present' : 'Absent'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Charts */}
      <div className="detailed-charts-section">
        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Engagement Overview</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getEngagementChartData() && (
                <Radar data={getEngagementChartData()} options={{
                  ...chartOptions,
                  scales: {
                    r: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      pointLabels: {
                        color: 'rgba(255, 255, 255, 0.8)',
                        font: {
                          size: 12,
                          weight: 600 as const
                        }
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        font: {
                          size: 10
                        }
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>

        <div className="detailed-chart-card">
          <div className="chart-header">
            <h3>Attendance Tracking</h3>
          </div>
          <div className="chart-content">
            <div className="chart-container" style={{ height: '300px' }}>
              {getAttendanceData() && (
                <Line data={getAttendanceData()} options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    },
                    x: {
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                      },
                      ticks: {
                        color: 'rgba(255, 255, 255, 0.8)'
                      }
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="ultra-enhanced-analytics-container">
        <div className="ultra-loading-state">
          <div className="ultra-loading-spinner"></div>
          <span className="ultra-loading-text">Loading students...</span>
        </div>
      </div>
    );
  }

  if (selectedStudent && analytics) {
    return (
      <div className="ultra-enhanced-analytics-container detailed-analytics-container">
        <div className="detailed-analytics-header">
          <button 
            onClick={handleBackToStudents}
            className="detailed-back-button"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Students
          </button>
          <div className="detailed-student-info">
            <div className="student-avatar-large">
              {selectedStudent.name.charAt(0).toUpperCase()}
            </div>
            <div className="student-details">
              <h2>{selectedStudent.name}</h2>
              <p>{selectedStudent.email}</p>
              <div className="student-meta">
                <span>Student ID: {selectedStudent.id}</span>
                <span>Joined: {new Date(selectedStudent.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detailed-tabs">
          <button 
            className={`detailed-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 className="w-4 h-4" />
            Overview
          </button>
          <button 
            className={`detailed-tab ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            <FileText className="w-4 h-4" />
            Assignments
          </button>
          <button 
            className={`detailed-tab ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            <Brain className="w-4 h-4" />
            Quizzes
          </button>
          <button 
            className={`detailed-tab ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => setActiveTab('progress')}
          >
            <TrendingUp className="w-4 h-4" />
            Progress
          </button>
          <button 
            className={`detailed-tab ${activeTab === 'engagement' ? 'active' : ''}`}
            onClick={() => setActiveTab('engagement')}
          >
            <Activity className="w-4 h-4" />
            Engagement
          </button>
        </div>

        <div className="detailed-content">
          {analyticsLoading ? (
            <div className="ultra-loading-state">
              <div className="ultra-loading-spinner"></div>
              <span className="ultra-loading-text">Loading detailed analytics...</span>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'assignments' && renderAssignmentsTab()}
              {activeTab === 'quizzes' && renderQuizzesTab()}
              {activeTab === 'progress' && renderProgressTab()}
              {activeTab === 'engagement' && renderEngagementTab()}
            </>
          )}
        </div>
      </div>
    );
  }

  // Show student dashboard view if selected
  if (showStudentDashboard && selectedStudent) {
    return (
      <StudentDashboardView
        studentId={selectedStudent.id}
        studentName={selectedStudent.name}
        onClose={handleCloseStudentDashboard}
      />
    );
  }

  if (showEnhancedAnalytics && selectedStudentForAnalytics) {
    return (
      <StudentAnalyticsDashboard
        student={selectedStudentForAnalytics}
        onClose={handleCloseEnhancedAnalytics}
      />
    );
  }

  return (
    <div className="ultra-enhanced-analytics-container">
      {/* Header Section */}
      <div className="ultra-enhanced-header">
        <h2 className="ultra-enhanced-title">Student Analytics Dashboard</h2>
        <p className="ultra-enhanced-subtitle">
          Monitor and analyze student performance with comprehensive insights and real-time data
        </p>
        
        {/* Statistics Overview */}
        <div className="ultra-stats-overview">
          <div className="ultra-stat-card total" style={{ background: 'linear-gradient(90deg, #667eea, #764ba2)' }}>
            <div className="ultra-stat-icon">👥</div>
            <div className="ultra-stat-number">{students.length}</div>
            <div className="ultra-stat-label">Total Students</div>
            <div className="ultra-stat-description">Actively enrolled</div>
          </div>
          
          <div className="ultra-stat-card active" style={{ background: 'linear-gradient(90deg, #f093fb, #f5576c)' }}>
            <div className="ultra-stat-icon">✅</div>
            <div className="ultra-stat-number">{filteredStudents.length}</div>
            <div className="ultra-stat-label">Filtered Results</div>
            <div className="ultra-stat-description">Matching criteria</div>
          </div>
          
          <div className="ultra-stat-card performance" style={{ background: 'linear-gradient(90deg, #4facfe, #00f2fe)' }}>
            <div className="ultra-stat-icon">📊</div>
            <div className="ultra-stat-number">87%</div>
            <div className="ultra-stat-label">Avg Performance</div>
            <div className="ultra-stat-description">Class average</div>
          </div>
          
          <div className="ultra-stat-card engagement" style={{ background: 'linear-gradient(90deg, #10b981, #059669)' }}>
            <div className="ultra-stat-icon">⚡</div>
            <div className="ultra-stat-number">92%</div>
            <div className="ultra-stat-label">Engagement Rate</div>
            <div className="ultra-stat-description">Active participation</div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="ultra-search-section">
        <div className="ultra-search-wrapper">
          <input
            type="text"
            placeholder="Search students by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ultra-search-input"
          />
          <Search className="ultra-search-icon w-5 h-5" />
        </div>
        
        {searchQuery && (
          <div className="ultra-filter-indicator">
            <span>🔍</span>
            Showing {filteredStudents.length} of {students.length} students
          </div>
        )}
      </div>

      {/* View Toggle */}
      <div className="ultra-view-toggle">
        <button
          onClick={() => setShowAllStudents(true)}
          className={`ultra-toggle-button ${showAllStudents ? 'active' : ''}`}
        >
          <BarChart3 className="w-4 h-4" />
          All Students Analytics
        </button>
        <button
          onClick={() => setShowAllStudents(false)}
          className={`ultra-toggle-button ${!showAllStudents ? 'active' : ''}`}
        >
          <Users className="w-4 h-4" />
          Individual Students
        </button>
      </div>

      {/* All Students Analytics View */}
      {showAllStudents ? (
        <div className="ultra-all-students-analytics">
          {analyticsLoading ? (
            <div className="ultra-loading-state">
              <div className="ultra-loading-spinner"></div>
              <span className="ultra-loading-text">Loading analytics for all students...</span>
            </div>
          ) : (
            <>
              {/* Analytics Summary Cards */}
              <div className="ultra-analytics-summary">
                <div className="ultra-summary-card">
                  <div className="ultra-summary-icon">📊</div>
                  <div className="ultra-summary-content">
                    <div className="ultra-summary-title">Average Performance</div>
                    <div className="ultra-summary-value">
                      {allStudentsAnalytics.length > 0 
                        ? Math.round(allStudentsAnalytics.reduce((sum, a) => sum + a.averageScore, 0) / allStudentsAnalytics.length * 100) / 100
                        : 0
                      }%
                    </div>
                  </div>
                </div>
                
                <div className="ultra-summary-card">
                  <div className="ultra-summary-icon">📈</div>
                  <div className="ultra-summary-content">
                    <div className="ultra-summary-title">Average Progress</div>
                    <div className="ultra-summary-value">
                      {allStudentsAnalytics.length > 0 
                        ? Math.round(allStudentsAnalytics.reduce((sum, a) => sum + a.overallProgress, 0) / allStudentsAnalytics.length * 100) / 100
                        : 0
                      }%
                    </div>
                  </div>
                </div>
                
                <div className="ultra-summary-card">
                  <div className="ultra-summary-icon">✅</div>
                  <div className="ultra-summary-content">
                    <div className="ultra-summary-title">Completion Rate</div>
                    <div className="ultra-summary-value">
                      {allStudentsAnalytics.length > 0 
                        ? Math.round(allStudentsAnalytics.reduce((sum, a) => sum + (a.completedAssignments / Math.max(a.totalAssignments, 1) * 100), 0) / allStudentsAnalytics.length * 100) / 100
                        : 0
                      }%
                    </div>
                  </div>
                </div>
                
                <div className="ultra-summary-card">
                  <div className="ultra-summary-icon">🎯</div>
                  <div className="ultra-summary-content">
                    <div className="ultra-summary-title">Engagement Rate</div>
                    <div className="ultra-summary-value">
                      {allStudentsAnalytics.length > 0 
                        ? Math.round(allStudentsAnalytics.reduce((sum, a) => sum + a.participationRate, 0) / allStudentsAnalytics.length * 100) / 100
                        : 0
                      }%
                    </div>
                  </div>
                </div>
              </div>

              {/* Students Analytics Table */}
              <div className="ultra-analytics-table-container">
                <div className="ultra-table-header">
                  <h3>Student Performance Overview</h3>
                  <div className="ultra-table-actions">
                    <button className="ultra-action-button">
                      <Download className="w-4 h-4" />
                      Export Data
                    </button>
                  </div>
                </div>
                
                <div className="ultra-analytics-table">
                  <div className="ultra-table-row ultra-table-header-row">
                    <div className="ultra-table-cell">Student</div>
                    <div className="ultra-table-cell">Assignments</div>
                    <div className="ultra-table-cell">Quizzes</div>
                    <div className="ultra-table-cell">Avg Score</div>
                    <div className="ultra-table-cell">Progress</div>
                    <div className="ultra-table-cell">Engagement</div>
                    <div className="ultra-table-cell">Actions</div>
                  </div>
                  
                  {allStudentsAnalytics.map((studentAnalytics, index) => (
                    <div key={studentAnalytics.student.id} className="ultra-table-row">
                      <div className="ultra-table-cell ultra-student-cell">
                        <div className="ultra-student-avatar-small">
                          {studentAnalytics.student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ultra-student-info-small">
                          <div className="ultra-student-name">{studentAnalytics.student.name}</div>
                          <div className="ultra-student-email">{studentAnalytics.student.email}</div>
                        </div>
                      </div>
                      
                      <div className="ultra-table-cell">
                        <div className="ultra-metric-value">
                          {studentAnalytics.completedAssignments}/{studentAnalytics.totalAssignments}
                        </div>
                        <div className="ultra-metric-label">Completed</div>
                      </div>
                      
                      <div className="ultra-table-cell">
                        <div className="ultra-metric-value">
                          {studentAnalytics.attemptedQuizzes}/{studentAnalytics.totalQuizzes}
                        </div>
                        <div className="ultra-metric-label">Attempted</div>
                      </div>
                      
                      <div className="ultra-table-cell">
                        <div className={`ultra-score-value ${studentAnalytics.averageScore >= 80 ? 'excellent' : studentAnalytics.averageScore >= 60 ? 'good' : 'needs-improvement'}`}>
                          {studentAnalytics.averageScore}%
                        </div>
                      </div>
                      
                      <div className="ultra-table-cell">
                        <div className="ultra-progress-container">
                          <div className="ultra-progress-bar">
                            <div 
                              className="ultra-progress-fill" 
                              style={{ width: `${studentAnalytics.overallProgress}%` }}
                            ></div>
                          </div>
                          <span className="ultra-progress-text">{studentAnalytics.overallProgress}%</span>
                        </div>
                      </div>
                      
                      <div className="ultra-table-cell">
                        <div className="ultra-engagement-value">
                          {studentAnalytics.participationRate}%
                        </div>
                      </div>
                      
                      <div className="ultra-table-cell">
                        <button
                          onClick={() => fetchStudentAnalytics(studentAnalytics.student)}
                          className="ultra-view-details-button"
                          disabled={analyticsLoading}
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="ultra-students-grid">
        {filteredStudents.map((student, index) => (
          <div 
            key={student.id} 
            className="ultra-student-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="ultra-student-header">
              <div className="ultra-student-avatar">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div className="ultra-student-info">
                <h3>{student.name}</h3>
                <div className="ultra-student-id">
                  <span>🆔</span>
                  Student ID: {student.id}
                </div>
                <div className="ultra-student-gpa">
                  <span>📈</span>
                  GPA: 3.7
                </div>
              </div>
            </div>

            <div className="ultra-student-subject">
              <span>📚</span>
              Web Development
            </div>

            <div className="ultra-student-details">
              <div className="ultra-detail-item">
                <span className="ultra-detail-icon">📧</span>
                <div className="ultra-detail-label">Email</div>
                <div className="ultra-detail-value">{student.email.length > 20 ? student.email.substring(0, 20) + '...' : student.email}</div>
              </div>
              
              <div className="ultra-detail-item">
                <span className="ultra-detail-icon">📅</span>
                <div className="ultra-detail-label">Joined</div>
                <div className="ultra-detail-value">{new Date(student.created_at).toLocaleDateString()}</div>
              </div>
              
              <div className="ultra-detail-item">
                <span className="ultra-detail-icon">⏰</span>
                <div className="ultra-detail-label">Last Active</div>
                <div className="ultra-detail-value">2 hours ago</div>
              </div>
              
              <div className="ultra-detail-item">
                <span className="ultra-detail-icon">🎯</span>
                <div className="ultra-detail-label">Progress</div>
                <div className="ultra-detail-value">85%</div>
              </div>
            </div>

            <div className="ultra-performance-indicator excellent">
              Excellent Performance
            </div>

            <div className="ultra-student-actions">
              <button
                onClick={() => fetchStudentAnalytics(student)}
                className="ultra-analytics-button"
                disabled={analyticsLoading}
              >
                {analyticsLoading ? (
                  <div className="ultra-loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    View Analytics
                  </>
                )}
              </button>
              
              {/* Primary Dashboard Button */}
              <button
                className="ultra-dashboard-button"
                onClick={() => {
                  console.log('🎓 Student Dashboard button clicked for student:', student.name);
                  console.log('Student ID:', student.id);
                  alert(`Opening dashboard for ${student.name} (ID: ${student.id})`);
                  handleViewStudentDashboard(student);
                }}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  border: '2px solid #1d4ed8',
                  borderRadius: '12px',
                  padding: '1rem 2rem',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.5)',
                  marginTop: '1rem',
                  width: '100%',
                  justifyContent: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  zIndex: 10,
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.7)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8, #1e40af)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.5)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                }}
              >
                <Home className="w-5 h-5" />
                🎓 VIEW STUDENT DASHBOARD
              </button>

              {/* Secondary Dashboard Button - More Prominent */}
              <button
                onClick={() => {
                  console.log('🚀 SECONDARY Dashboard button clicked for student:', student.name);
                  alert(`🚀 SECONDARY: Opening dashboard for ${student.name} (ID: ${student.id})`);
                  handleViewStudentDashboard(student);
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: '3px solid #059669',
                  borderRadius: '15px',
                  padding: '1.2rem 2.5rem',
                  fontSize: '1.2rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: '0 10px 30px rgba(16, 185, 129, 0.6)',
                  marginTop: '1.5rem',
                  width: '100%',
                  justifyContent: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  zIndex: 15,
                  position: 'relative',
                  animation: 'pulse 2s infinite'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.8)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #059669, #047857)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.6)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                }}
              >
                <Home className="w-6 h-6" />
                🚀 STUDENT DASHBOARD (CLICK HERE!)
              </button>
            </div>

            <button className="ultra-send-feedback-button">
              <MessageSquare className="w-4 h-4" />
              Send Feedback
            </button>
          </div>
        ))}
        
        {filteredStudents.length === 0 && (
          <div className="ultra-empty-state">
            <div className="ultra-empty-icon">🔍</div>
            <h3 className="ultra-empty-title">No students found</h3>
            <p className="ultra-empty-description">
              Try adjusting your search criteria or browse all students to find what you're looking for.
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default EnhancedStudentAnalyticsDetailed;
