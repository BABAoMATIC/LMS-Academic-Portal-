import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  User,
  Quiz,
  Assignment,
  Submission,
  Feedback,
  Resource,
  Notification,
  CalendarEvent,
  Chat,
  Quote,
  StudentAchievement,
  KPIData,
  UpcomingTask,
  SubjectWithCourses,
  CourseProgress
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5006/api';

class ApiService {
  private api: AxiosInstance;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
      withCredentials: false, // Disable credentials for CORS
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Cache management
  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  // Clear specific cache entries
  clearStudentDashboardCache(studentId: number): void {
    this.cache.delete(`student_dashboard_${studentId}`);
  }

  clearStudentQuizCache(studentId: number): void {
    this.cache.delete(`student_quiz_status_${studentId}`);
  }

  clearStudentSubmissionsCache(studentId: number): void {
    this.cache.delete(`student_submissions_${studentId}`);
  }

  // ==================== AUTHENTICATION ====================
  async login(email: string, password: string): Promise<{ user: User; access_token: string }> {
    const response: AxiosResponse = await this.api.post('/auth/login', { email, password });
    this.clearCache();
    return response.data;
  }

  async register(userData: Partial<User> & { password: string }): Promise<{ user: User; access_token: string }> {
    const response: AxiosResponse = await this.api.post('/auth/register', userData);
    this.clearCache();
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const cacheKey = 'current_user';
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get('/auth/me');
    this.setCachedData(cacheKey, response.data.user);
    return response.data.user;
  }

