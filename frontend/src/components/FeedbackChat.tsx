import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, Clock, Reply, MoreVertical, Smile, Paperclip, Check, CheckCheck, Image as ImageIcon, FileText } from 'lucide-react';
import notificationService from '../services/notificationService';
import apiService from '../services/api';
import { useSocket } from '../contexts/SocketContext';
import '../styles/student-chat-enhanced.css';

interface Message {
  id: string;
  sender_id: number;
  sender_name: string;
  sender_role: 'student' | 'teacher';
  message: string;
  timestamp: string;
  student_id: number;
  assignment_id?: number;
  quiz_id?: number;
  reply_to?: string;
  is_read?: boolean;
  message_type?: 'text' | 'feedback' | 'question' | 'answer';
  reactions?: { emoji: string; users: number[] }[];
}

interface FeedbackChatProps {
  assignmentId?: number;
  quizId?: number;
  studentId: number;
  teacherId?: number;
  currentUserId: number;
  currentUserRole: 'student' | 'teacher';
  currentUserName: string;
}

const FeedbackChat: React.FC<FeedbackChatProps> = ({
  assignmentId,
  quizId,
  studentId,
  teacherId,
  currentUserId,
  currentUserRole,
  currentUserName
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchMessages();
    setupWebSocketListeners();
    
    return () => {
      // Cleanup WebSocket listeners
      if (socket) {
        socket.off('chat_message');
        socket.off('typing_start');
        socket.off('typing_stop');
        socket.off('message_read');
      }
    };
  }, [assignmentId, quizId, studentId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        student_id: studentId.toString(),
        ...(assignmentId && { assignment_id: assignmentId.toString() }),
        ...(quizId && { quiz_id: quizId.toString() })
      });

      const response = await apiService.get(`/chat/messages?${params}`);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocketListeners = () => {
    if (!socket) return;

    // Listen for new chat messages
    socket.on('chat_message', (messageData: Message) => {
      // Check if this message is relevant to current chat
      if (
        (assignmentId && messageData.assignment_id === assignmentId) ||
        (quizId && messageData.quiz_id === quizId)
      ) {
        if (messageData.student_id === studentId) {
          setMessages(prev => [...prev, messageData]);
          
          // Emit real-time notification
          notificationService.emitRealtimeNotification(
            'new_message',
            'New Message',
            `${messageData.sender_name}: ${messageData.message.substring(0, 50)}...`,
            messageData,
            'medium'
          );
        }
      }
    });

    // Listen for typing indicators
    socket.on('typing_start', (data: { user: string; room: string }) => {
      if (data.room === getChatRoom()) {
        setTypingUsers(prev => [...prev.filter(u => u !== data.user), data.user]);
      }
    });

    socket.on('typing_stop', (data: { user: string; room: string }) => {
      if (data.room === getChatRoom()) {
        setTypingUsers(prev => prev.filter(u => u !== data.user));
      }
    });

    // Listen for message read receipts
    socket.on('message_read', (data: { messageId: string; userId: number }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId 
          ? { ...msg, is_read: true }
          : msg
      ));
    });
  };

  const getChatRoom = () => {
    if (assignmentId) return `assignment_${assignmentId}_${studentId}`;
    if (quizId) return `quiz_${quizId}_${studentId}`;
    return `general_${studentId}`;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const messageData = {
        sender_id: currentUserId,
        sender_name: currentUserName,
        sender_role: currentUserRole,
        message: newMessage.trim(),
        student_id: studentId,
        message_type: 'text',
        reply_to: replyingTo?.id,
        ...(assignmentId && { assignment_id: assignmentId }),
        ...(quizId && { quiz_id: quizId })
      };

      const response = await apiService.post('/chat/send', messageData);
      
      if (response.data.success) {
        const newMsg = response.data.message;
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        setReplyingTo(null);
        
        // Emit WebSocket event for real-time updates
        if (socket) {
          socket.emit('chat_message', {
            ...newMsg,
            room: getChatRoom()
          });
        }
        
        // Stop typing indicator
        if (socket) {
          socket.emit('typing_stop', {
            user: currentUserName,
            room: getChatRoom()
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      if (socket) {
        socket.emit('typing_start', {
          user: currentUserName,
          room: getChatRoom()
        });
      }
    }
    
    // Stop typing after 3 seconds of inactivity
    setTimeout(() => {
      if (isTyping && socket) {
        socket.emit('typing_stop', {
          user: currentUserName,
          room: getChatRoom()
        });
        setIsTyping(false);
      }
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  if (loading) {
    return (
      <div className="messages-container">
        <div className="chat-loading">
          <div className="chat-loading-spinner"></div>
          <div className="chat-loading-text">Loading chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Enhanced Messages Content */}
      <div className="messages-container">

        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-16">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-lg font-semibold mb-2 text-gray-700">Start the conversation!</p>
            <p className="text-sm text-gray-600">Send a message to begin discussing this {assignmentId ? 'assignment' : 'quiz'}.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message-bubble ${message.sender_id === currentUserId ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <div className="message-text">
                  {message.message}
                </div>
                <div className="message-meta">
                  <div className="message-time">
                    {formatTimestamp(message.timestamp)}
                  </div>
                  {message.sender_id === currentUserId && (
                    <div className={`message-status ${message.is_read ? 'read' : 'sent'}`}>
                      {message.is_read ? (
                        <CheckCheck className="w-3 h-3" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Enhanced Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
            <div className="typing-text">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Message Input */}
      <div className="message-input-container">
        <div className="message-input-wrapper">
          <div className="message-actions">
            <button className="message-action-btn">
              <ImageIcon className="w-4 h-4" />
            </button>
            <button className="message-action-btn">
              <FileText className="w-4 h-4" />
            </button>
            <button className="message-action-btn">
              <Smile className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="message-input"
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            className="send-button"
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <div className="chat-loading-spinner"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackChat;
