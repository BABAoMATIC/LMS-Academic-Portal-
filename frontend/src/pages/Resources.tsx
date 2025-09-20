import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FileText, Video, BookOpen, Download, Eye, Search, Filter } from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  type: 'document' | 'video' | 'book' | 'presentation';
  module_name: string;
  file_size: string;
  upload_date: string;
  description: string;
  download_count: number;
}

const Resources: React.FC = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'document' | 'video' | 'book' | 'presentation'>('all');
  const [moduleFilter, setModuleFilter] = useState('all');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for now - replace with actual API call
      const mockResources: Resource[] = [
        {
          id: 1,
          title: 'Mathematics Textbook Chapter 1',
          type: 'book',
          module_name: 'Advanced Mathematics',
          file_size: '15.2 MB',
          upload_date: '2024-01-01',
          description: 'Comprehensive coverage of calculus fundamentals',
          download_count: 45
        },
        {
          id: 2,
          title: 'Physics Lab Manual',
          type: 'document',
          module_name: 'Physics',
          file_size: '8.7 MB',
          upload_date: '2024-01-02',
          description: 'Step-by-step laboratory procedures and safety guidelines',
          download_count: 32
        },
        {
          id: 3,
          title: 'English Literature Analysis',
          type: 'presentation',
          module_name: 'English Literature',
          file_size: '12.1 MB',
          upload_date: '2024-01-03',
          description: 'PowerPoint presentation on Shakespeare\'s works',
          download_count: 28
        },
        {
          id: 4,
          title: 'Web Development Tutorial',
          type: 'video',
          module_name: 'Web Development',
          file_size: '156.3 MB',
          upload_date: '2024-01-04',
          description: 'Complete React.js tutorial for beginners',
          download_count: 67
        },
        {
          id: 5,
          title: 'Chemistry Formula Sheet',
          type: 'document',
          module_name: 'Chemistry',
          file_size: '3.2 MB',
          upload_date: '2024-01-05',
          description: 'Quick reference for all chemical formulas',
          download_count: 89
        },
        {
          id: 6,
          title: 'History Timeline',
          type: 'presentation',
          module_name: 'World History',
          file_size: '7.8 MB',
          upload_date: '2024-01-06',
          description: 'Interactive timeline of major historical events',
          download_count: 41
        }
      ];
      
      setResources(mockResources);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError('Failed to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'book':
        return <BookOpen className="w-6 h-6" />;
      case 'presentation':
        return <FileText className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
      case 'video':
        return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      case 'book':
        return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'presentation':
        return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)';
      default:
        return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    const matchesModule = moduleFilter === 'all' || resource.module_name === moduleFilter;
    
    return matchesSearch && matchesType && matchesModule;
  });

  const modules = Array.from(new Set(resources.map(r => r.module_name)));

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="text-center">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Oops! Something went wrong</h2>
          <p className="error-message">{error}</p>
          <button
            onClick={fetchResources}
            className="action-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="resources-page">
      {/* Header */}
      <div className="resources-header">
        <h1 className="welcome-title">Learning Resources</h1>
        <p className="welcome-subtitle">
          Access study materials, videos, and documents to enhance your learning
        </p>
        
        {/* Search and Filters */}
        <div className="assignments-filters">
          <div className="search-container" style={{ maxWidth: '400px' }}>
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="filter-button"
            style={{ minWidth: '150px' }}
          >
            <option value="all">All Types</option>
            <option value="document">Documents</option>
            <option value="video">Videos</option>
            <option value="book">Books</option>
            <option value="presentation">Presentations</option>
          </select>
          
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="filter-button"
            style={{ minWidth: '150px' }}
          >
            <option value="all">All Modules</option>
            {modules.map(module => (
              <option key={module} value={module}>{module}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="assignments-list">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="resource-card">
            <div className="resource-icon" style={{ background: getTypeColor(resource.type) }}>
              {getTypeIcon(resource.type)}
            </div>
            
            <h3 className="resource-title">{resource.title}</h3>
            <p className="resource-description">{resource.description}</p>
            
            <div className="resource-meta">
              <div className="resource-info">
                <span className="assignment-module">{resource.module_name}</span>
                <span>{resource.file_size}</span>
                <span>{resource.download_count} downloads</span>
              </div>
              
              <div className="resource-actions">
                <button className="quiz-button secondary">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </button>
                <button className="quiz-button primary">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No resources found</h3>
          <p className="text-gray-500">
            {searchTerm || typeFilter !== 'all' || moduleFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'No resources available yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Resources;
