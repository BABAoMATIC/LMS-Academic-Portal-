import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Users, BarChart3, FileText, Clock, MessageCircle } from 'lucide-react';

const TeacherHome: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="p-4 sm:p-6">
      {/* Welcome Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {t('home.teacher.welcome', { name: user?.name }) || `Welcome, ${user?.name || 'Teacher'}! 👨‍🏫`}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
          Manage your classes, create content, and track student progress
        </p>
      </div>

      {/* Welcome Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-3">
          Welcome to EduPlatform!
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
          This is your teacher dashboard. Here you can create assignments, manage quizzes, 
          review student submissions, and track class performance.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Active Students</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">24</p>
              <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">This Semester</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Assignments</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">8</p>
              <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">Active</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Quizzes</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">5</p>
              <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400">Created</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 mb-2 mx-auto" />
              <p className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100 text-center">Create Assignment</p>
            </button>
            <button className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400 mb-2 mx-auto" />
              <p className="text-xs sm:text-sm font-medium text-green-900 dark:text-green-100 text-center">Create Quiz</p>
            </button>
            <button className="p-3 sm:p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400 mb-2 mx-auto" />
              <p className="text-xs sm:text-sm font-medium text-purple-900 dark:text-purple-100 text-center">View Analytics</p>
            </button>
            <button className="p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400 mb-2 mx-auto" />
              <p className="text-xs sm:text-sm font-medium text-orange-900 dark:text-orange-100 text-center">Messages</p>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Created Math Assignment</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Published Science Quiz</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Updated Course Schedule</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherHome;
