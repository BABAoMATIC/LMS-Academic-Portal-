import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const SubmissionUpload = ({ course, onClose }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'application/zip', 'text/plain', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF, ZIP, text, or image file');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || !title.trim()) {
      setError('Please select a file and provide a title');
      return;
    }

    try {
      setUploading(true);
      setError('');

      // In a real application, you would upload the file to a file storage service
      // For now, we'll simulate the upload by creating a submission record
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const submissionData = {
        title: title,
        description: description,
        module_id: course.id, // Using course ID as module ID for now
        file_path: `/uploads/${file.name}`,
        assignment_id: null // Will be set when assignment is selected
      };

      await axios.post('/api/submissions/upload', submissionData, { headers });

      setSuccess(true);
      setFile(null);
      setTitle('');
      setDescription('');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.error || 'Failed to upload submission');
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const event = { target: { files: [droppedFile] } };
      handleFileChange(event);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Submission Successful!</h2>
          <p className="text-gray-600">Your work has been uploaded successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Upload Submission</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Course: {course.title}</h3>
            <p className="text-sm text-gray-600">{course.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submission Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter submission title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your submission..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload File *
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  file
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {file ? (
                  <div>
                    <div className="text-green-600 text-4xl mb-2">✓</div>
                    <p className="text-green-800 font-medium">{file.name}</p>
                    <p className="text-green-600 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium mt-2"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-gray-400 text-4xl mb-2">📁</div>
                    <p className="text-gray-600 mb-2">
                      Drag and drop your file here, or click to browse
                    </p>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.zip,.txt,.jpg,.jpeg,.png"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Max size: 10MB | Supported: PDF, ZIP, TXT, JPG, PNG
                    </p>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading || !file || !title.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {uploading ? 'Uploading...' : 'Upload Submission'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmissionUpload;
