import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, Users, FileText } from 'lucide-react';

interface DownloadAnalyticsProps {
  assignmentId?: number;
  submissionId?: number;
  type: 'assignment' | 'submission';
}

interface DownloadStats {
  download_count: number;
  total_downloads?: number;
  recent_downloads?: number;
}

const DownloadAnalytics: React.FC<DownloadAnalyticsProps> = ({
  assignmentId,
  submissionId,
  type
}) => {
  const [stats, setStats] = useState<DownloadStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDownloadStats();
  }, [assignmentId, submissionId, type]);

  const fetchDownloadStats = async () => {
    try {
      setLoading(true);
      
      let endpoint = '';
      if (type === 'assignment' && assignmentId) {
        endpoint = `/api/assignments/${assignmentId}`;
      } else if (type === 'submission' && submissionId) {
        endpoint = `/api/submissions/${submissionId}`;
      }
      
      if (endpoint) {
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const item = type === 'assignment' ? data.assignment : data.submission;
          setStats({
            download_count: item.download_count || 0,
            total_downloads: item.download_count || 0,
            recent_downloads: item.download_count || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching download stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4 text-sm text-gray-600">
      <div className="flex items-center space-x-1">
        <Download className="w-4 h-4" />
        <span>{stats.download_count} downloads</span>
      </div>
      
      {stats.download_count > 0 && (
        <div className="flex items-center space-x-1 text-green-600">
          <TrendingUp className="w-4 h-4" />
          <span>Popular</span>
        </div>
      )}
    </div>
  );
};

export default DownloadAnalytics;
