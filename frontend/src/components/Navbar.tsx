import React from 'react';
import { useAuth } from '../contexts/AuthContext';

import { 
  Search, 
  Globe, 
  Bell, 
  User, 
  LogOut, 
  Wifi
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar-enhanced">
      <div className="navbar-content">
        {/* Logo */}
        <div className="navbar-brand-enhanced">
          <div className="brand-icon">📚</div>
          <div className="brand-text">
            <span className="brand-title">Academic Portal</span>
            <span className="brand-subtitle">Learning Management System</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="navbar-search-enhanced">
          <div className="search-container-enhanced">
            <Search className="search-icon-enhanced" />
            <input 
              type="text" 
              placeholder="Search assignments, quizzes, resources..." 
              className="search-input-enhanced"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="navbar-actions-enhanced">
          {/* Online status */}
          <div className="status-indicator-enhanced">
            <div className="status-dot"></div>
            <Wifi className="w-4 h-4" />
            <span>Online</span>
          </div>

          {/* Language selector */}
          <button className="navbar-button-enhanced">
            <Globe className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="navbar-button-enhanced notification-button">
            <Bell className="w-5 h-5" />
            <span className="notification-badge">3</span>
          </button>

          {/* User info */}
          <div className="user-menu-enhanced">
            <div className="user-avatar">
              <User className="w-4 h-4" />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'Test User'}</span>
              <span className="user-role">{user?.role || 'Student'}</span>
            </div>
          </div>

          {/* Logout button */}
          <button 
            className="logout-button-enhanced"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;