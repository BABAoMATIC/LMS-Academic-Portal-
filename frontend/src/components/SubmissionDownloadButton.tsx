import React from 'react';
import { Download } from 'lucide-react';

interface SubmissionDownloadButtonProps {
  submissionId: number;
  filename?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SubmissionDownloadButton: React.FC<SubmissionDownloadButtonProps> = ({
  submissionId,
  filename,
  className = '',
  size = 'md'
}) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        // Get the filename from the response headers or use provided filename
        const contentDisposition = response.headers.get('Content-Disposition');
        let downloadFilename = filename || `submission_${submissionId}`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            downloadFilename = filenameMatch[1];
          }
        }
        
        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('✅ Submission downloaded successfully');
      } else {
        const error = await response.json();
        alert(`Error downloading file: ${error.error}`);
      }
    } catch (error) {
      console.error('Error downloading submission:', error);
      alert('Error downloading submission');
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  return (
    <button
      onClick={handleDownload}
      className={`flex items-center bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${getSizeClasses()} ${className}`}
    >
      <Download className={`${getIconSize()} mr-1`} />
      Download
    </button>
  );
};

export default SubmissionDownloadButton;
