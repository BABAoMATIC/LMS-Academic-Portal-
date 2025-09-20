import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import statusService, { AssignmentStatus } from '../services/statusService';
import useRealTimeSync from '../hooks/useRealTimeSync';
import LoadingSpinner from '../components/LoadingSpinner';
import { FileText, Calendar, Clock, CheckCircle, AlertCircle, XCircle, Eye, Download, MessageCircle } from 'lucide-react';
import AssignmentPreviewModal from '../components/AssignmentPreviewModal';
import { Assignment } from '../types';

const Assignments: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded' | 'late'>('all');
  const [previewAssignment, setPreviewAssignment] = useState<Assignment | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Real-time sync for assignments
  useRealTimeSync({
    userId: user?.id,
    onAssignmentUpdate: (data: any) => {
      console.log('🔄 Assignment update received:', data);
      if (data.data.assignment_id) {
        updateAssignmentStatus(
          data.data.assignment_id, 
          data.data.status, 
          data.data.marks_obtained, 
          data.data.total_marks, 
          data.data.percentage
        );
      }
    },
    onDashboardRefresh: (data: any) => {
      if (data.type === 'assignments' || !data.type) {
        console.log('🔄 Refreshing assignments...');
        fetchAssignments();
      }
    }
  });

  useEffect(() => {
    fetchAssignments();
    
    // Subscribe to real-time status updates
    const unsubscribeAssignmentStatus = statusService.on('assignment_status_update', (data: any) => {
      if (data.student_id === user?.id) {
        updateAssignmentStatus(data.assignment_id!, data.status, data.marks_obtained, data.total_marks, data.percentage);
      }
    });

    const unsubscribeAssignmentGraded = statusService.on('assignment_graded', (data: any) => {
      if (data.student_id === user?.id) {
        updateAssignmentStatus(data.assignment_id!, 'graded', data.marks_obtained, data.total_marks, data.percentage);
      }
    });

    const unsubscribeAssignmentSubmitted = statusService.on('assignment_submitted', (data: any) => {
      if (data.student_id === user?.id) {
        updateAssignmentStatus(data.assignment_id!, 'submitted', data.marks_obtained, data.total_marks, data.percentage);
        // Show success notification
        console.log('🎉 Assignment submitted successfully!', data);
      }
    });

    return () => {
      unsubscribeAssignmentStatus();
      unsubscribeAssignmentGraded();
      unsubscribeAssignmentSubmitted();
    };
  }, [user?.id]);

  const updateAssignmentStatus = (assignmentId: number, status: string, marksObtained?: number, totalMarks?: number, percentage?: number) => {
    setAssignments(prev => prev.map(assignment => 
      assignment.id === assignmentId 
        ? { 
            ...assignment, 
            status: status as any,
            marks_obtained: marksObtained,
            total_marks: totalMarks,
            percentage: percentage
          }
        : assignment
    ));
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch assignments from API
      const response = await apiService.get('/assignments');
      let fetchedAssignments: Assignment[] = response.data || [];
      
      // Fetch real-time status for each assignment
      if (user?.id) {
        const assignmentsWithStatus = await Promise.all(
          fetchedAssignments.map(async (assignment) => {
            try {
              const statusData = await statusService.getAssignmentStatus(assignment.id, user.id);
              return {
                ...assignment,
                status: statusData.status,
                marks_obtained: statusData.marks_obtained,
                total_marks: statusData.total_marks,
                percentage: statusData.percentage
              };
            } catch (error) {
              console.error(`Error fetching status for assignment ${assignment.id}:`, error);
              return assignment;
            }
          })
        );
        fetchedAssignments = assignmentsWithStatus;
      }
      
      // Fallback to mock data if no assignments found
      if (fetchedAssignments.length === 0) {
        const mockAssignments: Assignment[] = [
        {
          id: 1,
          teacher_id: 1,
          title: 'Mathematics Assignment 1',
          description: 'Complete exercises 1-20 from Chapter 3',
          deadline: '2024-01-15',
          module_name: 'Advanced Mathematics',
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          teacher_id: 1,
          title: 'Physics Lab Report',
          description: 'Write a comprehensive report on the pendulum experiment',
          deadline: '2024-01-10',
          module_name: 'Physics',
          status: 'submitted',
          grade: 85,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 3,
          teacher_id: 1,
          title: 'English Essay',
          description: 'Write a 1000-word essay on Shakespeare\'s influence',
          deadline: '2024-01-05',
          module_name: 'English Literature',
          status: 'late',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 4,
          teacher_id: 1,
          title: 'Computer Science Project',
          description: 'Develop a simple web application using React',
          deadline: '2024-01-20',
          module_name: 'Web Development',
          status: 'pending',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];
        
        setAssignments(mockAssignments);
      } else {
        setAssignments(fetchedAssignments);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'text-blue-600 bg-blue-100';
      case 'graded':
        return 'text-green-600 bg-green-100';
      case 'late':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return '📤';
      case 'graded':
        return '✅';
      case 'late':
        return '⚠️';
      default:
        return '📝';
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    return (assignment.status || 'pending') === filter;
  });

  const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
  };

  const handlePreview = (assignment: Assignment) => {
    setPreviewAssignment(assignment);
    setShowPreview(true);
  };

  const handleDownload = async (assignment: Assignment) => {
    try {
      const response = await fetch(`/api/assignments/${assignment.id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        // Get the filename from the response headers or use assignment title
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = assignment.title;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('✅ Assignment downloaded successfully');
      } else {
        const error = await response.json();
        alert(`Error downloading file: ${error.error}`);
      }
    } catch (error) {
      console.error('Error downloading assignment:', error);
      alert('Error downloading assignment');
    }
  };

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
            onClick={fetchAssignments}
            className="action-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="assignments-page">
      {/* Header */}
      <div className="assignments-header">
        <h1 className="welcome-title">Assignments</h1>
        <p className="welcome-subtitle">
          Manage your assignments and track your progress
        </p>
        
        {/* Filters */}
        <div className="assignments-filters">
          <button
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({assignments.length})
          </button>
          <button
            className={`filter-button ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({assignments.filter(a => a.status === 'pending').length})
          </button>
          <button
            className={`filter-button ${filter === 'submitted' ? 'active' : ''}`}
            onClick={() => setFilter('submitted')}
          >
            Submitted ({assignments.filter(a => a.status === 'submitted').length})
          </button>
          <button
            className={`filter-button ${filter === 'graded' ? 'active' : ''}`}
            onClick={() => setFilter('graded')}
          >
            Graded ({assignments.filter(a => a.status === 'graded').length})
          </button>
          <button
            className={`filter-button ${filter === 'late' ? 'active' : ''}`}
            onClick={() => setFilter('late')}
          >
            Late ({assignments.filter(a => a.status === 'late').length})
          </button>
        </div>
      </div>

      {/* Assignments List */}
      <div className="assignments-list">
        {filteredAssignments.map((assignment) => (
          <div key={assignment.id} className="assignment-card">
            <div className="assignment-header">
              <div>
                <h3 className="assignment-title">{assignment.title}</h3>
                <span className="assignment-module">{assignment.module_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getStatusIcon(assignment.status || 'pending')}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(assignment.status || 'pending')}`}>
                  {(assignment.status || 'pending').charAt(0).toUpperCase() + (assignment.status || 'pending').slice(1)}
                  {(assignment.status || 'pending') === 'graded' && assignment.marks_obtained !== undefined && (
                    <span className="ml-2 text-sm">
                      ({assignment.marks_obtained}/{assignment.total_marks} - {assignment.percentage?.toFixed(1)}%)
                    </span>
                  )}
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">{assignment.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Due: {new Date(assignment.deadline).toLocaleDateString()}
                  </span>
                </div>
                
                {assignment.grade && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Grade: {assignment.grade}%</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {isOverdue(assignment.deadline) && (assignment.status || 'pending') !== 'submitted' && (
                  <span className="text-red-600 text-sm font-medium">Overdue</span>
                )}
                
                {/* Preview Button - Show if assignment has a file */}
                {assignment.file_path && (
                  <button 
                    className="action-button secondary"
                    onClick={() => handlePreview(assignment)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </button>
                )}
                
                {/* Download Button - Show if assignment has a file */}
                {assignment.file_path && (
                  <button 
                    className="action-button download"
                    onClick={() => handleDownload(assignment)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                )}
                
                {(assignment.status || 'pending') === 'pending' && (
                  <>
                    {user?.role === 'teacher' ? (
                      <button 
                        className="action-button"
                        onClick={() => navigate(`/assignment/${assignment.id}`)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Give Feedback
                      </button>
                    ) : (
                      <button 
                        className="action-button"
                        onClick={() => navigate(`/assignment/${assignment.id}`)}
                      >
                        Submit Assignment
                      </button>
                    )}
                  </>
                )}
                
                {(assignment.status || 'pending') === 'submitted' && (
                  <>
                    {user?.role === 'teacher' ? (
                      <button 
                        className="feedback-button feedback-button-info"
                        onClick={() => navigate(`/assignment/${assignment.id}`)}
                      >
                        <MessageCircle className="feedback-button-icon" />
                        Grade & Feedback
                      </button>
                    ) : (
                      <button 
                        className="feedback-button feedback-button-info"
                        onClick={() => navigate(`/assignment/${assignment.id}`)}
                      >
                        <MessageCircle className="feedback-button-icon" />
                        View Feedback
                      </button>
                    )}
                  </>
                )}
                
                {(assignment.status || 'pending') === 'graded' && (
                  <>
                    {user?.role === 'teacher' ? (
                      <button 
                        className="feedback-button feedback-button-success"
                        onClick={() => navigate(`/assignment/${assignment.id}`)}
                      >
                        <CheckCircle className="feedback-button-icon" />
                        View Submission
                      </button>
                    ) : (
                      <button 
                        className="feedback-button feedback-button-success"
                        onClick={() => navigate(`/assignment/${assignment.id}`)}
                      >
                        <CheckCircle className="feedback-button-icon" />
                        View Grade & Feedback
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No assignments found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'You don\'t have any assignments yet.'
              : `No ${filter} assignments found.`
            }
          </p>
        </div>
      )}

      {/* Assignment Preview Modal */}
      <AssignmentPreviewModal
        isOpen={showPreview}
        onClose={() => {
          setShowPreview(false);
          setPreviewAssignment(null);
        }}
        assignment={previewAssignment}
      />
    </div>
  );
};

export default Assignments;
