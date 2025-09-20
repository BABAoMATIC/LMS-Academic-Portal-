import { io, Socket } from 'socket.io-client';

interface StatusUpdate {
  assignment_id?: number;
  quiz_id?: number;
  student_id: number;
  status: string;
  marks_obtained?: number;
  total_marks?: number;
  percentage?: number;
  message: string;
  timestamp?: string;
  feedback?: string;
  teacher_name?: string;
}

interface AssignmentStatus {
  status: 'pending' | 'submitted' | 'graded' | 'late';
  submission_id?: number;
  marks_obtained?: number;
  total_marks?: number;
  percentage?: number;
}

interface QuizStatus {
  status: 'not_attempted' | 'attempted' | 'graded';
  attempt_id?: number;
  marks_obtained?: number;
  total_marks?: number;
  percentage?: number;
}

class StatusService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    try {
      this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5006');
      
      this.socket.on('connect', () => {
        console.log('✅ Connected to status update service');
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Disconnected from status update service');
      });

      // Listen for assignment status updates
      this.socket.on('assignment_status_update', (data: StatusUpdate) => {
        console.log('📝 Assignment status update:', data);
        this.notifyListeners('assignment_status_update', data);
      });

      // Listen for quiz status updates
      this.socket.on('quiz_status_update', (data: StatusUpdate) => {
        console.log('📊 Quiz status update:', data);
        this.notifyListeners('quiz_status_update', data);
      });

      // Listen for assignment graded events
      this.socket.on('assignment_graded', (data: StatusUpdate) => {
        console.log('🎯 Assignment graded:', data);
        this.notifyListeners('assignment_graded', data);
      });

      // Listen for quiz graded events
      this.socket.on('quiz_graded', (data: StatusUpdate) => {
        console.log('🎯 Quiz graded:', data);
        this.notifyListeners('quiz_graded', data);
      });

      // Listen for assignment submitted events
      this.socket.on('assignment_submitted', (data: StatusUpdate) => {
        console.log('📤 Assignment submitted:', data);
        this.notifyListeners('assignment_submitted', data);
      });

      // Listen for quiz completed events
      this.socket.on('quiz_completed', (data: StatusUpdate) => {
        console.log('🎯 Quiz completed:', data);
        this.notifyListeners('quiz_completed', data);
      });

      // Listen for feedback provided events
      this.socket.on('feedback_provided', (data: StatusUpdate) => {
        console.log('💬 Feedback provided:', data);
        this.notifyListeners('feedback_provided', data);
      });

      // Listen for real-time notifications
      this.socket.on('realtime_notification', (data: any) => {
        console.log('🔔 Real-time notification:', data);
        this.notifyListeners('realtime_notification', data);
      });

    } catch (error) {
      console.error('Error initializing status service socket:', error);
    }
  }

  private notifyListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in status update listener for ${event}:`, error);
      }
    });
  }

  // Subscribe to status update events
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

  // Get assignment status from API
  async getAssignmentStatus(assignmentId: number, studentId: number): Promise<AssignmentStatus> {
    try {
      const response = await fetch(`http://localhost:5006/api/status/assignment/${assignmentId}?student_id=${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assignment status');
      }

      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Error fetching assignment status:', error);
      return {
        status: 'pending'
      };
    }
  }

  // Get quiz status from API
  async getQuizStatus(quizId: number, studentId: number): Promise<QuizStatus> {
    try {
      const response = await fetch(`http://localhost:5006/api/status/quiz/${quizId}?student_id=${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz status');
      }

      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Error fetching quiz status:', error);
      return {
        status: 'not_attempted'
      };
    }
  }

  // Grade assignment (teachers only)
  async gradeAssignment(assignmentId: number, studentId: number, marks: number, totalMarks: number = 100, comments: string = '') {
    try {
      const response = await fetch(`/api/grading/assignment/${assignmentId}/grade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: studentId,
          marks: marks,
          total_marks: totalMarks,
          comments: comments
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to grade assignment');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error grading assignment:', error);
      throw error;
    }
  }

  // Grade quiz (teachers only)
  async gradeQuiz(quizId: number, studentId: number, attemptId: number, marks: number, totalMarks: number = 100) {
    try {
      const response = await fetch(`/api/grading/quiz/${quizId}/grade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          student_id: studentId,
          attempt_id: attemptId,
          marks: marks,
          total_marks: totalMarks
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to grade quiz');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error grading quiz:', error);
      throw error;
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }
}

// Create singleton instance
const statusService = new StatusService();

export default statusService;
export type { StatusUpdate, AssignmentStatus, QuizStatus };
