import React, { useState, useEffect } from 'react';
import { TrendingUp, BookOpen, CheckCircle, Clock, Target, Award, BarChart3 } from 'lucide-react';
import apiService from '../services/api';

interface ProgressData {
  overallProgress: number;
  assignmentsCompleted: number;
  totalAssignments: number;
  quizzesCompleted: number;
  totalQuizzes: number;
  averageScore: number;
  skillsImproved: string[];
  recentAchievements: Achievement[];
  weeklyProgress: WeeklyProgress[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  date: string;
  type: 'assignment' | 'quiz' | 'skill' | 'milestone';
}

interface WeeklyProgress {
  week: string;
  assignmentsCompleted: number;
  quizzesCompleted: number;
  averageScore: number;
}

const ProgressTracker: React.FC = () => {
  const [progressData, setProgressData] = useState<ProgressData>({
    overallProgress: 0,
    assignmentsCompleted: 0,
    totalAssignments: 0,
    quizzesCompleted: 0,
    totalQuizzes: 0,
    averageScore: 0,
    skillsImproved: [],
    recentAchievements: [],
    weeklyProgress: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      
      // Fetch assignments
      const assignmentsResponse = await apiService.get('/assignments');
      const assignments = assignmentsResponse.data?.assignments || [];
      
      // Fetch quizzes
      const quizzesResponse = await apiService.get('/quizzes');
      const quizzes = quizzesResponse.data?.quizzes || [];

      // Calculate progress
      const completedAssignments = assignments.filter((a: any) => a.status === 'graded' || a.status === 'submitted');
      const completedQuizzes = quizzes.filter((q: any) => q.status === 'completed' || q.status === 'graded');
      
      const totalAssignments = assignments.length;
      const totalQuizzes = quizzes.length;
      const assignmentsCompleted = completedAssignments.length;
      const quizzesCompleted = completedQuizzes.length;

      // Calculate average score
      const gradedAssignments = assignments.filter((a: any) => a.status === 'graded' && a.percentage);
      const gradedQuizzes = quizzes.filter((q: any) => q.status === 'graded' && q.percentage);
      
      const allScores = [
        ...gradedAssignments.map((a: any) => a.percentage),
        ...gradedQuizzes.map((q: any) => q.percentage)
      ];
      
      const averageScore = allScores.length > 0 
        ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
        : 0;

      // Calculate overall progress
      const overallProgress = totalAssignments + totalQuizzes > 0 
        ? ((assignmentsCompleted + quizzesCompleted) / (totalAssignments + totalQuizzes)) * 100 
        : 0;

      // Mock skills improved (in real app, this would come from backend)
      const skillsImproved = [
        'Problem Solving',
        'Critical Thinking',
        'Time Management',
        'Research Skills',
        'Communication'
      ];

      // Mock recent achievements
      const recentAchievements: Achievement[] = [
        {
          id: '1',
          title: 'First Assignment Complete',
          description: 'Successfully submitted your first assignment',
          icon: '🎯',
          date: '2024-01-15',
          type: 'assignment'
        },
        {
          id: '2',
          title: 'Quiz Master',
          description: 'Scored 90% or above on 3 consecutive quizzes',
          icon: '🏆',
          date: '2024-01-14',
          type: 'quiz'
        },
        {
          id: '3',
          title: 'Skill Builder',
          description: 'Improved in Problem Solving',
          icon: '💡',
          date: '2024-01-13',
          type: 'skill'
        }
      ];

      // Mock weekly progress
      const weeklyProgress: WeeklyProgress[] = [
        { week: 'Week 1', assignmentsCompleted: 2, quizzesCompleted: 1, averageScore: 85 },
        { week: 'Week 2', assignmentsCompleted: 3, quizzesCompleted: 2, averageScore: 88 },
        { week: 'Week 3', assignmentsCompleted: 2, quizzesCompleted: 1, averageScore: 92 },
        { week: 'Week 4', assignmentsCompleted: 4, quizzesCompleted: 3, averageScore: 90 }
      ];

      setProgressData({
        overallProgress,
        assignmentsCompleted,
        totalAssignments,
        quizzesCompleted,
        totalQuizzes,
        averageScore,
        skillsImproved,
        recentAchievements,
        weeklyProgress
      });

    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-emerald-600';
    if (progress >= 60) return 'from-blue-500 to-cyan-600';
    if (progress >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Overall Progress</h2>
              <p className="text-sm text-gray-600">Your learning journey so far</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">
              {progressData.overallProgress.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor(progressData.overallProgress)} transition-all duration-500`}
              style={{ width: `${progressData.overallProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {progressData.assignmentsCompleted}
            </div>
            <div className="text-sm text-gray-600">Assignments</div>
            <div className="text-xs text-gray-500">
              of {progressData.totalAssignments} total
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {progressData.quizzesCompleted}
            </div>
            <div className="text-sm text-gray-600">Quizzes</div>
            <div className="text-xs text-gray-500">
              of {progressData.totalQuizzes} total
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(progressData.averageScore)}`}>
              {progressData.averageScore.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Average Score</div>
            <div className="text-xs text-gray-500">Overall performance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {progressData.skillsImproved.length}
            </div>
            <div className="text-sm text-gray-600">Skills</div>
            <div className="text-xs text-gray-500">Improved</div>
          </div>
        </div>
      </div>

      {/* Skills Improved */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-3">
            <Award className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Skills Improved</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {progressData.skillsImproved.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mr-3">
            <Award className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
        </div>
        <div className="space-y-3">
          {progressData.recentAchievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl mr-3">{achievement.icon}</div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(achievement.date).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mr-3">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Weekly Progress</h3>
        </div>
        <div className="space-y-4">
          {progressData.weeklyProgress.map((week, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{week.week}</div>
                  <div className="text-sm text-gray-600">
                    {week.assignmentsCompleted} assignments, {week.quizzesCompleted} quizzes
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getScoreColor(week.averageScore)}`}>
                  {week.averageScore}%
                </div>
                <div className="text-xs text-gray-500">Average</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
