import { Socket } from 'socket.io-client';
import { connectionManager } from './connectionManager';
import notificationService from './notificationService';

interface SyncEvent {
  type: string;
  data: any;
  timestamp: string;
  userId?: number;
  targetUserId?: number;
}

// interface DashboardUpdate {
//   assignments?: any[];
//   quizzes?: any[];
//   submissions?: any[];
//   notifications?: any[];
//   stats?: any;
// }

class RealTimeSyncService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initializeSocket();
  }

  private async initializeSocket() {
    try {
      this.socket = await connectionManager.connect();

      this.socket.on('connect', () => {
        console.log('🔄 Real-time sync service connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection_status', { connected: true });
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Real-time sync service disconnected');
        this.isConnected = false;
        this.emit('connection_status', { connected: false });
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Real-time sync connection error:', error);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('❌ Max reconnection attempts reached');
        }
      });

      // Listen for assignment events
      this.socket.on('assignment_submitted', (data: any) => {
        console.log('📤 Assignment submitted:', data);
        this.handleAssignmentEvent('submitted', data);
      });

      this.socket.on('assignment_graded', (data: any) => {
        console.log('✅ Assignment graded:', data);
        this.handleAssignmentEvent('graded', data);
      });

      this.socket.on('assignment_status_update', (data: any) => {
        console.log('🔄 Assignment status updated:', data);
        this.handleAssignmentEvent('status_update', data);
      });

      // Listen for quiz events
      this.socket.on('quiz_completed', (data: any) => {
        console.log('🎯 Quiz completed:', data);
        this.handleQuizEvent('completed', data);
      });

      this.socket.on('quiz_graded', (data: any) => {
        console.log('✅ Quiz graded:', data);
        this.handleQuizEvent('graded', data);
      });

      this.socket.on('quiz_status_update', (data: any) => {
        console.log('🔄 Quiz status updated:', data);
        this.handleQuizEvent('status_update', data);
      });

      // Listen for feedback events
      this.socket.on('feedback_provided', (data: any) => {
        console.log('💬 Feedback provided:', data);
        this.handleFeedbackEvent(data);
      });

      // Listen for real-time notifications
      this.socket.on('realtime_notification', (data: any) => {
        console.log('🔔 Real-time notification:', data);
        this.handleNotification(data);
      });

      // Listen for chat events
      this.socket.on('chat_message', (data: any) => {
        console.log('💬 Chat message:', data);
        this.handleChatEvent(data);
      });

    } catch (error) {
      console.error('Error initializing real-time sync service:', error);
    }
  }

  private handleAssignmentEvent(type: string, data: any) {
    const event: SyncEvent = {
      type: `assignment_${type}`,
      data,
      timestamp: new Date().toISOString(),
      userId: data.student_id,
      targetUserId: data.teacher_id
    };

    this.emit('assignment_update', event);
    this.emit('dashboard_refresh', { type: 'assignments' });
    
    // Emit real-time notification
    if (type === 'submitted') {
      notificationService.emitRealtimeNotification(
        'assignment_submitted',
        'Assignment Submitted',
        `Assignment "${data.assignment_title || 'Unknown'}" has been submitted`,
        data,
        'medium'
      );
    } else if (type === 'graded') {
      notificationService.emitRealtimeNotification(
        'assignment_graded',
        'Assignment Graded',
        `Your assignment has been graded: ${data.percentage?.toFixed(1)}%`,
        data,
        'high'
      );
    }
  }

  private handleQuizEvent(type: string, data: any) {
    const event: SyncEvent = {
      type: `quiz_${type}`,
      data,
      timestamp: new Date().toISOString(),
      userId: data.student_id,
      targetUserId: data.teacher_id
    };

    this.emit('quiz_update', event);
    this.emit('dashboard_refresh', { type: 'quizzes' });
    
    // Emit real-time notification
    if (type === 'completed') {
      notificationService.emitRealtimeNotification(
        'quiz_completed',
        'Quiz Completed',
        `Quiz completed with ${data.percentage?.toFixed(1)}% score`,
        data,
        'high'
      );
    } else if (type === 'graded') {
      notificationService.emitRealtimeNotification(
        'quiz_graded',
        'Quiz Graded',
        `Your quiz has been graded: ${data.percentage?.toFixed(1)}%`,
        data,
        'high'
      );
    }
  }

  private handleFeedbackEvent(data: any) {
    const event: SyncEvent = {
      type: 'feedback_provided',
      data,
      timestamp: new Date().toISOString(),
      userId: data.student_id,
      targetUserId: data.teacher_id
    };

    this.emit('feedback_update', event);
    this.emit('dashboard_refresh', { type: 'feedback' });
    
    // Emit real-time notification
    notificationService.emitRealtimeNotification(
      'feedback_provided',
      'New Feedback',
      'You have received new feedback from your teacher',
      data,
      'high'
    );
  }

  private handleNotification(data: any) {
    const event: SyncEvent = {
      type: 'notification',
      data,
      timestamp: new Date().toISOString()
    };

    this.emit('notification_update', event);
    this.emit('dashboard_refresh', { type: 'notifications' });
  }

  private handleChatEvent(data: any) {
    const event: SyncEvent = {
      type: 'chat_message',
      data,
      timestamp: new Date().toISOString(),
      userId: data.sender_id
    };

    this.emit('chat_update', event);
  }

  // Public methods for subscribing to events
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event) || [];
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    };
  }

  off(event: string, callback?: Function) {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const eventListeners = this.listeners.get(event) || [];
    const index = eventListeners.indexOf(callback);
    if (index > -1) {
      eventListeners.splice(index, 1);
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in real-time sync listener for ${event}:`, error);
      }
    });
  }

  // Method to manually trigger dashboard refresh
  refreshDashboard(type?: string) {
    this.emit('dashboard_refresh', { type });
  }

  // Method to get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Method to disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }
}

// Create singleton instance
const realTimeSyncService = new RealTimeSyncService();
export default realTimeSyncService;
