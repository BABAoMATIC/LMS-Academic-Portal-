import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { TrendingUp, Target, Award, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface LearningOutcome {
  id: number;
  name: string;
  description: string;
  category: string;
  evidence_count: number;
}

interface SkillProgress {
  category: string;
  total_skills: number;
  demonstrated_skills: number;
  average_confidence: number;
}

const LearningOutcomesAnalytics: React.FC = () => {
  const [outcomes, setOutcomes] = useState<LearningOutcome[]>([]);
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [outcomesResponse, skillsResponse] = await Promise.all([
        fetch(`/api/learning-outcomes?student_id=${user?.id}`),
        fetch('/api/skills')
      ]);

      const outcomesData = await outcomesResponse.json();
      const skillsData = await skillsResponse.json();

      if (outcomesData.outcomes) {
        setOutcomes(outcomesData.outcomes);
      }

      // Calculate skill progress by category
      if (skillsData.skills) {
        const categoryStats: { [key: string]: SkillProgress } = {};
        
        skillsData.skills.forEach((skill: any) => {
          if (!categoryStats[skill.category]) {
            categoryStats[skill.category] = {
              category: skill.category,
              total_skills: 0,
              demonstrated_skills: 0,
              average_confidence: 0
            };
          }
          categoryStats[skill.category].total_skills++;
        });

        setSkillProgress(Object.values(categoryStats));
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'coding': '#3B82F6',
      'debugging': '#EF4444',
      'teamwork': '#10B981',
      'problem_solving': '#F59E0B',
      'communication': '#8B5CF6',
      'quality': '#06B6D4',
      'architecture': '#84CC16',
      'learning': '#F97316'
    };
    return colors[category] || '#6B7280';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'coding': '💻',
      'debugging': '🐛',
      'teamwork': '👥',
      'problem_solving': '🧩',
      'communication': '💬',
      'quality': '✅',
      'architecture': '🏗️',
      'learning': '📚'
    };
    return icons[category] || '📊';
  };

  // Prepare data for charts
  const outcomesByCategory = outcomes.reduce((acc, outcome) => {
    if (!acc[outcome.category]) {
      acc[outcome.category] = [];
    }
    acc[outcome.category].push(outcome);
    return acc;
  }, {} as { [key: string]: LearningOutcome[] });

  const categoryLabels = Object.keys(outcomesByCategory);
  const categoryEvidenceCounts = categoryLabels.map(category => 
    outcomesByCategory[category].reduce((sum, outcome) => sum + outcome.evidence_count, 0)
  );

  const totalEvidence = outcomes.reduce((sum, outcome) => sum + outcome.evidence_count, 0);
  const completedOutcomes = outcomes.filter(outcome => outcome.evidence_count > 0).length;
  const completionRate = outcomes.length > 0 ? (completedOutcomes / outcomes.length) * 100 : 0;

  // Chart configurations
  const barChartData = {
    labels: categoryLabels.map(cat => cat.replace('_', ' ').toUpperCase()),
    datasets: [
      {
        label: 'Evidence Count',
        data: categoryEvidenceCounts,
        backgroundColor: categoryLabels.map(cat => getCategoryColor(cat)),
        borderColor: categoryLabels.map(cat => getCategoryColor(cat)),
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Learning Outcomes Evidence by Category',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const doughnutChartData = {
    labels: categoryLabels.map(cat => cat.replace('_', ' ').toUpperCase()),
    datasets: [
      {
        data: categoryEvidenceCounts,
        backgroundColor: categoryLabels.map(cat => getCategoryColor(cat)),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const doughnutChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Evidence Distribution',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2" />
          Learning Outcomes Analytics
        </h2>
        <p className="text-gray-600 mt-1">
          Track your progress across different learning outcomes and competencies
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Outcomes</p>
              <p className="text-2xl font-bold text-gray-900">{outcomes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedOutcomes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Evidence</p>
              <p className="text-2xl font-bold text-gray-900">{totalEvidence}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <Bar data={barChartData} options={barChartOptions} />
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
        </div>
      </div>

      {/* Detailed Outcomes */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Outcomes Details</h3>
        
        {categoryLabels.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No learning outcomes data</h4>
            <p className="text-gray-600">
              Start adding portfolio evidence to track your progress against learning outcomes
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {categoryLabels.map(category => (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-2">{getCategoryIcon(category)}</span>
                  <h4 className="text-lg font-semibold text-gray-900 capitalize">
                    {category.replace('_', ' ')}
                  </h4>
                  <div 
                    className="ml-auto w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCategoryColor(category) }}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {outcomesByCategory[category].map(outcome => (
                    <div key={outcome.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900">{outcome.name}</h5>
                        <span className="text-sm font-semibold text-gray-600">
                          {outcome.evidence_count} evidence
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{outcome.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min((outcome.evidence_count / 3) * 100, 100)}%`,
                            backgroundColor: getCategoryColor(category)
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {outcome.evidence_count > 0 ? 'Evidence provided' : 'No evidence yet'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">📈 Recommendations</h3>
        <div className="space-y-2 text-sm text-blue-800">
          {completionRate < 50 && (
            <p>• Focus on areas with less evidence to improve your overall completion rate</p>
          )}
          {categoryLabels.length > 0 && categoryEvidenceCounts.some(count => count === 0) && (
            <p>• Consider adding evidence for categories with no current documentation</p>
          )}
          {totalEvidence < 5 && (
            <p>• Start building your portfolio by adding more evidence of your learning</p>
          )}
          {completionRate >= 80 && (
            <p>• Great job! You're well on your way to demonstrating all learning outcomes</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningOutcomesAnalytics;
