import React, { useState } from 'react';
import { FileText, MessageCircle, Download, Eye, Calendar, User, Star, ThumbsUp, CheckCircle } from 'lucide-react';
import FeedbackChat from './FeedbackChat';

interface AssignmentSplitViewProps {
  assignment: any;
  submission: any;
  feedback: any;
  currentUserId: number;
  currentUserRole: 'student' | 'teacher';
  currentUserName: string;
}

const AssignmentSplitView: React.FC<AssignmentSplitViewProps> = ({
  assignment,
  submission,
  feedback,
  currentUserId,
  currentUserRole,
  currentUserName
}) => {
  const [activeTab, setActiveTab] = useState<'submission' | 'feedback' | 'chat'>('submission');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
                <p className="text-gray-600 mt-1">{assignment.description}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission?.status || 'pending')}`}>
                  {submission?.status || 'Pending'}
                </span>
                {submission?.percentage && (
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getGradeColor(submission.percentage)}`}>
                      {submission.percentage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Grade</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Submission */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('submission')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'submission'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Your Submission
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('feedback')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'feedback'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Teacher Feedback
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'chat'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Discussion
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'submission' && (
                  <div className="space-y-6">
                    {submission ? (
                      <>
                        {/* Submission Info */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">Submission Details</h3>
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Submitted:</span>
                              <span className="ml-2 font-medium">{formatDate(submission.submitted_at)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">File Size:</span>
                              <span className="ml-2 font-medium">{submission.file_size || 'Unknown'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">File Type:</span>
                              <span className="ml-2 font-medium">{submission.file_type || 'Unknown'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                {submission.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* File Preview */}
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">File Preview</h4>
                          <div className="bg-gray-50 rounded-lg p-8 text-center">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-2">{submission.file_name || 'submission.pdf'}</p>
                            <p className="text-sm text-gray-500">Click the eye icon above to preview the file</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Submission Yet</h3>
                        <p className="text-gray-600">You haven't submitted this assignment yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'feedback' && (
                  <div className="space-y-6">
                    {feedback ? (
                      <>
                        {/* Teacher Info */}
                        <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Teacher Feedback</h4>
                            <p className="text-sm text-gray-600">Provided on {formatDate(feedback.created_at)}</p>
                          </div>
                        </div>

                        {/* Grade */}
                        {submission?.percentage && (
                          <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-gray-900">Grade</h4>
                              <div className={`text-3xl font-bold ${getGradeColor(submission.percentage)}`}>
                                {submission.percentage.toFixed(1)}%
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  submission.percentage >= 90 ? 'bg-green-500' :
                                  submission.percentage >= 80 ? 'bg-blue-500' :
                                  submission.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${submission.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Feedback Content */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                          <h4 className="font-semibold text-gray-900 mb-4">Detailed Feedback</h4>
                          <div className="prose max-w-none">
                            <p className="text-gray-700 leading-relaxed">
                              {feedback.feedback_text || 'No detailed feedback provided yet.'}
                            </p>
                          </div>
                        </div>

                        {/* Feedback Actions */}
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors">
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Helpful
                          </button>
                          <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Reply
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Yet</h3>
                        <p className="text-gray-600">Your teacher hasn't provided feedback yet.</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'chat' && (
                  <div>
                    <FeedbackChat
                      assignmentId={assignment.id}
                      studentId={currentUserId}
                      currentUserId={currentUserId}
                      currentUserRole={currentUserRole}
                      currentUserName={currentUserName}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Assignment Details */}
          <div className="space-y-6">
            {/* Assignment Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h3>
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Due Date:</span>
                  <span className="ml-2 font-medium">{formatDate(assignment.due_date)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <FileText className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 font-medium">{assignment.type || 'Assignment'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Star className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">Points:</span>
                  <span className="ml-2 font-medium">{assignment.points || 'Not specified'}</span>
                </div>
              </div>
            </div>

            {/* Assignment Description */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {assignment.instructions || assignment.description}
                </p>
              </div>
            </div>

            {/* Requirements */}
            {assignment.requirements && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                <ul className="space-y-2">
                  {assignment.requirements.map((requirement: string, index: number) => (
                    <li key={index} className="flex items-start text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentSplitView;
