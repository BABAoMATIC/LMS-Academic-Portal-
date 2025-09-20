import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  BarChart3, 
  FileText, 
  HelpCircle, 
  BookOpen, 
  FolderOpen, 
  Bell, 
  MessageCircle, 
  Calendar, 
  User,
  Menu,
  X,
  PenTool,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPath }) => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/assignments', label: 'Assignments', icon: FileText },
    { path: '/resources', label: 'Resources', icon: BookOpen },
    { path: '/submissions', label: 'Submissions', icon: FolderOpen },
    { path: '/notifications', label: 'Notifications', icon: Bell },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  // Role-specific items
  if (user?.role === 'student') {
    navItems.splice(3, 0, { path: '/quizzes', label: 'Quizzes', icon: HelpCircle });
    navItems.splice(6, 0, { path: '/reflection-journal', label: 'Reflection Journal', icon: PenTool });
    navItems.splice(7, 0, { path: '/evidence-of-growth', label: 'Evidence of Growth', icon: TrendingUp });
  } else if (user?.role === 'teacher') {
    navItems.splice(3, 0, { path: '/admin-dashboard', label: 'Admin Dashboard', icon: BarChart3 });
    navItems.splice(4, 0, { path: '/create-quiz', label: 'Create Quiz', icon: HelpCircle });
    navItems.splice(5, 0, { path: '/teacher-chat', label: 'Student Chat', icon: MessageCircle });
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMobileMenu}
        className="mobile-menu-button"
        style={{
          position: 'fixed',
          top: '80px',
          left: '16px',
          zIndex: 1001,
          padding: '8px',
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'none'
        }}
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5 text-gray-600" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'none'
          }}
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;