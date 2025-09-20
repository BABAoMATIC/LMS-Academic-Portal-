import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import notificationService, { NotificationData } from '../services/notificationService';
import RealTimeNotificationCenter from './RealTimeNotificationCenter';

const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    // Subscribe to all notifications to track unread count
    const unsubscribe = notificationService.subscribeToAllNotifications((notification) => {
      if (!notification.read) {
        setUnreadCount(prev => prev + 1);
        setHasNewNotifications(true);
        
        // Auto-hide the "new" indicator after 3 seconds
        setTimeout(() => setHasNewNotifications(false), 3000);
      }
    });

    return unsubscribe;
  }, []);

  const handleBellClick = () => {
    setIsOpen(true);
    setHasNewNotifications(false);
  };

  return (
    <>
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        
        {/* New notification indicator */}
        {hasNewNotifications && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Notification Center */}
      <RealTimeNotificationCenter 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
};

export default NotificationBell;