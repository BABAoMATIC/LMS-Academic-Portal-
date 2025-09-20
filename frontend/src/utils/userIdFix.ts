import apiService from '../services/api';

export interface ValidUser {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'teacher';
}

/**
 * Utility to fix user ID mismatches by finding a valid user in the database
 * and updating the frontend localStorage accordingly
 */
export class UserIdFixer {
  private static readonly VALID_STUDENT_CREDENTIALS = {
    email: 'student@academic.com',
    password: 'student123'
  };

  /**
   * Attempts to fix the user ID by logging in with valid credentials
   */
  static async fixUserId(): Promise<ValidUser | null> {
    try {
      console.log('🔧 Attempting to fix user ID mismatch...');
      
      // Try to login with the known valid student credentials
      const response = await apiService.login(
        this.VALID_STUDENT_CREDENTIALS.email,
        this.VALID_STUDENT_CREDENTIALS.password
      );

      if (response && response.user) {
        console.log('✅ Successfully fixed user ID:', response.user);
        
        // Update localStorage with the correct user data
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('token', response.access_token);
        
        return response.user;
      }
    } catch (error) {
      console.error('❌ Failed to fix user ID:', error);
    }
    
    return null;
  }

  /**
   * Checks if the current user ID is valid by testing the dashboard endpoint
   */
  static async isUserIdValid(userId: number): Promise<boolean> {
    try {
      const response = await apiService.getStudentDashboard(userId);
      return response && !response.error;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the first available valid student user ID from the database
   */
  static async getValidStudentId(): Promise<number | null> {
    try {
      // Try common student IDs
      const studentIds = [1, 2, 3, 4, 5];
      
      for (const id of studentIds) {
        if (await this.isUserIdValid(id)) {
          return id;
        }
      }
    } catch (error) {
      console.error('Error finding valid student ID:', error);
    }
    
    return null;
  }
}
