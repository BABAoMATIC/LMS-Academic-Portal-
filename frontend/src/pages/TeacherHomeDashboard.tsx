import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Users,
  BookOpen,
  Award,
  FileText,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Eye,
  MessageCircle
} from 'lucide-react';
import '../styles/teacher-home-dashboard.css';
// import '../styles/responsive-system.css';
// import '../styles/responsive-dashboard.css';

interface TeacherKPIs {
  total_students: number;
  total_subjects: number;
  total_quizzes: number;
  pending_submissions: number;
  total_feedback: number;
  unread_messages: number;
}

interface Task {
  type: string;
  id: number;
  due_date: string;
  title: string;
  student_name: string;
  action_text: string;
  priority: 'high' | 'medium' | 'low';
}

interface Activity {
  type: string;
  timestamp: string;
  student_name: string;
  title: string;
  subject: string;
  action: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  type: string;
  start_time: string;
  end_time: string;
  subject_name?: string;
}

const TeacherHomeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<TeacherKPIs | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [kpisData, tasksData, activitiesData, calendarData] = await Promise.all([
        apiService.getTeacherDashboardKPIs(user!.id),
        apiService.getTeacherUpcomingTasks(user!.id),
        apiService.getTeacherActivityFeed(user!.id),
        apiService.getTeacherCalendarEvents(user!.id)
      ]);
      
      setKpis(kpisData);
      setTasks(tasksData);
      setActivities(activitiesData);
      setCalendarEvents(calendarData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  // Auto-refresh dashboard every 2 minutes
  useEffect(() => {
    if (user?.id) {
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 120000);
      
      return () => clearInterval(interval);
    }
  }, [user, fetchDashboardData]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submission': return <FileText className="h-4 w-4 text-blue-600" />;
      case 'quiz_attempt': return <Award className="h-4 w-4 text-purple-600" />;
      case 'message': return <MessageCircle className="h-4 w-4 text-green-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'grade_submission': return <Award className="h-4 w-4 text-blue-600" />;
      case 'respond_message': return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'calendar_event': return <Calendar className="h-4 w-4 text-purple-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="teacher-home-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="teacher-home-dashboard">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Oops! Something went wrong</h2>
          <p className="error-message">{error || 'Failed to load dashboard data'}</p>
          <button
            className="error-button"
            onClick={fetchDashboardData}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-home-dashboard">
      <div className="teacher-home-dashboard-content">
        {/* Enhanced Header */}
        <div className="teacher-dashboard-header">
          <h1 className="teacher-dashboard-title">Teacher Dashboard</h1>
          <p className="teacher-dashboard-subtitle">Welcome back! Here's what's happening in your classes today.</p>
        </div>

        {/* Enhanced KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card kpi-card-blue">
            <div className="kpi-card-content">
              <div className="kpi-icon kpi-icon-blue">
                <Users className="h-6 w-6" />
              </div>
              <div className="kpi-text">
                <p className="kpi-label">Total Students</p>
                <p className="kpi-value">{kpis.total_students}</p>
              </div>
            </div>
          </div>
          
          <div className="kpi-card kpi-card-green">
            <div className="kpi-card-content">
              <div className="kpi-icon kpi-icon-green">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="kpi-text">
                <p className="kpi-label">Subjects</p>
                <p className="kpi-value">{kpis.total_subjects}</p>
              </div>
            </div>
          </div>
          
          <div className="kpi-card kpi-card-purple">
            <div className="kpi-card-content">
              <div className="kpi-icon kpi-icon-purple">
                <Award className="h-6 w-6" />
              </div>
              <div className="kpi-text">
                <p className="kpi-label">Quizzes</p>
                <p className="kpi-value">{kpis.total_quizzes}</p>
              </div>
            </div>
          </div>
          
          <div className="kpi-card kpi-card-red">
            <div className="kpi-card-content">
              <div className="kpi-icon kpi-icon-red">
                <FileText className="h-6 w-6" />
              </div>
              <div className="kpi-text">
                <p className="kpi-label">Pending</p>
                <p className="kpi-value">{kpis.pending_submissions}</p>
              </div>
            </div>
          </div>
          
          <div className="kpi-card kpi-card-yellow">
            <div className="kpi-card-content">
              <div className="kpi-icon kpi-icon-yellow">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="kpi-text">
                <p className="kpi-label">Feedback</p>
                <p className="kpi-value">{kpis.total_feedback}</p>
              </div>
            </div>
          </div>
          
          <div className="kpi-card kpi-card-indigo">
            <div className="kpi-card-content">
              <div className="kpi-icon kpi-icon-indigo">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="kpi-text">
                <p className="kpi-label">Unread</p>
                <p className="kpi-value">{kpis.unread_messages}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-content-grid">
          {/* Left Column - Tasks and Calendar */}
          <div className="dashboard-main-content">
            {/* Upcoming Tasks */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon card-icon-blue">
                  <Clock className="h-5 w-5" />
                </div>
                <h2 className="card-title">Upcoming Tasks</h2>
              </div>
              
              {tasks.length > 0 ? (
                <div>
                  {tasks.slice(0, 8).map((task) => (
                    <div key={`${task.type}-${task.id}`} className="task-item">
                      <div className="task-content">
                        <div className="task-icon">
                          {getTaskIcon(task.type)}
                        </div>
                        <div className="task-details">
                          <p className="task-title">{task.title}</p>
                          <p className="task-student">{task.student_name}</p>
                          <p className="task-date">{formatDate(task.due_date)}</p>
                        </div>
                      </div>
                      
                      <div className="task-actions">
                        <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <button className="task-button">
                          {task.action_text}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Clock className="h-6 w-6" />
                  </div>
                  <p className="empty-state-text">No upcoming tasks</p>
                  <p className="empty-state-subtext">You're all caught up!</p>
                </div>
              )}
            </div>

            {/* Recent Activity Feed */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon card-icon-green">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <h2 className="card-title">Recent Student Activity</h2>
              </div>
              
              {activities.length > 0 ? (
                <div>
                  {activities.slice(0, 10).map((activity, index) => (
                    <div key={`${activity.type}-${index}`} className="activity-item">
                      <div className="activity-icon">
                        {getActivityIcon(activity.type)}
                      </div>
                      
                      <div className="activity-content">
                        <p className="activity-text">
                          <span className="font-medium">{activity.student_name}</span>
                          {' '}{activity.action} {activity.title}
                        </p>
                        <p className="activity-subject">{activity.subject}</p>
                      </div>
                      
                      <span className="activity-time">{formatTimeAgo(activity.timestamp)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <p className="empty-state-text">No recent activity</p>
                  <p className="empty-state-subtext">Student activity will appear here</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Calendar and Quick Actions */}
          <div className="dashboard-sidebar">
            {/* Mini Calendar */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon card-icon-purple">
                  <Calendar className="h-5 w-5" />
                </div>
                <h2 className="card-title">Upcoming Events</h2>
              </div>
              
              {calendarEvents.length > 0 ? (
                <div>
                  {calendarEvents.slice(0, 5).map((event) => (
                    <div key={event.id} className="calendar-event">
                      <h4 className="event-title">{event.title}</h4>
                      <p className="event-time">{formatDate(event.start_time)}</p>
                      {event.subject_name && (
                        <p className="event-subject">{event.subject_name}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <p className="empty-state-text">No upcoming events</p>
                  <p className="empty-state-subtext">Schedule events to see them here</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon card-icon-indigo">
                  <Award className="h-5 w-5" />
                </div>
                <h2 className="card-title">Quick Actions</h2>
              </div>
              
              <div className="quick-actions">
                <button className="quick-action-button quick-action-blue">
                  <Award className="h-4 w-4" />
                  Grade Submissions
                </button>
                
                <button className="quick-action-button quick-action-green">
                  <Award className="h-4 w-4" />
                  Create Quiz
                </button>
                
                <button className="quick-action-button quick-action-purple">
                  <Calendar className="h-4 w-4" />
                  Schedule Event
                </button>
                
                <button className="quick-action-button quick-action-yellow">
                  <MessageSquare className="h-4 w-4" />
                  View Messages
                </button>
              </div>
            </div>

            {/* Submission Status Summary */}
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-icon card-icon-indigo">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h2 className="card-title">Submission Status</h2>
              </div>
              
              <div className="status-summary">
                <div className="status-item">
                  <span className="status-label">Total Submissions</span>
                  <span className="status-value status-value-total">{kpis.pending_submissions + (kpis.total_feedback || 0)}</span>
                </div>
                
                <div className="status-item">
                  <span className="status-label">Pending Review</span>
                  <span className="status-value status-value-pending">{kpis.pending_submissions}</span>
                </div>
                
                <div className="status-item">
                  <span className="status-label">Graded</span>
                  <span className="status-value status-value-graded">{kpis.total_feedback || 0}</span>
                </div>
                
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill" 
                    style={{ 
                      width: `${kpis.pending_submissions + (kpis.total_feedback || 0) > 0 ? 
                        ((kpis.total_feedback || 0) / (kpis.pending_submissions + (kpis.total_feedback || 0))) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherHomeDashboard;
