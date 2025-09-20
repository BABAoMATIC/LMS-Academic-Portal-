export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  gender?: string;
  phone?: string;
  dob?: string;
  profile_image?: string;
  social_links?: Record<string, any>;
  last_active?: string;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: number;
  teacher_id: number;
  title: string;
  description?: string;
  deadline: string;
  due_date?: string; // Alternative to deadline
  duration_minutes?: number;
  duration?: number; // Alternative to duration_minutes
  max_marks?: number;
  questions: Record<string, any>;
  status?: 'not_attempted' | 'attempted' | 'graded' | 'completed' | 'in_progress';
  score?: number;
  total_questions?: number;
  marks_obtained?: number;
  total_marks?: number;
  percentage?: number;
  grade?: string;
  module_name?: string;
  created_at: string;
  updated_at: string;
  question_objects?: Question[];
}

export interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  type: 'multiple_choice' | 'short_answer' | 'essay';
  options?: Record<string, any>;
  correct_answer?: string;
  hint?: string;
  marks: number;
  order: number;
  created_at: string;
  answers?: Answer[];
}

export interface Answer {
  id: number;
  student_id: number;
  quiz_id: number;
  question_id: number;
  answer_text: string;
  is_correct: boolean;
  marks_obtained: number;
  created_at: string;
}

export interface Assignment {
  id: number;
  teacher_id: number;
  title: string;
  description?: string;
  deadline: string;
  due_date?: string; // Alternative to deadline
  max_marks?: number;
  total_marks?: number; // Alternative to max_marks
  file_path?: string;
  assignment_metadata?: Record<string, any>;
  status?: 'pending' | 'submitted' | 'graded' | 'late';
  grade?: number;
  marks_obtained?: number;
  percentage?: number;
  module_name?: string;
  teacher_name?: string;
  submission_id?: number;
  submission_time?: string;
  version?: number;
  feedback?: string;
  feedback_marks?: number;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: number;
  student_id: number;
  assignment_id: number;
  file_path: string;
  version: number;
  timestamp: string;
  assignment_title?: string;
  file_name?: string;
  submitted_at?: string;
  status?: string;
  grade?: number;
  feedback?: string;
  versions?: SubmissionVersion[];
  file_size?: number;
  file_type?: string;
}

export interface SubmissionVersion {
  id: number;
  submission_id: number;
  file_path: string;
  timestamp: string;
  version_number: number;
}

export interface Feedback {
  id: number;
  teacher_id: number;
  student_id: number;
  assignment_id: number;
  comments?: string;
  marks?: number;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: number;
  title: string;
  category: string;
  description?: string;
  file_path?: string;
  download_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  message: string;
  type: 'assignment' | 'quiz' | 'feedback' | 'general' | 'submission';
  read: boolean;
  timestamp: string;
}

export interface CalendarEvent {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  deadline: string;
  type: 'quiz' | 'assignment' | 'general';
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  timestamp: string;
}

export interface DashboardMetrics {
  modules_completed: number;
  total_modules: number;
  assignments_completed: number;
  total_assignments: number;
  quizzes_attempted: number;
  total_quizzes: number;
  gpa: number;
}

export interface WeeklyProgress {
  week: string;
  submissions: number;
}

export interface ModuleCompletion {
  module: string;
  completed: boolean;
  progress: number;
}

export interface RecentFeedback {
  assignment: string;
  feedback: string;
  grade: number;
  date: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  charts: {
    weekly_progress: WeeklyProgress[];
    module_completion: ModuleCompletion[];
  };
  recent_feedback: RecentFeedback[];
}

export interface CourseProgress {
  id: number;
  title: string;
  description?: string;
  content_link?: string;
  progress_percentage: number;
  is_completed: boolean;
  order?: number;
  subject_id: number;
}

export interface SubjectWithCourses {
  id: number;
  title: string;
  description?: string;
  is_active: boolean;
  courses: CourseProgress[];
}

export interface UpcomingTask {
  id: number;
  title: string;
  type: 'quiz' | 'assignment';
  deadline: string;
  subject: string;
  course: string;
}

export interface Quote {
  id: number;
  text: string;
  author: string;
  category?: string;
}

export interface StudentAchievement {
  id: number;
  student_id: number;
  title: string;
  description: string;
  type: 'academic' | 'sports' | 'cultural' | 'leadership';
  date: string;
  image_url?: string;
}

export interface KPIData {
  cgpa?: number;
  total_submissions?: number;
  quiz_performance?: number;
  total_students?: number;
  pending_feedbacks?: number;
  quizzes_today?: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (updatedUser: User) => void;
  validateAndFixUserId: () => Promise<boolean>;
}

export interface SocketContextType {
  socket: any;
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
}

export interface TeacherStats {
  totalStudents: number;
  totalAssignments: number;
  totalQuizzes: number;
  pendingSubmissions: number;
  totalNotifications: number;
  upcomingEvents: number;
}

// Enhanced Features Types
export interface Reflection {
  id: number;
  student_id: number;
  title: string;
  what_learned: string;
  challenges_faced?: string;
  future_goals?: string;
  reflection_date: string;
  template_id?: number;
  created_at: string;
  updated_at: string;
}

export interface ReflectionTemplate {
  id: number;
  title: string;
  description: string;
  questions: string[];
  category: 'academic' | 'personal' | 'career' | 'general';
  is_default: boolean;
  created_at: string;
}

export interface Skill {
  id: number;
  name: string;
  description: string;
  category: string;
}

export interface PortfolioEvidence {
  id: number;
  student_id: number;
  title: string;
  description?: string;
  file_path?: string;
  file_type?: string;
  evidence_type: 'before' | 'after' | 'project' | 'code' | 'teamwork' | 'presentation';
  skills: Array<{
    name: string;
    confidence: number;
  }>;
  created_at: string;
}

export interface LearningOutcome {
  id: number;
  name: string;
  description: string;
  category: string;
  evidence_count: number;
}

export interface RealTimeNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'assignment' | 'quiz' | 'feedback' | 'reflection' | 'portfolio';
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface SkillProgress {
  category: string;
  total_skills: number;
  demonstrated_skills: number;
  average_confidence: number;
}
