import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Send, 
  MoreVertical, 
  Phone, 
  Video, 
  Image as ImageIcon,
  FileText,
  Smile
} from 'lucide-react';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // Handle pre-filled questions from assignment/quiz pages
  useEffect(() => {
    const pendingQuestion = localStorage.getItem('pendingQuestion');
    const pendingContext = localStorage.getItem('pendingQuestionContext');
    
    if (pendingQuestion) {
      setMessage(pendingQuestion);
      // Clear the stored question
      localStorage.removeItem('pendingQuestion');
      localStorage.removeItem('pendingQuestionContext');
      
      // Auto-select the first teacher contact if available
      const teacherContact = contacts.find(contact => 
        contact.name.toLowerCase().includes('teacher') || 
        contact.name.toLowerCase().includes('professor') ||
        contact.name.toLowerCase().includes('instructor')
      );
      
      if (teacherContact) {
        setSelectedContact(teacherContact.id);
      } else if (contacts.length > 0) {
        // Select first contact if no teacher found
        setSelectedContact(contacts[0].id);
      }
    }
  }, []);
  const [contacts] = useState([
    { id: '1', name: 'Dr. Sarah Johnson (Teacher)', status: 'Online', lastMessage: 'Great work on the project!', time: '3 hours ago' },
    { id: '2', name: 'Kayla Ramirez', status: 'Online', lastMessage: 'Hello! How are you doing?', time: '2 min ago' },
    { id: '3', name: 'Derek Smith', status: 'Offline', lastMessage: 'See you tomorrow!', time: '1 hour ago' },
    { id: '4', name: 'Mike Wilson', status: 'Away', lastMessage: 'Can you help me with this?', time: '1 day ago' }
  ]);

  const [messages] = useState([
    { id: '1', contactId: '1', text: 'Hello! How are you doing?', sender: 'contact', time: '2:30 PM' },
    { id: '2', contactId: '1', text: 'I\'m doing great, thanks! How about you?', sender: 'me', time: '2:32 PM' },
    { id: '3', contactId: '1', text: 'Pretty good! Working on some new assignments.', sender: 'contact', time: '2:35 PM' }
  ]);

  const handleSendMessage = () => {
    if (message.trim() && selectedContact) {
      // In a real app, this would send the message to the backend
      console.log('Sending message:', message);
      
      // Show success message
      alert('Message sent successfully! Your teacher will receive your message.');
      
      setMessage('');
    } else if (!selectedContact) {
      alert('Please select a contact to send the message to.');
    } else {
      alert('Please enter a message.');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="messages-page">
      {/* Messages Sidebar */}
      <div className="messages-sidebar">
        <div className="messages-header">
          <h2>Messages</h2>
          <p>Stay connected with your teachers through real-time messaging</p>
          <div className="unread-indicator">
            <span>7 unread messages</span>
          </div>
        </div>

        {/* Search */}
        <div className="messages-search">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search teachers..."
            className="search-input"
          />
        </div>

        {/* Contacts List */}
        <div className="contacts-list">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`contact-item ${selectedContact === contact.id ? 'active' : ''}`}
              onClick={() => setSelectedContact(contact.id)}
            >
              <div className="contact-avatar">
                {contact.name.charAt(0)}
              </div>
              <div className="contact-info">
                <div className="contact-name">{contact.name}</div>
                <div className="contact-status">{contact.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Main */}
      <div className="messages-main">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-contact-info">
                <div className="contact-avatar">
                  {contacts.find(c => c.id === selectedContact)?.name.charAt(0)}
                </div>
                <div>
                  <div className="contact-name">
                    {contacts.find(c => c.id === selectedContact)?.name}
                  </div>
                  <div className="contact-status">
                    {contacts.find(c => c.id === selectedContact)?.status}
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

            {/* Messages */}
            <div className="messages-content">
              {messages
                .filter(msg => msg.contactId === selectedContact)
                .map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender === 'me' ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      {msg.text}
                    </div>
                    <div className="message-time">{msg.time}</div>
                  </div>
                ))}
            </div>

            {/* Message Input */}
            <div className="message-input">
              <div className="input-actions">
                <button className="input-action-btn">
                  <ImageIcon className="w-4 h-4" />
                </button>
                <button className="input-action-btn">
                  <FileText className="w-4 h-4" />
                </button>
                <button className="input-action-btn">
                  <Smile className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="message-text-input"
              />
              <button
                onClick={handleSendMessage}
                className="send-button"
                disabled={!message.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-icon">
              <Search className="w-16 h-16" />
            </div>
            <h3>Select a conversation</h3>
            <p>Choose a teacher from the list to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
