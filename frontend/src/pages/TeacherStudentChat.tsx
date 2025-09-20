import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FeedbackChat from '../components/FeedbackChat';
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Image as ImageIcon,
  FileText,
  Smile,
  MessageCircle,
  BookOpen
} from 'lucide-react';
import '../styles/student-chat-enhanced.css';

interface ChatSession {
  id: string;
  student_id: number;
  student_name: string;
  assignment_id?: number;
  assignment_title?: string;
  quiz_id?: number;
  quiz_title?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

const TeacherStudentChat: React.FC = () => {
  const { user } = useAuth();
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'assignment' | 'quiz'>('all');

  // Mock chat sessions data
  const [chatSessions] = useState<ChatSession[]>([
    {
      id: '1',
      student_id: 1,
      student_name: 'John Doe',
      assignment_id: 1,
      assignment_title: 'Math Assignment',
      last_message: 'Thank you for the feedback on my assignment!',
      last_message_time: '2024-01-15T10:30:00Z',
      unread_count: 2
    },
    {
      id: '2',
      student_id: 2,
      student_name: 'Jane Smith',
      quiz_id: 1,
      quiz_title: 'Science Quiz',
      last_message: 'I have a question about the quiz results.',
      last_message_time: '2024-01-15T09:15:00Z',
      unread_count: 1
    },
    {
      id: '3',
      student_id: 3,
      student_name: 'Mike Johnson',
      assignment_id: 2,
      assignment_title: 'English Essay',
      last_message: 'Can you help me understand the project requirements?',
      last_message_time: '2024-01-14T16:45:00Z',
      unread_count: 0
    },
    {
      id: '4',
      student_id: 4,
      student_name: 'Sarah Wilson',
      quiz_id: 2,
      quiz_title: 'History Quiz',
      last_message: 'I need clarification on question 5.',
      last_message_time: '2024-01-14T14:20:00Z',
      unread_count: 3
    }
  ]);

  // Filter sessions based on search term and filter type
  const filteredSessions = chatSessions.filter(session => {
    const matchesSearch = session.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.last_message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' ||
                         (filterType === 'assignment' && session.assignment_id) ||
                         (filterType === 'quiz' && session.quiz_id);
    
    return matchesSearch && matchesFilter;
  });

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="student-chat-container">
      <div className="chat-layout">
        {/* Enhanced Messages Sidebar */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2 className="sidebar-title">Student Chat</h2>
            <p className="sidebar-subtitle">Stay connected with your students through real-time messaging</p>
            <div className="unread-indicator">
              <span>{filteredSessions.reduce((total, session) => total + session.unread_count, 0)} unread messages</span>
            </div>
          </div>

          {/* Enhanced Search and Filters */}
          <div className="sidebar-controls">
            <div className="chat-search-container">
              <Search className="chat-search-icon" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="chat-search-input"
              />
            </div>

            {/* Enhanced Filter Buttons */}
            <div className="chat-filter-tabs">
              <button
                onClick={() => setFilterType('all')}
                className={`chat-filter-tab ${filterType === 'all' ? 'active' : ''}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('assignment')}
                className={`chat-filter-tab ${filterType === 'assignment' ? 'active' : ''}`}
              >
                <FileText className="w-3 h-3 inline mr-1" />
                Assignments
              </button>
              <button
                onClick={() => setFilterType('quiz')}
                className={`chat-filter-tab ${filterType === 'quiz' ? 'active' : ''}`}
              >
                <BookOpen className="w-3 h-3 inline mr-1" />
                Quizzes
              </button>
            </div>
          </div>

          {/* Enhanced Contacts List */}
          <div className="chat-sessions-list">
          {filteredSessions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No conversations found</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`chat-session-item chat-animate-in ${selectedSession?.id === session.id ? 'active' : ''}`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="chat-session-avatar">
                  {session.student_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="chat-session-content">
                  <div className="chat-session-name">{session.student_name}</div>
                  <div className="chat-session-context">
                    {session.assignment_title || session.quiz_title || 'General Chat'}
                  </div>
                  <div className="chat-session-preview">{session.last_message}</div>
                </div>
                <div className="chat-session-meta">
                  <div className="chat-session-time">{formatLastMessageTime(session.last_message_time)}</div>
                  {session.unread_count > 0 && (
                    <div className="chat-session-badge">
                      {session.unread_count}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

        {/* Enhanced Messages Main */}
        <div className="messages-main">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-contact-info">
                <div className="contact-avatar">
                  {selectedSession.student_name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="contact-name">
                    {selectedSession.student_name}
                  </div>
                  <div className="contact-status">
                    Online
                  </div>
                </div>
              </div>
              <div className="chat-actions">
                <button className="chat-action-btn">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="chat-action-btn">
                  <Video className="w-4 h-4" />
                </button>
                <button className="chat-action-btn">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Component */}
            <div className="flex-1">
              <FeedbackChat
                assignmentId={selectedSession.assignment_id}
                quizId={selectedSession.quiz_id}
                studentId={selectedSession.student_id}
                currentUserId={user?.id || 1}
                currentUserRole={user?.role as 'student' | 'teacher' || 'teacher'}
                currentUserName={user?.name || 'Teacher'}
              />
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-icon">
              <Search className="w-16 h-16" />
            </div>
            <h3>Select a conversation</h3>
            <p>Choose a student from the list to start messaging</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default TeacherStudentChat;