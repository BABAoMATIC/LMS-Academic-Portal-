import React, { useState, useEffect } from 'react';
import { Eye, Download, FileText, Image, File, X, CheckCircle, AlertCircle } from 'lucide-react';

interface SubmissionPreviewProps {
  file: File | null;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const SubmissionPreview: React.FC<SubmissionPreviewProps> = ({
  file,
  onClose,
  onSubmit,
  isSubmitting = false
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFileType(file.type);
      setFileSize(formatFileSize(file.size));
    }

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [file]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-8 h-8 text-blue-600" />;
    if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-600" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="w-8 h-8 text-blue-600" />;
    if (type.includes('zip') || type.includes('rar')) return <File className="w-8 h-8 text-purple-600" />;
    return <File className="w-8 h-8 text-gray-600" />;
  };

  const renderPreview = () => {
    if (!file || !previewUrl) return null;

    if (fileType.startsWith('image/')) {
      return (
        <div className="flex justify-center">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-96 rounded-lg shadow-lg"
          />
        </div>
      );
    }

    if (fileType.includes('pdf')) {
      return (
        <div className="w-full h-96 border border-gray-300 rounded-lg">
          <iframe
            src={previewUrl}
            className="w-full h-full rounded-lg"
            title="PDF Preview"
          />
        </div>
      );
    }

    // For other file types, show file info
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        {getFileIcon(fileType)}
        <div className="mt-4 text-center">
          <p className="text-lg font-medium text-gray-900">{file.name}</p>
          <p className="text-sm text-gray-600">{fileSize}</p>
          <p className="text-sm text-gray-500 mt-2">
            Preview not available for this file type
          </p>
        </div>
      </div>
    );
  };

  const canPreview = fileType.startsWith('image/') || fileType.includes('pdf');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Eye className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Preview Submission</h2>
              <p className="text-sm text-gray-600">Review your file before submitting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {file && (
            <div className="space-y-6">
              {/* File Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  {getFileIcon(fileType)}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{file.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Size: {fileSize}</span>
                      <span>Type: {fileType}</span>
                      <span>Modified: {new Date(file.lastModified).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={previewUrl || ''}
                      download={file.name}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">File Preview</h4>
                {canPreview ? (
                  renderPreview()
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                      <p className="text-yellow-800">
                        Preview is not available for this file type. You can still submit the file.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submission Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Before You Submit</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Make sure this is the correct file
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify the file is complete and readable
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Check that you've followed all assignment requirements
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Remember: You cannot edit after submission
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <p>Once submitted, you cannot make changes to this file.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Assignment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionPreview;