  // ==================== STUDENT API METHODS ====================
  async getStudentDashboard(studentId: number): Promise<any> {
    const cacheKey = `student_dashboard_${studentId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get(`/student/${studentId}/dashboard`);
    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  async getStudentQuizStatus(studentId: number): Promise<{ quizzes: Quiz[] }> {
    const response: AxiosResponse = await this.api.get(`/student/${studentId}/quiz-status`);
    return response.data;
  }

  async getStudentSubmissions(studentId: number): Promise<{ submissions: Submission[] }> {
    const response: AxiosResponse = await this.api.get(`/student/${studentId}/submissions`);
    return response.data;
  }



  async getStudentCourses(studentId: number, subjectId: number): Promise<{ courses: CourseProgress[] }> {
    const response: AxiosResponse = await this.api.get(`/student/${studentId}/courses?subject_id=${subjectId}`);
    return response.data;
  }

  // ==================== QUIZ API METHODS ====================
  
  async getStudentQuizzes(studentId: number): Promise<any[]> {
    const cacheKey = `student_quizzes_${studentId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get(`/student/${studentId}/quizzes`);
    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  async getQuizDetails(quizId: number): Promise<any> {
    const cacheKey = `quiz_details_${quizId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get(`/quiz/${quizId}`);
    this.setCachedData(cacheKey, response.data);
    return response.data;
  }



  async getQuizHistory(studentId: number): Promise<any[]> {
    const cacheKey = `quiz_history_${studentId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get(`/student/${studentId}/quiz-history`);
    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  // ==================== NOTIFICATION API METHODS ====================
  
  async getUserNotifications(userId: number): Promise<any[]> {
    const cacheKey = `notifications_${userId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get(`/notifications/${userId}`);
    this.setCachedData(cacheKey, response.data);
    return response.data;
  }



  async markAllNotificationsSeen(userId: number): Promise<any> {
    const response: AxiosResponse = await this.api.post('/notifications/mark-all-seen', {
      user_id: userId
    });
    // Clear notification cache after marking all as seen
    this.cache.delete(`notifications_${userId}`);
    return response.data;
  }



  async clearAllNotifications(userId: number): Promise<any> {
    const response: AxiosResponse = await this.api.post('/notifications/clear-all', {
      user_id: userId
    });
    // Clear notification cache after clearing all
    this.cache.delete(`notifications_${userId}`);
    return response.data;
  }

  // ==================== CALENDAR API METHODS ====================
  
  async getUserCalendar(userId: number): Promise<any[]> {
    const cacheKey = `calendar_${userId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get(`/calendar/${userId}`);
    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  async getUpcomingEvents(userId: number): Promise<any[]> {
    const cacheKey = `upcoming_events_${userId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get(`/calendar/${userId}/upcoming`);
    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  async createCalendarEvent(eventData: {
    user_id: number;
    title: string;
    description?: string;
    type: string;
    subject_id?: number;
    start_time: string;
    end_time: string;
  }): Promise<any> {
    const response: AxiosResponse = await this.api.post('/calendar/create', eventData);
    // Clear calendar cache after creating event
    this.cache.delete(`calendar_${eventData.user_id}`);
    this.cache.delete(`upcoming_events_${eventData.user_id}`);
    return response.data;
  }

  async editCalendarEvent(eventId: number, eventData: {
    user_id: number;
    title: string;
    description?: string;
    type: string;
    subject_id?: number;
    start_time: string;
    end_time: string;
  }): Promise<any> {
    const response: AxiosResponse = await this.api.put(`/calendar/${eventId}/edit`, eventData);
    // Clear calendar cache after editing event
    this.cache.delete(`calendar_${eventData.user_id}`);
    this.cache.delete(`upcoming_events_${eventData.user_id}`);
    return response.data;
  }

  async deleteCalendarEvent(eventId: number, userId: number): Promise<any> {
    const response: AxiosResponse = await this.api.delete(`/calendar/${eventId}`, {
      data: { user_id: userId }
    });
    // Clear calendar cache after deleting event
    this.cache.delete(`calendar_${userId}`);
    this.cache.delete(`upcoming_events_${userId}`);
    return response.data;
  }

  // ==================== PROFILE API METHODS ====================
  
  async getUserProfile(userId: number): Promise<any> {
    const cacheKey = `profile_${userId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get(`/profile/${userId}`);
    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  async updateUserProfile(userId: number, profileData: any): Promise<any> {
    const response: AxiosResponse = await this.api.put(`/profile/${userId}/update`, {
      ...profileData,
      current_user_id: userId
    });
    // Clear profile cache after update
    this.cache.delete(`profile_${userId}`);
    return response.data;
  }

  async uploadProfilePicture(userId: number, profilePictureUrl: string): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/profile/${userId}/upload-picture`, {
      profile_picture_url: profilePictureUrl,
      current_user_id: userId
    });
    // Clear profile cache after upload
    this.cache.delete(`profile_${userId}`);
    return response.data;
  }

  // ==================== MESSAGES API METHODS ====================
  
  async getUserMessages(userId: number): Promise<any[]> {
    const cacheKey = `messages_${userId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get(`/messages/${userId}`);
    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  async getConversationThread(userId: number, targetId: number): Promise<any[]> {
    const cacheKey = `conversation_${userId}_${targetId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get(`/messages/${userId}/${targetId}`);
    this.setCachedData(cacheKey, response.data);
    return response.data;
  }



  async getUnreadMessageCount(userId: number): Promise<number> {
    const response: AxiosResponse = await this.api.get(`/messages/${userId}/unread-count`);
    return response.data.unread_count;
  }

  // ==================== STUDENT ANALYTICS API METHODS ====================
  
  async getStudentAnalytics(studentId: number): Promise<any> {
    const cacheKey = `analytics_${studentId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get(`/student/${studentId}/analytics`);
    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  async getStudentRecentSubmissions(studentId: number): Promise<any> {
    const cacheKey = `recent_submissions_${studentId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get(`/student/${studentId}/recent-submissions`);
    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  async addStudentFeedback(studentId: number, feedbackData: {
    teacher_id: number;
    feedback_text: string;
    feedback_type?: string;
  }): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/student/${studentId}/feedback`, feedbackData);
    // Clear analytics cache after adding feedback
    this.cache.delete(`analytics_${studentId}`);
    return response.data;
  }

  async addStudentRemarks(studentId: number, remarksData: {
    teacher_id: number;
    remarks_text: string;
    remarks_category?: string;
  }): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/student/${studentId}/remarks`, remarksData);
    // Clear analytics cache after adding remarks
    this.cache.delete(`analytics_${studentId}`);
    return response.data;
  }

  // ==================== TEACHER DASHBOARD API METHODS ====================
  
  async getTeacherDashboardKPIs(teacherId: number): Promise<any> {
    const cacheKey = `teacher_kpis_${teacherId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get(`/teacher/${teacherId}/dashboard-kpis`);
    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  async getTeacherUpcomingTasks(teacherId: number): Promise<any[]> {
    const cacheKey = `teacher_tasks_${teacherId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get(`/teacher/${teacherId}/upcoming-tasks`);
    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  async getTeacherActivityFeed(teacherId: number): Promise<any[]> {
    const cacheKey = `teacher_activity_${teacherId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get(`/teacher/${teacherId}/activity-feed`);
    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  async getTeacherSubmissionStatus(teacherId: number): Promise<any> {
    const cacheKey = `teacher_submissions_${teacherId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get(`/teacher/${teacherId}/submission-status`);
    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  async getTeacherCalendarEvents(teacherId: number): Promise<any[]> {
    const cacheKey = `teacher_calendar_${teacherId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }
    const response: AxiosResponse = await this.api.get(`/teacher/${teacherId}/calendar-events`);
    this.setCachedData(cacheKey, response.data);
    return response.data;
  }

  async getUpcomingTasks(studentId: number): Promise<UpcomingTask[]> {
    // This would need to be implemented in the backend
    // For now, we'll return mock data or combine existing endpoints
    const [assignments, quizzes] = await Promise.all([
      this.getActiveAssignments(),
      this.getQuizzes()
    ]);
    
    const upcomingTasks: UpcomingTask[] = [];
    
    // Add upcoming assignments
    assignments.forEach(assignment => {
      if (new Date(assignment.deadline) > new Date()) {
        upcomingTasks.push({
          id: assignment.id,
          title: assignment.title,
          type: 'assignment',
          deadline: assignment.deadline,
          subject: 'General', // Would need subject info from backend
          course: 'General Course' // Would need course info from backend
        });
      }
    });
    
    // Add upcoming quizzes
    quizzes.forEach(quiz => {
      if (new Date(quiz.deadline) > new Date()) {
        upcomingTasks.push({
          id: quiz.id,
          title: quiz.title,
          type: 'quiz',
          deadline: quiz.deadline,
          subject: 'General', // Would need subject info from backend
          course: 'General Course' // Would need course info from backend
        });
      }
    });
    
    // Sort by deadline
    return upcomingTasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }

  async getSubjectWithCourses(studentId: number, subjectId: number): Promise<SubjectWithCourses> {
    const [subjectResponse, coursesResponse] = await Promise.all([
      this.api.get(`/student/${studentId}/subjects`),
      this.api.get(`/student/${studentId}/courses?subject_id=${subjectId}`)
    ]);
    
    const subject = subjectResponse.data.subjects.find((s: any) => s.id === subjectId);
    const courses = coursesResponse.data.courses.map((course: any) => ({
      ...course,
      progress_percentage: course.progress_percentage || 0,
      is_completed: course.is_completed || false
    }));
    
    return {
      ...subject,
      courses
    };
  }

  // ==================== TEACHER API METHODS ====================
  async getTeacherDashboard(teacherId: number): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/teacher/${teacherId}/dashboard`);
    return response.data;
  }

  async getTeacherStudents(teacherId: number, subjectId?: number): Promise<{ students: User[] }> {
    const params = subjectId ? { subject_id: subjectId } : {};
    const response: AxiosResponse = await this.api.get(`/teacher/${teacherId}/students`, { params });
    return response.data;
  }

  async getTeacherSubjects(teacherId: number): Promise<{ subjects: any[] }> {
    const response: AxiosResponse = await this.api.get(`/teacher/${teacherId}/subjects`);
    return response.data;
  }

  async getTeacherCourses(teacherId: number, subjectId: number): Promise<{ courses: any[] }> {
    const response: AxiosResponse = await this.api.get(`/teacher/${teacherId}/courses`, {
      params: { subject_id: subjectId }
    });
    return response.data;
  }

  async getTeacherProfile(teacherId: number): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/teacher/${teacherId}/profile`);
    return response.data;
  }

  async updateTeacherProfile(teacherId: number, profileData: any): Promise<any> {
    const response: AxiosResponse = await this.api.put(`/teacher/${teacherId}/profile`, profileData);
    return response.data;
  }

  // ==================== QUIZ API METHODS ====================
  async createQuiz(quizData: {
    title: string;
    description: string;
    teacher_id: number;
    deadline?: string;
    is_active?: boolean;
    questions: Array<{
      question_text: string;
      question_type: string;
      options: string[];
      correct_answer: number;
      marks: number;
    }>;
  }): Promise<Quiz> {
    const response: AxiosResponse = await this.api.post('/quiz/create', quizData);
    return response.data.quiz;
  }


  async getQuizzes(): Promise<Quiz[]> {
    const response: AxiosResponse = await this.api.get('/quizzes');
    return response.data.quizzes;
  }

  async submitQuiz(quizId: number, answers: Array<{ question_id: number; answer: number }>): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/quiz/${quizId}/submit`, { answers });
    
    // Clear relevant caches after quiz submission
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      this.clearStudentDashboardCache(user.id);
      this.clearStudentQuizCache(user.id);
    }
    
    return response.data;
  }

  // ==================== ASSIGNMENT API METHODS ====================
  async getAssignments(): Promise<Assignment[]> {
    const response: AxiosResponse = await this.api.get('/assignments');
    return response.data.assignments;
  }

  async getActiveAssignments(): Promise<Assignment[]> {
    const response: AxiosResponse = await this.api.get('/assignments');
    return response.data.assignments;
  }

  async createAssignment(assignmentData: Partial<Assignment>): Promise<Assignment> {
    const response: AxiosResponse = await this.api.post('/assignments', assignmentData);
    return response.data.assignment;
  }

  // ==================== SUBMISSION API METHODS ====================
  async uploadSubmission(submissionData: {
    assignment_id: number;
    file_path: string;
    title?: string;
    description?: string;
  }): Promise<Submission> {
    const response: AxiosResponse = await this.api.post('/submissions/upload', submissionData);
    return response.data.submission;
  }

  async submitAssignment(formData: FormData): Promise<any> {
    const response: AxiosResponse = await this.api.post('/submissions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // Clear relevant caches after assignment submission
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      this.clearStudentDashboardCache(user.id);
      this.clearStudentSubmissionsCache(user.id);
    }
    
    return response.data;
  }

  async getTeacherSubmissions(teacherId: number, studentId?: number): Promise<{ submissions: Submission[] }> {
    const params = studentId ? { student_id: studentId } : {};
    const response: AxiosResponse = await this.api.get(`/teacher/${teacherId}/submissions`, { params });
    return response.data;
  }

  async submitFeedback(submissionId: number, feedback: string, grade: number): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/submissions/${submissionId}/feedback`, {
      feedback,
      grade
    });
    return response.data;
  }

  // ==================== RESOURCE API METHODS ====================
  async getResources(category?: string): Promise<{ resources: Resource[] }> {
    const params = category ? { category } : {};
    const response: AxiosResponse = await this.api.get('/resources', { params });
    return response.data;
  }

  // ==================== NOTIFICATION API METHODS ====================
  async getNotifications(page: number = 1, perPage: number = 20, unreadOnly: boolean = false): Promise<{
    notifications: Notification[];
    total: number;
    pages: number;
    current_page: number;
    has_next: boolean;
    has_prev: boolean;
  }> {
    const params = { page, per_page: perPage, unread_only: unreadOnly };
    const response: AxiosResponse = await this.api.get('/notifications', { params });
    return response.data;
  }

  async markNotificationAsRead(notificationId: number): Promise<any> {
    const response: AxiosResponse = await this.api.put(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<any> {
    const response: AxiosResponse = await this.api.put('/notifications/read-all');
    return response.data;
  }

  async deleteNotification(notificationId: number, userId: number): Promise<any> {
    const response: AxiosResponse = await this.api.delete(`/notifications/${notificationId}`, {
      data: { user_id: userId }
    });
    return response.data;
  }

  async markNotificationSeen(notificationId: number, userId: number): Promise<any> {
    const response: AxiosResponse = await this.api.post('/notifications/mark-seen', {
      notification_id: notificationId,
      user_id: userId
    });
    return response.data;
  }

  // ==================== MESSAGE API METHODS ====================
  async getMessages(userId: number): Promise<{ conversations: any[] }> {
    const response: AxiosResponse = await this.api.get(`/messages/${userId}`);
    return response.data;
  }

  async sendMessage(messageData: { sender_id: number; receiver_id: number; message_text: string }): Promise<any> {
    const response: AxiosResponse = await this.api.post('/messages/send', messageData);
    return response.data;
  }

  // ==================== CALENDAR API METHODS ====================
  async getCalendarEvents(userId: number): Promise<CalendarEvent[]> {
    const response: AxiosResponse = await this.api.get(`/calendar/${userId}`);
    return response.data.events;
  }

  // ==================== COURSE MANAGEMENT API METHODS ====================
  async createCourse(courseData: {
    title: string;
    description?: string;
    content_link?: string;
    subject_id: number;
    order?: number;
  }): Promise<any> {
    const response: AxiosResponse = await this.api.post('/courses/create', courseData);
    return response.data;
  }

  async updateCourse(courseId: number, courseData: {
    title?: string;
    description?: string;
    content_link?: string;
    order?: number;
  }): Promise<any> {
    const response: AxiosResponse = await this.api.put(`/courses/${courseId}/update`, courseData);
    return response.data;
  }

  async deleteCourse(courseId: number): Promise<any> {
    const response: AxiosResponse = await this.api.delete(`/courses/${courseId}`);
    return response.data;
  }

  // ==================== STUDENT SEARCH API METHODS ====================
  async searchStudents(query: string, subjectId?: number): Promise<{ students: User[] }> {
    const params: any = { query };
    if (subjectId) params.subject_id = subjectId;
    const response: AxiosResponse = await this.api.get('/students/search', { params });
    return response.data;
  }

  async getStudentPerformance(studentId: number): Promise<any> {
    const response: AxiosResponse = await this.api.get(`/student/${studentId}/performance`);
    return response.data;
  }

  async submitStudentFeedback(studentId: number, feedbackData: { content: string; rating: number }): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/student/${studentId}/feedback`, feedbackData);
    return response.data;
  }

  async submitStudentRemarks(studentId: number, remarksData: { remarks: string }): Promise<any> {
    const response: AxiosResponse = await this.api.post(`/student/${studentId}/remarks`, remarksData);
    return response.data;
  }

  // ==================== UTILITY METHODS ====================
  async getQuotes(): Promise<Quote[]> {
    const response: AxiosResponse = await this.api.get('/quotes');
    return response.data.quotes;
  }

  async getStudentAchievements(studentId: number): Promise<StudentAchievement[]> {
    const response: AxiosResponse = await this.api.get(`/student/${studentId}/achievements`);
    return response.data.achievements;
  }

  async getKPIData(userId: number, role: string): Promise<KPIData> {
    const response: AxiosResponse = await this.api.get(`/kpi/${role}/${userId}`);
    return response.data;
  }

  // Clear cache method for external use
  clearAllCache(): void {
    this.clearCache();
  }

  // ==================== BASIC HTTP METHODS ====================
  async get(url: string, config?: any): Promise<any> {
    return this.api.get(url, config);
  }

  async post(url: string, data?: any, config?: any): Promise<any> {
    return this.api.post(url, data, config);
  }

  async put(url: string, data?: any, config?: any): Promise<any> {
    return this.api.put(url, data, config);
  }

  async delete(url: string, config?: any): Promise<any> {
    return this.api.delete(url, config);
  }

  // Public methods for direct API access
  async getStudents(): Promise<any> {
    return this.api.get('/students');
  }

  async getSubmissions(): Promise<any> {
    return this.api.get('/submissions');
  }

  async getTeacherStats(teacherId: number): Promise<any> {
    return this.api.get(`/teacher/${teacherId}/stats`);
  }

  async getTeacherQuizzes(teacherId: number): Promise<{ quizzes: any[] }> {
    const response = await this.api.get(`/teacher/${teacherId}/quizzes`);
    return response.data;
  }

  async getQuizStats(quizId: number): Promise<any> {
    return this.api.get(`/quiz/${quizId}/stats`);
  }

  async getAnalytics(timeframe: string = 'week'): Promise<any> {
    return this.api.get(`/analytics?timeframe=${timeframe}`);
  }
}

// Create and export a single instance
const apiService = new ApiService();
export default apiService;
