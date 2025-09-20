import { Socket } from 'socket.io-client';
import { connectionManager } from './connectionManager';
import notificationService from './notificationService';
import apiService from './api';

interface Reminder {
  id: string;
  type: 'assignment_deadline' | 'quiz_attempt' | 'feedback_available' | 'upcoming_event';
  title: string;
  message: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  userId: number;
  relatedId?: number; // assignment_id, quiz_id, etc.
  createdAt: string;
}

interface ReminderSettings {
  assignmentReminders: boolean;
  quizReminders: boolean;
  feedbackReminders: boolean;
  reminderTime: number; // hours before deadline
  emailNotifications: boolean;
  pushNotifications: boolean;
}

class ReminderService {
  private socket: Socket | null = null;
  private reminders: Reminder[] = [];
  private settings: ReminderSettings = {
    assignmentReminders: true,
    quizReminders: true,
    feedbackReminders: true,
    reminderTime: 24, // 24 hours before deadline
    emailNotifications: true,
    pushNotifications: true
  };
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeSocket();
    this.startReminderChecks();
  }

  private async initializeSocket() {
    try {
      this.socket = await connectionManager.connect();

      this.socket.on('connect', () => {
        console.log('🔔 Reminder service connected');
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Reminder service disconnected');
      });

      // Listen for new reminders
      this.socket.on('new_reminder', (reminder: Reminder) => {
        this.addReminder(reminder);
        this.showReminderNotification(reminder);
      });

      // Listen for reminder updates
      this.socket.on('reminder_updated', (reminder: Reminder) => {
        this.updateReminder(reminder);
      });

    } catch (error) {
      console.error('Error initializing reminder service:', error);
    }
  }

  private startReminderChecks() {
    // Check for reminders every 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkUpcomingDeadlines();
    }, 5 * 60 * 1000);
  }

  private async checkUpcomingDeadlines() {
    try {
      const now = new Date();
      const reminderTime = new Date(now.getTime() + (this.settings.reminderTime * 60 * 60 * 1000));

      // Check for upcoming assignments
      if (this.settings.assignmentReminders) {
        await this.checkAssignmentDeadlines(reminderTime);
      }

      // Check for upcoming quizzes
      if (this.settings.quizReminders) {
        await this.checkQuizDeadlines(reminderTime);
      }

      // Check for available feedback
      if (this.settings.feedbackReminders) {
        await this.checkAvailableFeedback();
      }

    } catch (error) {
      console.error('Error checking upcoming deadlines:', error);
    }
  }

  private async checkAssignmentDeadlines(reminderTime: Date) {
    try {
      const response = await apiService.get('/assignments');
      if (response.data && response.data.assignments) {
        const assignments = response.data.assignments;
        
        for (const assignment of assignments) {
          const dueDate = new Date(assignment.due_date);
          
          // Check if assignment is due within reminder time
          if (dueDate <= reminderTime && dueDate > new Date()) {
            const hoursUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60));
            
            if (hoursUntilDue <= this.settings.reminderTime) {
              const reminder: Reminder = {
                id: `assignment_${assignment.id}_${Date.now()}`,
                type: 'assignment_deadline',
                title: 'Assignment Deadline Approaching',
                message: `Assignment "${assignment.title}" is due in ${hoursUntilDue} hours`,
                dueDate: assignment.due_date,
                priority: hoursUntilDue <= 2 ? 'urgent' : hoursUntilDue <= 12 ? 'high' : 'medium',
                isRead: false,
                userId: 3, // Current user ID - should be dynamic
                relatedId: assignment.id,
                createdAt: new Date().toISOString()
              };

              await this.createReminder(reminder);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking assignment deadlines:', error);
    }
  }

  private async checkQuizDeadlines(reminderTime: Date) {
    try {
      const response = await apiService.get('/quizzes');
      if (response.data && response.data.quizzes) {
        const quizzes = response.data.quizzes;
        
        for (const quiz of quizzes) {
          if (quiz.due_date) {
            const dueDate = new Date(quiz.due_date);
            
            // Check if quiz is due within reminder time
            if (dueDate <= reminderTime && dueDate > new Date()) {
              const hoursUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60));
              
              if (hoursUntilDue <= this.settings.reminderTime) {
                const reminder: Reminder = {
                  id: `quiz_${quiz.id}_${Date.now()}`,
                  type: 'quiz_attempt',
                  title: 'Quiz Deadline Approaching',
                  message: `Quiz "${quiz.title}" is due in ${hoursUntilDue} hours`,
                  dueDate: quiz.due_date,
                  priority: hoursUntilDue <= 2 ? 'urgent' : hoursUntilDue <= 12 ? 'high' : 'medium',
                  isRead: false,
                  userId: 3, // Current user ID - should be dynamic
                  relatedId: quiz.id,
                  createdAt: new Date().toISOString()
                };

                await this.createReminder(reminder);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking quiz deadlines:', error);
    }
  }

  private async checkAvailableFeedback() {
    try {
      // Check for new feedback on assignments
      const assignmentsResponse = await apiService.get('/assignments');
      if (assignmentsResponse.data && assignmentsResponse.data.assignments) {
        const assignments = assignmentsResponse.data.assignments;
        
        for (const assignment of assignments) {
          if (assignment.status === 'graded' && assignment.feedback) {
            // Check if we already have a reminder for this feedback
            const existingReminder = this.reminders.find(
              r => r.type === 'feedback_available' && r.relatedId === assignment.id
            );

            if (!existingReminder) {
              const reminder: Reminder = {
                id: `feedback_${assignment.id}_${Date.now()}`,
                type: 'feedback_available',
                title: 'New Feedback Available',
                message: `You have received feedback on assignment "${assignment.title}"`,
                dueDate: new Date().toISOString(),
                priority: 'medium',
                isRead: false,
                userId: 3, // Current user ID - should be dynamic
                relatedId: assignment.id,
                createdAt: new Date().toISOString()
              };

              await this.createReminder(reminder);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking available feedback:', error);
    }
  }

  private async createReminder(reminder: Reminder) {
    try {
      // Add to local reminders
      this.addReminder(reminder);

      // Send to backend
      await apiService.post('/reminders', reminder);

      // Show notification
      this.showReminderNotification(reminder);

    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  }

  private addReminder(reminder: Reminder) {
    // Check if reminder already exists
    const existingIndex = this.reminders.findIndex(r => r.id === reminder.id);
    if (existingIndex >= 0) {
      this.reminders[existingIndex] = reminder;
    } else {
      this.reminders.push(reminder);
    }
  }

  private updateReminder(reminder: Reminder) {
    const index = this.reminders.findIndex(r => r.id === reminder.id);
    if (index >= 0) {
      this.reminders[index] = reminder;
    }
  }

  private showReminderNotification(reminder: Reminder) {
    if (this.settings.pushNotifications) {
      notificationService.emitRealtimeNotification(
        reminder.type,
        reminder.title,
        reminder.message,
        {
          reminderId: reminder.id,
          relatedId: reminder.relatedId,
          priority: reminder.priority
        },
        reminder.priority
      );
    }
  }

  // Public methods
  getReminders(): Reminder[] {
    return this.reminders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getUnreadReminders(): Reminder[] {
    return this.reminders.filter(r => !r.isRead);
  }

  markAsRead(reminderId: string) {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (reminder) {
      reminder.isRead = true;
      this.updateReminder(reminder);
    }
  }

  markAllAsRead() {
    this.reminders.forEach(reminder => {
      reminder.isRead = true;
    });
  }

  updateSettings(newSettings: Partial<ReminderSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  getSettings(): ReminderSettings {
    return this.settings;
  }

  // Cleanup
  destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Create singleton instance
const reminderService = new ReminderService();
export default reminderService;
