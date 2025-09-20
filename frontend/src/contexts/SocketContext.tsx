import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { SocketContextType } from '../types';
import socketService from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      // Connect to socket when user is authenticated
      socketService.connect(user.id, user.role).catch(error => {
        console.error('Socket connection failed:', error);
      });
    } else {
      // Disconnect when user is not authenticated
      socketService.disconnect();
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [user, token]);

  const connect = () => {
    if (user) {
      socketService.connect(user.id, user.role).catch(error => {
        console.error('Socket connection failed:', error);
      });
    }
  };

  const disconnect = () => {
    socketService.disconnect();
  };

  const value: SocketContextType = {
    socket: socketService.getSocket(),
    connected: socketService.isConnected(),
    connect,
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
