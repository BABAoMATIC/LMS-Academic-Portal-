import React from 'react';
import { 
  BarChart3, 
  Award, 
  BookOpen, 
  Target, 
  TrendingUp 
} from 'lucide-react';

interface DashboardNavbarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, color: 'blue' },
    { id: 'quiz-results', label: 'Quiz Results', icon: Award, color: 'yellow' },
    { id: 'reflections', label: 'Reflections', icon: BookOpen, color: 'pink' },
    { id: 'portfolio', label: 'Portfolio', icon: Target, color: 'emerald' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, color: 'orange' },
  ];

  // Function to get glow effect based on color
  const getGlowEffect = (color: string) => {
    const glowEffects = {
      blue: 'shadow-[0_0_40px_rgba(59,130,246,0.6)]',
      green: 'shadow-[0_0_40px_rgba(34,197,94,0.6)]',
      purple: 'shadow-[0_0_40px_rgba(147,51,234,0.6)]',
      yellow: 'shadow-[0_0_40px_rgba(234,179,8,0.6)]',
      indigo: 'shadow-[0_0_40px_rgba(99,102,241,0.6)]',
      pink: 'shadow-[0_0_40px_rgba(236,72,153,0.6)]',
      emerald: 'shadow-[0_0_40px_rgba(16,185,129,0.6)]',
      orange: 'shadow-[0_0_40px_rgba(249,115,22,0.6)]'
    };
    return glowEffects[color as keyof typeof glowEffects] || 'shadow-[0_0_40px_rgba(59,130,246,0.6)]';
  };

  return (
    <div className="dashboard-navbar-container">
      <div className="dashboard-navbar-content">
        <nav className="dashboard-navbar-nav">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            // Color configurations for each tab
            const colorConfigs = {
              blue: {
                active: 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600',
                hover: 'hover:from-blue-50 hover:to-indigo-50',
                text: 'hover:text-blue-700',
                border: 'hover:border-blue-300',
                icon: 'group-hover:text-blue-600'
              },
              green: {
                active: 'bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600',
                hover: 'hover:from-green-50 hover:to-emerald-50',
                text: 'hover:text-green-700',
                border: 'hover:border-green-300',
                icon: 'group-hover:text-green-600'
              },
              purple: {
                active: 'bg-gradient-to-r from-purple-500 via-violet-600 to-indigo-600',
                hover: 'hover:from-purple-50 hover:to-violet-50',
                text: 'hover:text-purple-700',
                border: 'hover:border-purple-300',
                icon: 'group-hover:text-purple-600'
              },
              yellow: {
                active: 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500',
                hover: 'hover:from-yellow-50 hover:to-orange-50',
                text: 'hover:text-yellow-700',
                border: 'hover:border-yellow-300',
                icon: 'group-hover:text-yellow-600'
              },
              indigo: {
                active: 'bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600',
                hover: 'hover:from-indigo-50 hover:to-blue-50',
                text: 'hover:text-indigo-700',
                border: 'hover:border-indigo-300',
                icon: 'group-hover:text-indigo-600'
              },
              pink: {
                active: 'bg-gradient-to-r from-pink-500 via-rose-600 to-red-600',
                hover: 'hover:from-pink-50 hover:to-rose-50',
                text: 'hover:text-pink-700',
                border: 'hover:border-pink-300',
                icon: 'group-hover:text-pink-600'
              },
              emerald: {
                active: 'bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600',
                hover: 'hover:from-emerald-50 hover:to-green-50',
                text: 'hover:text-emerald-700',
                border: 'hover:border-emerald-300',
                icon: 'group-hover:text-emerald-600'
              },
              orange: {
                active: 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500',
                hover: 'hover:from-orange-50 hover:to-red-50',
                text: 'hover:text-orange-700',
                border: 'hover:border-orange-300',
                icon: 'group-hover:text-orange-600'
              }
            };
            
            const colors = colorConfigs[tab.color as keyof typeof colorConfigs];
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`dashboard-navbar-button ${isActive ? 'dashboard-navbar-button-active' : 'dashboard-navbar-button-inactive'}`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInDown 0.6s ease-out forwards'
                }}
              >
                {/* Premium Background Pattern for Active Tab */}
                {isActive && (
                  <div className="dashboard-navbar-active-pattern">
                    <div className="dashboard-navbar-dot-pattern"></div>
                    <div className="dashboard-navbar-gradient-overlay"></div>
                  </div>
                )}
                
                {/* Floating Elements for Active Tab */}
                {isActive && (
                  <>
                    <div className="dashboard-navbar-floating-dot-1"></div>
                    <div className="dashboard-navbar-floating-dot-2"></div>
                  </>
                )}
                
                <div className="dashboard-navbar-button-content">
                  <div className={`dashboard-navbar-icon-container ${isActive ? 'dashboard-navbar-icon-active' : 'dashboard-navbar-icon-inactive'}`}>
                    <Icon className={`dashboard-navbar-icon ${isActive ? 'dashboard-navbar-icon-active-color' : 'dashboard-navbar-icon-inactive-color'}`} />
                  </div>
                  <span className="dashboard-navbar-label">{tab.label}</span>
                </div>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="dashboard-navbar-active-indicator"></div>
                )}
                
                {/* Glow Effect for Active Tab */}
                {isActive && (
                  <div className={`dashboard-navbar-glow ${getGlowEffect(tab.color)}`}></div>
                )}
                
                {/* Hover Border Effect */}
                <div className="dashboard-navbar-hover-border"></div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default DashboardNavbar;
