import React from 'react';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

interface Module {
  id: number;
  name: string;
  code: string;
  description: string;
  progress_percentage: number;
  is_completed: boolean;
}

interface ModulePreviewCardProps {
  modules: Module[];
  loading: boolean;
}

const ModulePreviewCard: React.FC<ModulePreviewCardProps> = ({ modules, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const completedModules = modules.filter(m => m.is_completed).length;
  const inProgressModules = modules.filter(m => !m.is_completed && m.progress_percentage > 0).length;
  const notStartedModules = modules.filter(m => !m.is_completed && m.progress_percentage === 0).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Modules & Courses</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {modules.length} total modules
          </p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {completedModules}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {inProgressModules}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">In Progress</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {notStartedModules}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Not Started</div>
        </div>
      </div>

      {/* Module List */}
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {modules.slice(0, 3).map((module, index) => (
          <div key={`${module.id}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex-shrink-0">
              {module.is_completed ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Clock className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {module.name}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                  {module.code}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      module.is_completed 
                        ? 'bg-green-500' 
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${module.progress_percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[3rem] text-right">
                  {module.progress_percentage}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modules.length > 3 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            View all {modules.length} modules
          </button>
        </div>
      )}
    </div>
  );
};

export default ModulePreviewCard;
