import React from 'react';
import { User, Mail, GraduationCap, Settings, LogOut } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';

interface ProfilePreviewCardProps {
  loading: boolean;
}

const ProfilePreviewCard: React.FC<ProfilePreviewCardProps> = ({ loading }) => {
  const { user, logout } = useAuth();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">User not found</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <User className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Account information
          </p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <User className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <Mail className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <GraduationCap className="w-5 h-5 text-gray-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Student
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <button className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
          <Settings className="w-4 h-4" />
          <span>Account Settings</span>
        </button>
        
        <button className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
          <GraduationCap className="w-4 h-4" />
          <span>Academic Records</span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePreviewCard;
