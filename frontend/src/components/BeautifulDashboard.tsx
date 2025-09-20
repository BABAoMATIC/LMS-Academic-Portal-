import React from 'react';
import { BookOpen, Users, Award, TrendingUp, Calendar, FileText, MessageSquare, Bell } from 'lucide-react';

const BeautifulDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            EduPlatform Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the beautiful new design with modern gradients, glassmorphism, and smooth animations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="card gradient-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">2,847</p>
                <p className="text-sm text-green-600 flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="card gradient-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Courses</p>
                <p className="text-3xl font-bold text-gray-900">156</p>
                <p className="text-sm text-blue-600 flex items-center mt-2">
                  <BookOpen className="w-4 h-4 mr-1" />
                  23 new this week
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="card gradient-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Assignments</p>
                <p className="text-3xl font-bold text-gray-900">89</p>
                <p className="text-sm text-purple-600 flex items-center mt-2">
                  <FileText className="w-4 h-4 mr-1" />
                  15 due today
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="card gradient-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Achievements</p>
                <p className="text-3xl font-bold text-gray-900">1,234</p>
                <p className="text-sm text-orange-600 flex items-center mt-2">
                  <Award className="w-4 h-4 mr-1" />
                  67 earned today
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                <button className="btn btn-secondary">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {[
                  { user: 'Sarah Johnson', action: 'completed assignment', course: 'Advanced Mathematics', time: '2 minutes ago', avatar: 'SJ' },
                  { user: 'Mike Chen', action: 'joined course', course: 'Web Development', time: '15 minutes ago', avatar: 'MC' },
                  { user: 'Emma Wilson', action: 'achieved badge', course: 'Science Lab', time: '1 hour ago', avatar: 'EW' },
                  { user: 'Alex Brown', action: 'submitted quiz', course: 'History 101', time: '2 hours ago', avatar: 'AB' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {activity.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-600">{activity.course}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn btn-primary">
                  <Calendar className="w-5 h-5" />
                  Schedule Class
                </button>
                <button className="w-full btn btn-secondary">
                  <MessageSquare className="w-5 h-5" />
                  Send Message
                </button>
                <button className="w-full btn btn-secondary">
                  <Bell className="w-5 h-5" />
                  Create Alert
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Course Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Mathematics</span>
                    <span className="text-gray-900 font-semibold">85%</span>
                  </div>
                  <div className="progress-modern h-3">
                    <div className="progress-fill-modern h-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Science</span>
                    <span className="text-gray-900 font-semibold">72%</span>
                  </div>
                  <div className="progress-modern h-3">
                    <div className="progress-fill-modern h-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">History</span>
                    <span className="text-gray-900 font-semibold">93%</span>
                  </div>
                  <div className="progress-modern h-3">
                    <div className="progress-fill-modern h-full" style={{ width: '93%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12">
          <div className="card text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Explore our beautiful new interface and discover all the amazing features we've built for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn btn-primary">
                Explore Courses
              </button>
              <button className="btn btn-secondary">
                View Analytics
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeautifulDashboard;
