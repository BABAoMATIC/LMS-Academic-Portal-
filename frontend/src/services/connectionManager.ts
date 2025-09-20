import { io, Socket } from 'socket.io-client';

class ConnectionManager {
  private static instance: ConnectionManager;
  private socket: Socket | null = null;
  private isConnecting = false;
  private connectionAttempts = 0;
  private maxAttempts = 3;
  private reconnectDelay = 2000;

  private constructor() {}

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  connect(userId?: number, userRole?: 'student' | 'teacher'): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      if (this.isConnecting) {
        // Wait for existing connection attempt
        const checkConnection = () => {
          if (this.socket?.connected) {
            resolve(this.socket);
          } else if (!this.isConnecting) {
            reject(new Error('Connection failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      this.isConnecting = true;
      this.connectionAttempts++;

      console.log(`🔌 Attempting WebSocket connection (attempt ${this.connectionAttempts}/${this.maxAttempts})`);

      this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5006', {
        transports: ['polling', 'websocket'],
        withCredentials: false,
        forceNew: true,
        timeout: 10000,
        reconnection: false, // We'll handle reconnection manually
      });

      const connectionTimeout = setTimeout(() => {
        if (!this.socket?.connected) {
          this.socket?.disconnect();
          this.socket = null;
          this.isConnecting = false;
          reject(new Error('Connection timeout'));
        }
      }, 10000);

      this.socket.on('connect', () => {
        clearTimeout(connectionTimeout);
        console.log('✅ WebSocket connected successfully');
        this.isConnecting = false;
        this.connectionAttempts = 0;
        
        // Join user room if user info provided
        if (userId && userRole && this.socket) {
          this.socket.emit('join', { user_id: userId });
          if (userRole === 'teacher') {
            this.socket.emit('join_teacher_room', { user_id: userId });
          } else {
            this.socket.emit('join_student_room', { user_id: userId });
          }
        }
        
        if (this.socket) {
          resolve(this.socket);
        } else {
          reject(new Error('Socket is null after connection'));
        }
      });

      this.socket.on('connect_error', (error) => {
        clearTimeout(connectionTimeout);
        console.error('❌ WebSocket connection error:', error);
        this.socket?.disconnect();
        this.socket = null;
        this.isConnecting = false;

        if (this.connectionAttempts < this.maxAttempts) {
          console.log(`🔄 Retrying connection in ${this.reconnectDelay}ms...`);
          setTimeout(() => {
            this.connect(userId, userRole).then(resolve).catch(reject);
          }, this.reconnectDelay);
        } else {
          reject(new Error('Max connection attempts reached'));
        }
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 WebSocket disconnected');
        this.isConnecting = false;
      });
    });
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.connectionAttempts = 0;
  }
}

export const connectionManager = ConnectionManager.getInstance();
