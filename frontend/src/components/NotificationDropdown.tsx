import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, X, Check } from 'lucide-react';
import { theme } from '../utils/theme';
import { Notification } from '../types';
import apiService from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.getNotifications(page, 10, false);
      if (page === 1) {
        setNotifications(response.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.notifications]);
      }
      setHasMore(response.has_next);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      if (user?.id) {
        await apiService.deleteNotification(notificationId, user.id);
        setNotifications(prev =>
          prev.filter(notification => notification.id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ${t('common.ago')}`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ${t('common.ago')}`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ${t('common.ago')}`;
    return `${Math.floor(diffInSeconds / 86400)}d ${t('common.ago')}`;
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        width: '400px',
        maxHeight: '500px',
        backgroundColor: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borderRadius.lg,
        boxShadow: theme.shadows.xl,
        zIndex: theme.zIndex.dropdown,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: theme.spacing.md,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
        }}
      >
        <h3 style={{ margin: 0, fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold }}>
          {t('notifications.title')}
        </h3>
        <div style={{ display: 'flex', gap: theme.spacing.xs }}>
          <button
            onClick={markAllAsRead}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.primary,
              cursor: 'pointer',
              padding: theme.spacing.xs,
              borderRadius: theme.borderRadius.sm,
              fontSize: theme.typography.fontSize.xs,
            }}
          >
            {t('notifications.markAllAsRead')}
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.text.secondary,
              cursor: 'pointer',
              padding: theme.spacing.xs,
              borderRadius: theme.borderRadius.sm,
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {loading && page === 1 ? (
          <LoadingSpinner size="sm" />
        ) : notifications.length === 0 ? (
          <div
            style={{
              padding: theme.spacing.xl,
              textAlign: 'center',
              color: theme.colors.text.tertiary,
            }}
          >
            <Bell size={48} style={{ marginBottom: theme.spacing.md, opacity: 0.5 }} />
            <p>{t('notifications.noNotifications')}</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: theme.spacing.md,
                  borderBottom: `1px solid ${theme.colors.border.secondary}`,
                  backgroundColor: notification.read 
                    ? 'transparent' 
                    : `${theme.colors.primary}10`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        marginBottom: theme.spacing.xs,
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: notification.read 
                          ? theme.typography.fontWeight.normal 
                          : theme.typography.fontWeight.medium,
                        color: notification.read 
                          ? theme.colors.text.secondary 
                          : theme.colors.text.primary,
                      }}
                    >
                      {notification.message}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.sm,
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.text.tertiary,
                      }}
                    >
                      <span>{formatTimeAgo(notification.timestamp)}</span>
                      <span
                        style={{
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          backgroundColor: theme.colors.background.tertiary,
                          borderRadius: theme.borderRadius.sm,
                          textTransform: 'capitalize',
                        }}
                      >
                        {t(`notifications.notificationTypes.${notification.type}`)}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: theme.colors.success,
                          cursor: 'pointer',
                          padding: theme.spacing.xs,
                          borderRadius: theme.borderRadius.sm,
                        }}
                        title={t('notifications.markAsRead')}
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.colors.error,
                        cursor: 'pointer',
                        padding: theme.spacing.xs,
                        borderRadius: theme.borderRadius.sm,
                      }}
                      title={t('notifications.deleteNotification')}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {hasMore && (
              <div style={{ padding: theme.spacing.md, textAlign: 'center' }}>
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={loading}
                  style={{
                    background: theme.colors.background.tertiary,
                    border: `1px solid ${theme.colors.border.primary}`,
                    color: theme.colors.text.primary,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    borderRadius: theme.borderRadius.md,
                    fontSize: theme.typography.fontSize.sm,
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  {loading ? t('common.loading') : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;
