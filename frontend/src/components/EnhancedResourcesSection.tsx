import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Image, 
  Video, 
  File, 
  Download, 
  Eye, 
  Search, 
  Filter,
  Upload,
  Folder,
  Calendar,
  User,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ResourcePreviewModal from './ResourcePreviewModal';

interface Resource {
  id: number;
  title: string;
  description: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
  course_id?: number;
  category: string;
  tags: string[];
  download_count: number;
  is_public: boolean;
}

interface EnhancedResourcesSectionProps {
  courseId?: number;
}

const EnhancedResourcesSection: React.FC<EnhancedResourcesSectionProps> = ({ courseId }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFileType, setSelectedFileType] = useState('all');
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchResources();
  }, [courseId]);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedCategory, selectedFileType]);

  const fetchResources = async () => {
    try {
      const url = courseId 
        ? `/api/resources?course_id=${courseId}&user_id=${user?.id}`
        : `/api/resources?user_id=${user?.id}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.resources) {
        setResources(data.resources);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    // File type filter
    if (selectedFileType !== 'all') {
      filtered = filtered.filter(resource => {
        const extension = resource.file_path.split('.').pop()?.toLowerCase();
        switch (selectedFileType) {
          case 'pdf':
            return extension === 'pdf';
          case 'image':
            return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension || '');
          case 'video':
            return ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension || '');
          case 'text':
            return ['txt', 'md', 'csv', 'json', 'xml', 'html', 'css', 'js'].includes(extension || '');
          default:
            return true;
        }
      });
    }

    setFilteredResources(filtered);
  };

  const getFileIcon = (filePath: string, fileType: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf' || fileType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    if (imageExtensions.includes(extension || '') || fileType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-green-500" />;
    }
    
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    if (videoExtensions.includes(extension || '') || fileType.startsWith('video/')) {
      return <Video className="w-5 h-5 text-blue-500" />;
    }
    
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const getFileType = (filePath: string): 'pdf' | 'image' | 'video' | 'text' | 'other' => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') return 'pdf';
    
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    if (imageExtensions.includes(extension || '')) return 'image';
    
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    if (videoExtensions.includes(extension || '')) return 'video';
    
    const textExtensions = ['txt', 'md', 'csv', 'json', 'xml', 'html', 'css', 'js'];
    if (textExtensions.includes(extension || '')) return 'text';
    
    return 'other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handlePreview = (resource: Resource) => {
    setPreviewResource(resource);
    setShowPreview(true);
  };

  const handleDownload = async (resource: Resource) => {
    try {
      const response = await fetch(`/api/resources/${resource.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = resource.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const checkAccess = (resource: Resource): boolean => {
    // Check if user has access to the resource
    if (resource.is_public) return true;
    if (user?.role === 'teacher') return true;
    if (user?.role === 'student' && resource.course_id) {
      // Check if student is enrolled in the course
      return true; // Simplified for demo
    }
    return false;
  };

  const categories = ['all', ...Array.from(new Set(resources.map(r => r.category)))];
  const fileTypes = ['all', 'pdf', 'image', 'video', 'text', 'other'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Resources</h3>
          <p className="text-gray-600">Access and preview course materials</p>
        </div>
        <button
          onClick={fetchResources}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          {/* File Type Filter */}
          <select
            value={selectedFileType}
            onChange={(e) => setSelectedFileType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {fileTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All File Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            {filteredResources.length} of {resources.length} resources
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Folder className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Resources Found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory !== 'all' || selectedFileType !== 'all'
              ? 'Try adjusting your search criteria'
              : 'No resources have been uploaded yet'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => {
            const hasAccess = checkAccess(resource);
            const fileType = getFileType(resource.file_path);
            const canPreview = hasAccess && ['pdf', 'image', 'video', 'text'].includes(fileType);

            return (
              <div key={resource.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(resource.file_path, resource.file_type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 truncate">
                        {resource.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(resource.file_size)}
                      </p>
                    </div>
                  </div>
                </div>

                {resource.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {resource.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {resource.uploaded_by}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(resource.uploaded_at)}
                    </span>
                  </div>
                  <span>{resource.download_count} downloads</span>
                </div>

                {resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {resource.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{resource.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex space-x-2">
                  {canPreview ? (
                    <button
                      onClick={() => handlePreview(resource)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </button>
                  ) : !hasAccess ? (
                    <button
                      disabled
                      className="flex-1 px-3 py-2 bg-gray-300 text-gray-500 text-sm rounded-lg cursor-not-allowed flex items-center justify-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      No Access
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 px-3 py-2 bg-gray-300 text-gray-500 text-sm rounded-lg cursor-not-allowed flex items-center justify-center"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      No Preview
                    </button>
                  )}
                  
                  {hasAccess && (
                    <button
                      onClick={() => handleDownload(resource)}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <ResourcePreviewModal
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setPreviewResource(null);
        }}
        resource={previewResource}
        userRole={user?.role || 'student'}
        hasAccess={previewResource ? checkAccess(previewResource) : false}
      />
    </div>
  );
};

export default EnhancedResourcesSection;
