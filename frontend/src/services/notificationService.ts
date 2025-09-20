import { Socket } from 'socket.io-client';
import { connectionManager } from './connectionManager';

interface NotificationData {
  id: string;
  type: 'assignment_submitted' | 'quiz_completed' | 'assignment_graded' | 'quiz_graded' | 'assignment_created' | 'quiz_created' | 'feedback_provided';
  title: string;
  message: string;
  data: any;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface NotificationListener {
  (notification: NotificationData): void;
}

class NotificationService {
  private socket: Socket | null = null;
  private listeners: Map<string, NotificationListener[]> = new Map();
  private notificationQueue: NotificationData[] = [];
  private isConnected = false;

  constructor() {
    this.initializeSocket();
  }

  private async initializeSocket() {
    try {
      // Use connection manager to prevent multiple connections
      this.socket = await connectionManager.connect();
      
      this.socket.on('connect', () => {
        console.log('🔔 Connected to notification service');
        this.isConnected = true;
        this.processNotificationQueue();
      });

      this.socket.on('disconnect', () => {
        console.log('🔔 Disconnected from notification service');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('🔔 Notification service connection error:', error);
        this.isConnected = false;
      });

      // Set up comprehensive event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Assignment-related notifications
    this.socket.on('assignment_submitted', (data: any) => {
      this.handleNotification({
        id: `assignment_submitted_${data.submission_id}_${Date.now()}`,
        type: 'assignment_submitted',
        title: 'New Assignment Submission',
        message: `Student ${data.student_name} submitted assignment "${data.assignment_title}"`,
        data: data,
        timestamp: new Date(),
        read: false,
        priority: 'medium'
      });
    });

    this.socket.on('assignment_graded', (data: any) => {
      this.handleNotification({
        id: `assignment_graded_${data.assignment_id}_${data.student_id}_${Date.now()}`,
        type: 'assignment_graded',
        title: 'Assignment Graded',
        message: `Your assignment "${data.assignment_title}" has been graded. You received ${data.marks_obtained}/${data.total_marks} marks.`,
        data: data,
        timestamp: new Date(),
        read: false,
        priority: 'high'
      });
    });

    this.socket.on('assignment_created', (data: any) => {
      this.handleNotification({
        id: `assignment_created_${data.assignment_id}_${Date.now()}`,
        type: 'assignment_created',
        title: 'New Assignment Available',
        message: `New assignment "${data.title}" has been created. Due: ${new Date(data.deadline).toLocaleDateString()}`,
        data: data,
        timestamp: new Date(),
        read: false,
        priority: 'medium'
      });
    });

    // Quiz-related notifications
    this.socket.on('quiz_completed', (data: any) => {
      this.handleNotification({
        id: `quiz_completed_${data.attempt_id}_${Date.now()}`,
        type: 'quiz_completed',
        title: 'Quiz Completed',
        message: `Student ${data.student_name} completed quiz "${data.quiz_title}" with ${data.percentage?.toFixed(1)}% (${data.grade})`,
        data: data,
        timestamp: new Date(),
        read: false,
        priority: 'medium'
      });
    });

    this.socket.on('quiz_graded', (data: any) => {
      this.handleNotification({
        id: `quiz_graded_${data.quiz_id}_${data.student_id}_${Date.now()}`,
        type: 'quiz_graded',
        title: 'Quiz Graded',
        message: `Your quiz "${data.quiz_title}" has been graded. You received ${data.marks_obtained}/${data.total_marks} marks (${data.percentage?.toFixed(1)}%) - ${data.grade}`,
        data: data,
        timestamp: new Date(),
        read: false,
        priority: 'high'
      });
    });

    this.socket.on('quiz_created', (data: any) => {
      this.handleNotification({
        id: `quiz_created_${data.quiz_id}_${Date.now()}`,
        type: 'quiz_created',
        title: 'New Quiz Available',
        message: `New quiz "${data.title}" has been created. Due: ${new Date(data.deadline).toLocaleDateString()}`,
        data: data,
        timestamp: new Date(),
        read: false,
        priority: 'medium'
      });
    });

    // Feedback notifications
    this.socket.on('feedback_provided', (data: any) => {
      this.handleNotification({
        id: `feedback_provided_${data.feedback_id}_${Date.now()}`,
        type: 'feedback_provided',
        title: 'New Feedback Available',
        message: `You have received feedback on your ${data.item_type}: "${data.item_title}"`,
        data: data,
        timestamp: new Date(),
        read: false,
        priority: 'high'
      });
    });

    // Enhanced real-time notifications
    this.socket.on('realtime_notification', (data: any) => {
      this.handleNotification({
        id: `realtime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
        timestamp: new Date(data.timestamp),
        read: false,
        priority: data.priority || 'medium'
      });
    });

    // Status update notifications
    this.socket.on('assignment_status_update', (data: any) => {
      this.handleNotification({
        id: `assignment_status_${data.assignment_id}_${data.student_id}_${Date.now()}`,
        type: 'assignment_submitted', // Reuse type for status updates
        title: 'Assignment Status Updated',
        message: `Assignment "${data.assignment_title}" status changed to ${data.status}`,
        data: data,
        timestamp: new Date(),
        read: false,
        priority: 'low'
      });
    });

    this.socket.on('quiz_status_update', (data: any) => {
      this.handleNotification({
        id: `quiz_status_${data.quiz_id}_${data.student_id}_${Date.now()}`,
        type: 'quiz_completed', // Reuse type for status updates
        title: 'Quiz Status Updated',
        message: `Quiz "${data.quiz_title}" status changed to ${data.status}`,
        data: data,
        timestamp: new Date(),
        read: false,
        priority: 'low'
      });
    });
  }

  private handleNotification(notification: NotificationData) {
    // Add to queue if not connected
    if (!this.isConnected) {
      this.notificationQueue.push(notification);
      return;
    }

    // Emit to listeners
    this.emitToListeners(notification.type, notification);
    this.emitToListeners('all', notification);

    // Show browser notification if permission granted
    this.showBrowserNotification(notification);
  }

  private emitToListeners(type: string, notification: NotificationData) {
    const typeListeners = this.listeners.get(type) || [];
    const allListeners = this.listeners.get('all') || [];
    
    [...typeListeners, ...allListeners].forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error(`Error in notification listener for ${type}:`, error);
      }
    });
  }

  private async showBrowserNotification(notification: NotificationData) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent' || notification.priority === 'high'
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };

      // Auto-close after 5 seconds for non-urgent notifications
      if (notification.priority !== 'urgent') {
        setTimeout(() => browserNotification.close(), 5000);
      }
    }
  }

  private processNotificationQueue() {
    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      if (notification) {
        this.handleNotification(notification);
      }
    }
  }

  // Public methods
  public subscribe(type: string, listener: NotificationListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);

    // Return unsubscribe function
    return () => {
      const typeListeners = this.listeners.get(type) || [];
      const index = typeListeners.indexOf(listener);
      if (index > -1) {
        typeListeners.splice(index, 1);
      }
    };
  }

  public async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        return true;
      } else if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    }
    return false;
  }

  public connect(userId: number, userRole: 'student' | 'teacher') {
    if (this.socket?.connected) {
      return;
    }

    this.socket?.emit('join', { user_id: userId });
    
    if (userRole === 'teacher') {
      this.socket?.emit('join_teacher_room', { user_id: userId });
    } else {
      this.socket?.emit('join_student_room', { user_id: userId });
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    this.isConnected = false;
  }

  public isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  public emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Cannot emit event - socket not connected:', event);
    }
  }

  // Utility methods for specific notification types
  public subscribeToAssignmentNotifications(listener: NotificationListener): () => void {
    return this.subscribe('assignment_submitted', listener);
  }

  public subscribeToQuizNotifications(listener: NotificationListener): () => void {
    return this.subscribe('quiz_completed', listener);
  }

  public subscribeToGradingNotifications(listener: NotificationListener): () => void {
    const unsubscribeAssignment = this.subscribe('assignment_graded', listener);
    const unsubscribeQuiz = this.subscribe('quiz_graded', listener);
    
    return () => {
      unsubscribeAssignment();
      unsubscribeQuiz();
    };
  }

  public subscribeToFeedbackNotifications(listener: NotificationListener): () => void {
    return this.subscribe('feedback_provided', listener);
  }

  public subscribeToAllNotifications(listener: NotificationListener): () => void {
    return this.subscribe('all', listener);
  }

  // Enhanced method for real-time notifications with priority
  public emitRealtimeNotification(type: string, title: string, message: string, data: any = {}, priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium') {
    const notification: NotificationData = {
      id: `realtime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      title,
      message,
      data,
      timestamp: new Date(),
      read: false,
      priority
    };

    this.handleNotification(notification);
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;
export type { NotificationData, NotificationListener };
