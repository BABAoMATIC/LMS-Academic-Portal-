import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Award, Clock } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();



  return (
    <div className="home-page">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome back, {user?.name || 'Student'}! 👋</h1>
          <p className="welcome-subtitle">
            Here's your learning progress and upcoming tasks. Stay on track and achieve your academic goals!
          </p>
        </div>
      </div>

      {/* Progress Metrics Section */}
      <div className="progress-metrics">
        <div className="metric-card">
          <div className="metric-icon">📚</div>
          <div className="metric-value">16</div>
          <div className="metric-label">Completed</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📖</div>
          <div className="metric-value">8</div>
          <div className="metric-label">Modules</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">⏰</div>
          <div className="metric-value">0</div>
          <div className="metric-label">Due Soon</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📝</div>
          <div className="metric-value">3</div>
          <div className="metric-label">Assignments</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-value">75%</div>
          <div className="metric-label">Progress</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🏆</div>
          <div className="metric-value">12</div>
          <div className="metric-label">Achievements</div>
        </div>
      </div>



      {/* Quick Shortcuts Section */}
      <div className="quick-shortcuts">
        <h2 className="shortcuts-title">Quick Shortcuts</h2>
        <div className="shortcuts-grid">
          <a href="/assignments" className="shortcut-card">
            <div className="shortcut-icon">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="shortcut-title">Assignments</div>
            <div className="shortcut-desc">View and submit your assignments</div>
          </a>
          <a href="/quizzes" className="shortcut-card">
            <div className="shortcut-icon">
              <Award className="w-6 h-6" />
            </div>
            <div className="shortcut-title">Quizzes</div>
            <div className="shortcut-desc">Take quizzes and tests</div>
          </a>
          <a href="/resources" className="shortcut-card">
            <div className="shortcut-icon">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="shortcut-title">Resources</div>
            <div className="shortcut-desc">Access learning materials</div>
          </a>
          <a href="/calendar" className="shortcut-card">
            <div className="shortcut-icon">
              <Clock className="w-6 h-6" />
            </div>
            <div className="shortcut-title">Calendar</div>
            <div className="shortcut-desc">View upcoming events</div>
          </a>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="recent-activity">
        <h2 className="activity-title">Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="activity-content">
              <div className="activity-title-text">Mathematics Assignment Submitted</div>
              <div className="activity-time">2 hours ago</div>
            </div>
            <span className="activity-status completed">Completed</span>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <Award className="w-5 h-5" />
            </div>
            <div className="activity-content">
              <div className="activity-title-text">Physics Quiz Completed</div>
              <div className="activity-time">1 day ago</div>
            </div>
            <span className="activity-status completed">Completed</span>
          </div>
          <div className="activity-item">
            <div className="activity-icon">
              <Clock className="w-5 h-5" />
            </div>
            <div className="activity-content">
              <div className="activity-title-text">English Essay Due Soon</div>
              <div className="activity-time">Due in 3 days</div>
            </div>
            <span className="activity-status pending">Pending</span>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Home;
