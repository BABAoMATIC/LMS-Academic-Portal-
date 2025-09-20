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

interface EnhancedSidebarProps {
  currentPath: string;
}

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ currentPath }) => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/assignments', label: 'Assignments', icon: FileText },
    { path: '/resources', label: 'Resources', icon: BookOpen },
    { path: '/submissions', label: 'Submissions', icon: FolderOpen },
    { path: '/notifications', label: 'Notifications', icon: Bell },
    { path: '/messages', label: 'Messages', icon: MessageCircle },
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

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`enhanced-sidebar ${isMobileMenuOpen ? 'enhanced-sidebar-open' : ''}`}>
        <div className="enhanced-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`enhanced-nav-item ${isActive ? 'enhanced-nav-item-active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="enhanced-nav-icon" />
                <span className="enhanced-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default EnhancedSidebar;
