import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import EnhancedSidebar from './EnhancedSidebar';
import FloatingChatbot from './FloatingChatbot';
import SubmissionNotification from './SubmissionNotification';
import StatusNotification from './StatusNotification';
import NotificationBell from './NotificationBell';
import ReminderCenter from './ReminderCenter';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return null;
  }

  return (
    <div className="app-container">
      <Navbar />
      <div className="layout-container">
        <EnhancedSidebar currentPath={location.pathname} />
        <div className="main-content-enhanced">
          <div className="content-wrapper">
            {children}
          </div>
        </div>
        
        {/* Universal Chatbot */}
        <FloatingChatbot />
        
        {/* Submission Notifications for Teachers */}
        <SubmissionNotification onClose={() => {}} />
        
        {/* Real-time Status Notifications */}
        <StatusNotification userId={user.id} userRole={user.role} />
        
        {/* Real-time Notification Bell */}
        <div className="fixed top-4 right-4 z-40">
          <NotificationBell />
        </div>
        
        {/* Reminder Center */}
        <div className="fixed top-4 right-20 z-40">
          <ReminderCenter />
        </div>
      </div>
    </div>
  );
};

export default Layout;