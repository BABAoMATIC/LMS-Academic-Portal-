import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Image, Video, File, AlertCircle, Eye, Loader, Calendar, User } from 'lucide-react';

interface AssignmentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: {
    id: number;
    title: string;
    description?: string;
    deadline: string;
    file_path?: string;
    assignment_metadata?: {
      original_filename?: string;
      file_size?: number;
      file_type?: string;
    };
    teacher_name?: string;
    created_at: string;
  } | null;
}

const AssignmentPreviewModal: React.FC<AssignmentPreviewModalProps> = ({
  isOpen,
  onClose,
  assignment
}) => {
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | 'video' | 'text' | 'unsupported' | null>(null);

  useEffect(() => {
    if (isOpen && assignment && assignment.file_path) {
      loadPreview();
    } else {
      setPreviewContent(null);
      setError(null);
      setPreviewType(null);
    }
  }, [isOpen, assignment]);

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
    const textExtensions = ['txt', 'md', 'csv', 'json', 'xml', 'html', 'css', 'js', 'doc', 'docx', 'rtf'];
    
    if (extension === 'pdf') return 'pdf';
    if (imageExtensions.includes(extension || '')) return 'image';
    if (videoExtensions.includes(extension || '')) return 'video';
    if (textExtensions.includes(extension || '')) return 'text';
    
    return 'unsupported';
  };

  const loadPreview = async () => {
    if (!assignment || !assignment.file_path) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const filename = assignment.assignment_metadata?.original_filename || assignment.file_path;
      const fileType = getFileType(filename, assignment.assignment_metadata?.file_type);
      setPreviewType(fileType);
      
      if (fileType === 'unsupported') {
        setError('Preview not available for this file type. Please download the file to view it.');
        setLoading(false);
        return;
      }
      
      // For text files, we need to fetch the content
      if (fileType === 'text') {
        try {
          const response = await fetch(`/api/assignments/${assignment.id}/preview`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          
          if (response.ok) {
            const textContent = await response.text();
            setPreviewContent(textContent);
          } else {
            setError('Failed to load file content');
          }
        } catch (err) {
          setError('Failed to load file content');
        }
      } else {
        setPreviewContent(assignment.file_path);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load preview');
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!assignment) return;
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = `/api/assignments/${assignment.id}/download`;
    link.download = assignment.assignment_metadata?.original_filename || assignment.title;
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

  const isDeadlinePassed = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  if (!isOpen || !assignment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {assignment.file_path ? getFileIcon(previewType || 'unsupported') : <FileText className="w-6 h-6 text-blue-500" />}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{assignment.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                {assignment.assignment_metadata?.file_size && (
                  <span>{formatFileSize(assignment.assignment_metadata.file_size)}</span>
                )}
                {assignment.teacher_name && (
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span>By {assignment.teacher_name}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className={isDeadlinePassed(assignment.deadline) ? 'text-red-600' : ''}>
                    Due: {formatDate(assignment.deadline)}
                    {isDeadlinePassed(assignment.deadline) && ' (Overdue)'}
                  </span>
                </div>
              </div>
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
          {!assignment.file_path ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No File Attached</h3>
                <p className="text-gray-600">This assignment doesn't have any files to preview.</p>
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
                    src={`/api/assignments/${assignment.id}/preview`}
                    className="w-full h-full border-0"
                    title={assignment.title}
                  />
                </div>
              )}
              
              {previewType === 'image' && (
                <div className="flex items-center justify-center h-full p-4">
                  <img
                    src={`/api/assignments/${assignment.id}/preview`}
                    alt={assignment.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              
              {previewType === 'video' && (
                <div className="flex items-center justify-center h-full p-4">
                  <video
                    src={`/api/assignments/${assignment.id}/preview`}
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
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {assignment.description && (
              <p>{assignment.description}</p>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            {assignment.file_path && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentPreviewModal;
