import React, { useState, useEffect } from 'react';
import { Send, Users, MessageSquare, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import '../styles/notification-creator-enhanced.css';

interface Student {
  id: number;
  name: string;
  email: string;
  role?: string;
  class?: string;
}

const TeacherNotificationCreator: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    action_url: ''
  });

  const notificationTypes = [
    { value: 'general', label: 'General', icon: '📢', color: 'bg-blue-100 text-blue-800' },
    { value: 'assignment', label: 'Assignment', icon: '📝', color: 'bg-green-100 text-green-800' },
    { value: 'quiz', label: 'Quiz', icon: '📊', color: 'bg-purple-100 text-purple-800' },
    { value: 'feedback', label: 'Feedback', icon: '💬', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'announcement', label: 'Announcement', icon: '📢', color: 'bg-red-100 text-red-800' },
    { value: 'reminder', label: 'Reminder', icon: '⏰', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      // Try to fetch from API service first
      const data = await apiService.getTeacherStudents(user?.id || 1);
      
      if (data && Array.isArray(data)) {
        setStudents(data);
      } else if (data && data.students && Array.isArray(data.students)) {
        setStudents(data.students);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      // Use mock data for demonstration
      setStudents([
        { id: 1, name: 'John Doe', email: 'john.doe@example.com', class: 'Grade 10A' },
        { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', class: 'Grade 10A' },
        { id: 3, name: 'Mike Johnson', email: 'mike.johnson@example.com', class: 'Grade 10B' },
        { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@example.com', class: 'Grade 10B' },
        { id: 5, name: 'David Brown', email: 'david.brown@example.com', class: 'Grade 10A' }
      ]);
    }
  };

  const handleStudentToggle = (studentId: number) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    if (!formData.title.trim() || !formData.message.trim()) {
      alert('Please fill in both title and message');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/teacher/notifications/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacher_id: user?.id,
          student_ids: selectedStudents,
          title: formData.title,
          message: formData.message,
          type: formData.type,
          action_url: formData.action_url || null
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Notifications sent successfully:', result);
        
        // Show success message with details
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
        
        // Reset form
        setFormData({
          title: '',
          message: '',
          type: 'general',
          action_url: ''
        });
        setSelectedStudents([]);
        
        // Log success details
        console.log(`📢 Sent ${result.notifications?.length || 0} notifications to students`);
      } else {
        const error = await response.json();
        console.error('❌ Error sending notifications:', error);
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      alert('Error sending notifications');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationTypeInfo = (type: string) => {
    return notificationTypes.find(nt => nt.value === type) || notificationTypes[0];
  };

  return (
    <div className="notification-creator-container">
      <div className="notification-header">
        <div className="notification-header-icon">
          <MessageSquare />
        </div>
        <h3>Send Notification to Students</h3>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="notification-success">
          <CheckCircle />
          <span>Notifications sent successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="notification-form">
        {/* Notification Type */}
        <div className="notification-field">
          <label>Notification Type</label>
          <div className="notification-type-grid">
            {notificationTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value })}
                className={`notification-type-button ${
                  formData.type === type.value ? 'selected' : ''
                }`}
              >
                <span className="notification-type-icon">{type.icon}</span>
                <span className="notification-type-label">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="notification-field">
          <label>Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="notification-input"
            placeholder="Enter notification title..."
          />
        </div>

        {/* Message */}
        <div className="notification-field">
          <label>Message *</label>
          <textarea
            required
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="notification-textarea"
            placeholder="Enter your message to students..."
          />
        </div>

        {/* Action URL (Optional) */}
        <div className="notification-field">
          <label>Action URL (Optional)</label>
          <input
            type="url"
            value={formData.action_url}
            onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
            className="notification-input"
            placeholder="https://example.com (students will be redirected here when they click the notification)"
          />
        </div>

        {/* Student Selection */}
        <div className="notification-field">
          <div className="student-selection-header">
            <label>Select Students *</label>
            <button
              type="button"
              onClick={handleSelectAll}
              className="student-select-all-button"
            >
              {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="student-list-container">
            {students.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No students found</p>
            ) : (
              <div>
                {students.map((student) => (
                  <label
                    key={student.id}
                    className="student-item"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleStudentToggle(student.id)}
                      className="student-checkbox"
                    />
                    <div className="student-info">
                      <div className="student-name">{student.name}</div>
                      <div className="student-email">{student.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          {selectedStudents.length > 0 && (
            <div className="selection-counter">
              {selectedStudents.length} student(s) selected
            </div>
          )}
        </div>

        {/* Preview */}
        {formData.title && formData.message && (
          <div className="notification-preview">
            <div className="preview-header">Preview:</div>
            <div className="preview-content">
              <div className="preview-notification">
                <span className="preview-icon">
                  {getNotificationTypeInfo(formData.type).icon}
                </span>
                <div className="preview-details">
                  <div className="preview-header-row">
                    <h4 className="preview-title">{formData.title}</h4>
                    <span className={`preview-type-badge ${getNotificationTypeInfo(formData.type).color}`}>
                      {getNotificationTypeInfo(formData.type).label}
                    </span>
                  </div>
                  <p className="preview-message">{formData.message}</p>
                  {formData.action_url && (
                    <div className="preview-link">Clickable link included</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="notification-submit-container">
          <button
            type="submit"
            disabled={loading || selectedStudents.length === 0}
            className="notification-submit-button"
          >
            {loading ? (
              <>
                <div className="notification-loading-spinner"></div>
                Sending...
              </>
            ) : (
              <>
                <Send />
                Send to {selectedStudents.length} Student(s)
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherNotificationCreator;
