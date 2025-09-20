import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Image, Video, File, AlertCircle, Eye, Loader } from 'lucide-react';

interface ResourcePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: {
    id: number;
    title: string;
    file_path: string;
    file_type: string;
    file_size: number;
    description?: string;
    uploaded_by: string;
    uploaded_at: string;
  } | null;
  userRole: string;
  hasAccess: boolean;
}

const ResourcePreviewModal: React.FC<ResourcePreviewModalProps> = ({
  isOpen,
  onClose,
  resource,
  userRole,
  hasAccess
}) => {
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | 'video' | 'text' | 'unsupported' | null>(null);

  useEffect(() => {
    if (isOpen && resource && hasAccess) {
      loadPreview();
    } else {
      setPreviewContent(null);
      setError(null);
      setPreviewType(null);
    }
  }, [isOpen, resource, hasAccess]);

  const getFileType = (filename: string, mimeType?: string): 'pdf' | 'image' | 'video' | 'text' | 'unsupported' => {
    const extension = filename.toLowerCase().split('.').pop();
    
    // Check by MIME type first if available
    if (mimeType) {
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType.startsWith('video/')) return 'video';
      if (mimeType === 'application/pdf') return 'pdf';
      if (mimeType.startsWith('text/')) return 'text';
    }
    
    // Check by file extension
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
    const textExtensions = ['txt', 'md', 'csv', 'json', 'xml', 'html', 'css', 'js'];
    
    if (extension === 'pdf') return 'pdf';
    if (imageExtensions.includes(extension || '')) return 'image';
    if (videoExtensions.includes(extension || '')) return 'video';
    if (textExtensions.includes(extension || '')) return 'text';
    
    return 'unsupported';
  };

  const loadPreview = async () => {
    if (!resource) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fileType = getFileType(resource.file_path, resource.file_type);
      setPreviewType(fileType);
      
      if (fileType === 'unsupported') {
        setError('Preview not available for this file type');
        setLoading(false);
        return;
      }
      
      // For supported file types, we'll use the file path directly
      // In a real implementation, you might need to fetch the file content
      setPreviewContent(resource.file_path);
      setLoading(false);
    } catch (err) {
      setError('Failed to load preview');
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resource) return;
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = `/api/resources/${resource.id}/download`;
    link.download = resource.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'image':
        return <Image className="w-6 h-6 text-green-500" />;
      case 'video':
        return <Video className="w-6 h-6 text-blue-500" />;
      case 'text':
        return <FileText className="w-6 h-6 text-gray-500" />;
      default:
        return <File className="w-6 h-6 text-gray-500" />;
    }
  };

  if (!isOpen || !resource) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getFileIcon(previewType || 'unsupported')}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{resource.title}</h2>
              <p className="text-sm text-gray-500">
                {formatFileSize(resource.file_size)} • Uploaded by {resource.uploaded_by} • {formatDate(resource.uploaded_at)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {!hasAccess ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
                <p className="text-gray-600">You do not have access to preview this file.</p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading preview...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Preview Not Available</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              {previewType === 'pdf' && (
                <div className="h-full">
                  <iframe
                    src={`/api/resources/${resource.id}/preview`}
                    className="w-full h-full border-0"
                    title={resource.title}
                  />
                </div>
              )}
              
              {previewType === 'image' && (
                <div className="flex items-center justify-center h-full p-4">
                  <img
                    src={`/api/resources/${resource.id}/preview`}
                    alt={resource.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              
              {previewType === 'video' && (
                <div className="flex items-center justify-center h-full p-4">
                  <video
                    src={`/api/resources/${resource.id}/preview`}
                    controls
                    className="max-w-full max-h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
              
              {previewType === 'text' && (
                <div className="h-full p-6">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono overflow-auto h-full">
                    {previewContent}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {hasAccess && !error && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              {resource.description && (
                <p>{resource.description}</p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcePreviewModal;
