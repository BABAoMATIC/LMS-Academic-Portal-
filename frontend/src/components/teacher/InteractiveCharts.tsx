import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  LineChart,
  Activity,
  Target,
  Award,
  BookOpen
} from 'lucide-react';

interface ChartProps {
  data: any[];
  title: string;
  type: 'bar' | 'line' | 'pie' | 'progress';
  color?: string;
  height?: number;
}

const InteractiveCharts: React.FC<ChartProps> = ({ 
  data, 
  title, 
  type, 
  color = '#3b82f6',
  height = 300 
}) => {
  const renderBarChart = () => (
    <div className="interactive-chart-container">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <BarChart3 className="chart-icon" />
      </div>
      <div className="chart-content" style={{ height: `${height}px` }}>
        <div className="bar-chart">
          {data.map((item, index) => (
            <div key={index} className="bar-item">
              <div className="bar-label">{item.label}</div>
              <div className="bar-container">
                <div 
                  className="bar-fill"
                  style={{ 
                    width: `${item.value}%`,
                    backgroundColor: color,
                    animationDelay: `${index * 0.1}s`
                  }}
                ></div>
                <div className="bar-value">{item.value}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLineChart = () => (
    <div className="interactive-chart-container">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <LineChart className="chart-icon" />
      </div>
      <div className="chart-content" style={{ height: `${height}px` }}>
        <div className="line-chart">
          <svg width="100%" height="100%" viewBox="0 0 400 200">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={color} stopOpacity="0.8"/>
                <stop offset="100%" stopColor={color} stopOpacity="0.2"/>
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke={color}
              strokeWidth="3"
              points={data.map((item, index) => 
                `${(index * 400) / (data.length - 1)},${200 - (item.value * 200) / 100}`
              ).join(' ')}
            />
            <polygon
              fill="url(#lineGradient)"
              points={`0,200 ${data.map((item, index) => 
                `${(index * 400) / (data.length - 1)},${200 - (item.value * 200) / 100}`
              ).join(' ')} 400,200`}
            />
            {data.map((item, index) => (
              <circle
                key={index}
                cx={(index * 400) / (data.length - 1)}
                cy={200 - (item.value * 200) / 100}
                r="4"
                fill={color}
                className="data-point"
                style={{ animationDelay: `${index * 0.1}s` }}
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );

  const renderPieChart = () => (
    <div className="interactive-chart-container">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <PieChart className="chart-icon" />
      </div>
      <div className="chart-content" style={{ height: `${height}px` }}>
        <div className="pie-chart">
          <div className="pie-container">
            <div className="pie-slice" style={{ 
              background: `conic-gradient(${color} 0deg, ${color} ${(data[0]?.value || 0) * 3.6}deg, #e5e7eb ${(data[0]?.value || 0) * 3.6}deg, #e5e7eb 360deg)`
            }}>
              <div className="pie-center">
                <div className="pie-value">{data[0]?.value || 0}%</div>
                <div className="pie-label">{data[0]?.label || 'Total'}</div>
              </div>
            </div>
          </div>
          <div className="pie-legend">
            {data.map((item, index) => (
              <div key={index} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: color }}
                ></div>
                <span className="legend-label">{item.label}</span>
                <span className="legend-value">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProgressChart = () => (
    <div className="interactive-chart-container">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <Target className="chart-icon" />
      </div>
      <div className="chart-content" style={{ height: `${height}px` }}>
        <div className="progress-chart">
          {data.map((item, index) => (
            <div key={index} className="progress-item">
              <div className="progress-header">
                <span className="progress-label">{item.label}</span>
                <span className="progress-value">{item.value}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${item.value}%`,
                    backgroundColor: color,
                    animationDelay: `${index * 0.1}s`
                  }}
                ></div>
              </div>
              <div className="progress-details">
                <span>{item.completed || 0} of {item.total || 100} completed</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      case 'progress':
        return renderProgressChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div className="interactive-chart-wrapper">
      {renderChart()}
    </div>
  );
};

export default InteractiveCharts;
