import { Socket } from 'socket.io-client';
import { Chat, Notification } from '../types';
import { connectionManager } from './connectionManager';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  async connect(userId: number, userRole: 'student' | 'teacher'): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    try {
      this.socket = await connectionManager.connect(userId, userRole);
    } catch (error) {
      console.error('Failed to connect to socket:', error);
      return;
    }

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      
      // Join user room
      this.socket?.emit('join', { user_id: userId });
      
      // Join role-specific room
      if (userRole === 'teacher') {
        this.socket?.emit('join_teacher_room', { user_id: userId });
      } else {
        this.socket?.emit('join_student_room', { user_id: userId });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // New submission event
    this.socket.on('new_submission', (data: { submission: any; message: string }) => {
      this.emitToListeners('new_submission', data);
    });

    // New feedback event
    this.socket.on('new_feedback', (data: { feedback: any; message: string }) => {
      this.emitToListeners('new_feedback', data);
    });

    // New message event
    this.socket.on('new_message', (data: { message: Chat; sender_name: string }) => {
      this.emitToListeners('new_message', data);
    });

    // New notification event
    this.socket.on('new_notification', (data: { notification: Notification; message: string }) => {
      this.emitToListeners('new_notification', data);
    });

    // New quiz event
    this.socket.on('new_quiz', (data: { quiz: any; message: string }) => {
      this.emitToListeners('new_quiz', data);
    });

    // New assignment event
    this.socket.on('new_assignment', (data: { assignment: any; message: string }) => {
      this.emitToListeners('new_assignment', data);
    });

    // Notification count update
    this.socket.on('notification_count_update', (data: { unread_count: number }) => {
      this.emitToListeners('notification_count_update', data);
    });

    // User typing indicator
    this.socket.on('user_typing', (data: { user_id: number; is_typing: boolean }) => {
      this.emitToListeners('user_typing', data);
    });

    // User status change
    this.socket.on('user_status_change', (data: { user_id: number; is_online: boolean }) => {
      this.emitToListeners('user_status_change', data);
    });
  }

  // Send message
  sendMessage(senderId: number, receiverId: number, message: string, messageType: 'text' | 'file' | 'image' = 'text'): void {
    this.socket?.emit('send_message', {
      sender_id: senderId,
      receiver_id: receiverId,
      message,
      message_type: messageType,
    });
  }

  // Mark notification as read
  markNotificationAsRead(notificationId: number, userId: number): void {
    this.socket?.emit('mark_notification_read', {
      notification_id: notificationId,
      user_id: userId,
    });
  }

  // Typing indicator
  sendTypingIndicator(senderId: number, receiverId: number, isTyping: boolean): void {
    this.socket?.emit('typing', {
      sender_id: senderId,
      receiver_id: receiverId,
      is_typing: isTyping,
    });
  }

  // Online status
  updateOnlineStatus(userId: number, isOnline: boolean): void {
    this.socket?.emit('online_status', {
      user_id: userId,
      is_online: isOnline,
    });
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.listeners.delete(event);
    } else {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  private emitToListeners(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket instance (for advanced usage)
  getSocket(): Socket | null {
    return this.socket;
  }
}

const socketService = new SocketService();
export default socketService;
