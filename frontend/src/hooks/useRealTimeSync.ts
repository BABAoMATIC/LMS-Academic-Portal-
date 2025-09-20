import { useEffect, useCallback, useRef } from 'react';
import realTimeSyncService from '../services/realTimeSyncService';

interface UseRealTimeSyncOptions {
  onAssignmentUpdate?: (data: any) => void;
  onQuizUpdate?: (data: any) => void;
  onFeedbackUpdate?: (data: any) => void;
  onNotificationUpdate?: (data: any) => void;
  onChatUpdate?: (data: any) => void;
  onDashboardRefresh?: (data: any) => void;
  onConnectionStatus?: (data: any) => void;
  userId?: number;
  enabled?: boolean;
}

export const useRealTimeSync = (options: UseRealTimeSyncOptions = {}) => {
  const {
    onAssignmentUpdate,
    onQuizUpdate,
    onFeedbackUpdate,
    onNotificationUpdate,
    onChatUpdate,
    onDashboardRefresh,
    onConnectionStatus,
    userId,
    enabled = true
  } = options;

  const unsubscribeFunctions = useRef<(() => void)[]>([]);

  const setupListeners = useCallback(() => {
    if (!enabled) return;

    // Clear existing listeners
    unsubscribeFunctions.current.forEach(unsubscribe => unsubscribe());
    unsubscribeFunctions.current = [];

    // Assignment updates
    if (onAssignmentUpdate) {
      const unsubscribe = realTimeSyncService.on('assignment_update', (data: any) => {
        if (!userId || data.userId === userId || data.targetUserId === userId) {
          onAssignmentUpdate(data);
        }
      });
      unsubscribeFunctions.current.push(unsubscribe);
    }

    // Quiz updates
    if (onQuizUpdate) {
      const unsubscribe = realTimeSyncService.on('quiz_update', (data: any) => {
        if (!userId || data.userId === userId || data.targetUserId === userId) {
          onQuizUpdate(data);
        }
      });
      unsubscribeFunctions.current.push(unsubscribe);
    }

    // Feedback updates
    if (onFeedbackUpdate) {
      const unsubscribe = realTimeSyncService.on('feedback_update', (data: any) => {
        if (!userId || data.userId === userId || data.targetUserId === userId) {
          onFeedbackUpdate(data);
        }
      });
      unsubscribeFunctions.current.push(unsubscribe);
    }

    // Notification updates
    if (onNotificationUpdate) {
      const unsubscribe = realTimeSyncService.on('notification_update', (data: any) => {
        if (!userId || data.userId === userId || data.targetUserId === userId) {
          onNotificationUpdate(data);
        }
      });
      unsubscribeFunctions.current.push(unsubscribe);
    }

    // Chat updates
    if (onChatUpdate) {
      const unsubscribe = realTimeSyncService.on('chat_update', (data: any) => {
        if (!userId || data.userId === userId || data.targetUserId === userId) {
          onChatUpdate(data);
        }
      });
      unsubscribeFunctions.current.push(unsubscribe);
    }

    // Dashboard refresh
    if (onDashboardRefresh) {
      const unsubscribe = realTimeSyncService.on('dashboard_refresh', (data: any) => {
        onDashboardRefresh(data);
      });
      unsubscribeFunctions.current.push(unsubscribe);
    }

    // Connection status
    if (onConnectionStatus) {
      const unsubscribe = realTimeSyncService.on('connection_status', (data: any) => {
        onConnectionStatus(data);
      });
      unsubscribeFunctions.current.push(unsubscribe);
    }
  }, [
    enabled,
    userId,
    onAssignmentUpdate,
    onQuizUpdate,
    onFeedbackUpdate,
    onNotificationUpdate,
    onChatUpdate,
    onDashboardRefresh,
    onConnectionStatus
  ]);

  useEffect(() => {
    setupListeners();

    return () => {
      // Cleanup all listeners
      unsubscribeFunctions.current.forEach(unsubscribe => unsubscribe());
      unsubscribeFunctions.current = [];
    };
  }, [setupListeners]);

  // Manual refresh function
  const refreshDashboard = useCallback((type?: string) => {
    realTimeSyncService.refreshDashboard(type);
  }, []);

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    return realTimeSyncService.getConnectionStatus();
  }, []);

  return {
    refreshDashboard,
    getConnectionStatus
  };
};

export default useRealTimeSync;
