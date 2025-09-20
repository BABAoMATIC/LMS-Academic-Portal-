import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import apiService from '../services/api';
import { UserIdFixer } from '../utils/userIdFix';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log('🔐 AuthContext: Starting login process', { email });
      setLoading(true);
      
      console.log('📡 AuthContext: Calling API service login');
      const response = await apiService.login(email, password);
      console.log('✅ AuthContext: Login API response received', response);
      
      setUser(response.user);
      setToken(response.access_token);
      
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      console.log('🎉 AuthContext: Login successful, user set', response.user);
    } catch (error: any) {
      console.error('❌ AuthContext: Login error:', error);
      // Provide more specific error messages
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your connection.');
      } else {
        throw new Error(error.response?.data?.error || 'Login failed. Please try again.');
      }
    } finally {
      console.log('🏁 AuthContext: Setting loading to false');
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiService.register(userData);
      
      setUser(response.user);
      setToken(response.access_token);
      
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error: any) {
      console.error('Registration error:', error);
      // Provide more specific error messages
      if (error.response?.status === 409) {
        throw new Error('An account with this email already exists.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.error || 'Please check your input and try again.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your connection.');
      } else {
        throw new Error(error.response?.data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUser: User): void => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const validateAndFixUserId = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Check if the current user ID is valid
      const isValid = await UserIdFixer.isUserIdValid(user.id);
      
      if (!isValid) {
        console.log('🔧 Invalid user ID detected, attempting to fix...');
        const fixedUser = await UserIdFixer.fixUserId();
        
        if (fixedUser) {
          // Convert ValidUser to User type by adding missing properties
          const userWithRequiredProps: User = {
            ...fixedUser,
            role: fixedUser.role as 'student' | 'teacher', // Ensure role is the correct type
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setUser(userWithRequiredProps);
          localStorage.setItem('user', JSON.stringify(userWithRequiredProps));
          console.log('✅ User ID fixed successfully');
          return true;
        }
      }
      
      return isValid;
    } catch (error) {
      console.error('Error validating user ID:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    updateUser,
    validateAndFixUserId
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
