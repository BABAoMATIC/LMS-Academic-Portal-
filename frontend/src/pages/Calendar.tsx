import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Trash2,
  Clock,
  BookOpen,
  Award,
  MessageSquare,
  FileText,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  type: string;
  subject_name?: string;
  start_time: string;
  end_time: string;
  created_by: number;
  creator_name?: string;
  is_personal: boolean;
}

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false); // Set to false for demo
  const [error, setError] = useState<string | null>(null);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  // Modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [calendarData, upcomingData] = await Promise.all([
        apiService.getUserCalendar(user!.id),
        apiService.getUpcomingEvents(user!.id)
      ]);
      
      setEvents(calendarData);
      setUpcomingEvents(upcomingData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch calendar data');
      console.error('Error fetching calendar data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      fetchCalendarData();
    }
  }, [user, fetchCalendarData]);

  // Mock data for demo
  useEffect(() => {
    const mockEvents: CalendarEvent[] = [
      {
        id: 1,
        title: "Mathematics Assignment 2",
        description: "Calculus problems and solutions. Submit your work through the portal.",
        type: "assignment",
        subject_name: "Mathematics",
        start_time: "2024-02-15T23:59:00Z",
        end_time: "2024-02-15T23:59:00Z",
        created_by: 1,
        creator_name: "Dr. Smith",
        is_personal: false
      },
      {
        id: 2,
        title: "Physics Quiz",
        description: "Mechanics and thermodynamics quiz covering chapters 5-8.",
        type: "quiz",
        subject_name: "Physics",
        start_time: "2024-02-20T14:00:00Z",
        end_time: "2024-02-20T15:30:00Z",
        created_by: 2,
        creator_name: "Prof. Johnson",
        is_personal: false
      },
      {
        id: 3,
        title: "Study Group Meeting",
        description: "Weekly study session for Computer Science students.",
        type: "meeting",
        subject_name: "Computer Science",
        start_time: "2024-02-18T16:00:00Z",
        end_time: "2024-02-18T18:00:00Z",
        created_by: 3,
        creator_name: "Study Group Leader",
        is_personal: true
      },
      {
        id: 4,
        title: "Literature Analysis Deadline",
        description: "Critical analysis of selected texts due today.",
        type: "deadline",
        subject_name: "English Literature",
        start_time: "2024-02-25T23:59:00Z",
        end_time: "2024-02-25T23:59:00Z",
        created_by: 4,
        creator_name: "Dr. Williams",
        is_personal: false
      },
      {
        id: 5,
        title: "Tutorial Session",
        description: "One-on-one tutorial session for advanced topics.",
        type: "session",
        subject_name: "Mathematics",
        start_time: "2024-02-22T10:00:00Z",
        end_time: "2024-02-22T11:00:00Z",
        created_by: 1,
        creator_name: "Dr. Smith",
        is_personal: true
      }
    ];

    const mockUpcomingEvents: CalendarEvent[] = [
      {
        id: 6,
        title: "Chemistry Lab Report",
        description: "Submit your chemistry lab report.",
        type: "assignment",
        subject_name: "Chemistry",
        start_time: "2024-02-28T23:59:00Z",
        end_time: "2024-02-28T23:59:00Z",
        created_by: 5,
        creator_name: "Dr. Brown",
        is_personal: false
      },
      {
        id: 7,
        title: "Student Council Meeting",
        description: "Monthly student council meeting to discuss campus events.",
        type: "meeting",
        subject_name: "General",
        start_time: "2024-02-26T15:00:00Z",
        end_time: "2024-02-26T16:30:00Z",
        created_by: 6,
        creator_name: "Student Council",
        is_personal: false
      }
    ];

    setEvents(mockEvents);
    setUpcomingEvents(mockUpcomingEvents);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  className="mt-3 bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm hover:bg-red-200"
                  onClick={fetchCalendarData}
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-page">
      <div className="calendar-container">
        {/* Header */}
        <div className="calendar-header">
          <div className="header-content">
            <div className="header-info">
              <h1>Academic Calendar</h1>
              <p>Track your academic events, deadlines, and sessions</p>
            </div>
            
            {user?.role === 'teacher' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="header-button"
              >
                <Plus className="h-4 w-4" />
                Create Event
              </button>
            )}
          </div>
        </div>

        {/* Calendar Content */}
        <div className="calendar-content">
          <h2 className="content-title">
            Calendar View - Coming Soon
          </h2>
          <p className="content-description">
            Calendar functionality is being implemented. You can currently view your events below.
          </p>
        </div>

        {/* Events List */}
        <div className="events-list">
          <h3 className="events-title">All Events</h3>
          
          {events.length > 0 ? (
            <div className="events-grid">
              {events.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-content">
                    <div className="event-main">
                      <div className="event-icon">
                        {event.type === 'quiz' && <Award className="h-5 w-5 text-purple-500" />}
                        {event.type === 'assignment' && <FileText className="h-5 w-5 text-blue-500" />}
                        {event.type === 'meeting' && <Users className="h-5 w-5 text-green-500" />}
                        {event.type === 'session' && <MessageSquare className="h-5 w-5 text-yellow-500" />}
                        {event.type === 'event' && <CalendarIcon className="h-5 w-5 text-indigo-500" />}
                        {event.type === 'deadline' && <Clock className="h-5 w-5 text-red-500" />}
                      </div>
                      
                      <div className="event-details">
                        <h4 className="event-title">{event.title}</h4>
                        <p className="event-description">{event.description}</p>
                        <div className="event-meta">
                          <span className="meta-item">
                            {new Date(event.start_time).toLocaleDateString()}
                          </span>
                          <span className="meta-item">
                            {new Date(event.start_time).toLocaleTimeString()}
                          </span>
                          {event.subject_name && (
                            <span className="meta-item">
                              <BookOpen className="meta-icon" />
                              {event.subject_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="event-badges">
                      <span className={`event-badge ${event.type}`}>
                        {event.type}
                      </span>
                      
                      {event.is_personal && (
                        <span className="event-badge personal">
                          Personal
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="events-empty">No events found</p>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="upcoming-events">
          <h3 className="upcoming-title">Upcoming Events (Next 7 Days)</h3>
          
          {upcomingEvents.length > 0 ? (
            <div className="upcoming-grid">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="upcoming-card">
                  <div className="upcoming-content">
                    <div className="upcoming-icon">
                      {event.type === 'quiz' && <Award className="h-4 w-4 text-purple-500" />}
                      {event.type === 'assignment' && <FileText className="h-4 w-4 text-blue-500" />}
                      {event.type === 'meeting' && <Users className="h-4 w-4 text-green-500" />}
                      {event.type === 'session' && <MessageSquare className="h-4 w-4 text-yellow-500" />}
                      {event.type === 'event' && <CalendarIcon className="h-4 w-4 text-indigo-500" />}
                      {event.type === 'deadline' && <Clock className="h-4 w-4 text-red-500" />}
                    </div>
                    
                    <div className="upcoming-details">
                      <h4 className="upcoming-event-title">{event.title}</h4>
                      <p className="upcoming-event-time">
                        {new Date(event.start_time).toLocaleDateString()} at {new Date(event.start_time).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="events-empty">No upcoming events</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
