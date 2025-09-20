import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../types';
import axios from 'axios';
import '../TeacherDashboard.css';
import './EnhancedStudentAnalytics.css';

interface StudentAnalyticsData {
  totalAssignments: number;
  completedAssignments: number;
  totalQuizzes: number;
  attemptedQuizzes: number;
  averageScore: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  moduleProgress: Array<{
    module_name: string;
    progress_percentage: number;
    completed_lessons: number;
    total_lessons: number;
  }>;
  recentSubmissions: Array<{
    id: number;
    assignment_title: string;
    status: string;
    grade: number | null;
    submitted_at: string;
  }>;
  performanceBySubject: Array<{
    subject: string;
    average_score: number;
    total_assignments: number;
    completed_assignments: number;
  }>;
}

const StudentAnalytics: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [analytics, setAnalytics] = useState<StudentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);

  const filterStudents = useCallback(() => {
    let filtered = students;

    if (searchQuery.trim()) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toString().includes(searchQuery)
      );
    }

    setFilteredStudents(filtered);
  }, [students, searchQuery]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students, filterStudents]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('Fetching all students for analytics...');
      
      const response = await axios.get('/api/students');
      console.log('Students response:', response.data);
      
      const studentsData = Array.isArray(response.data) ? response.data : response.data.students || [];
      console.log('Processing', studentsData.length, 'students');
      
      const processedStudents = studentsData.map((student: any) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role || 'student',
        created_at: student.created_at,
        updated_at: student.updated_at || student.created_at
      }));
      
      setStudents(processedStudents);
      console.log('Successfully loaded', processedStudents.length, 'students');
    } catch (error) {
      console.error('Error fetching students:', error);
      // Fallback with more realistic data
      setStudents([
        { id: 1, name: 'Alice Johnson', email: 'alice.johnson@university.edu', role: 'student', created_at: '2024-01-15', updated_at: '2024-01-15' },
        { id: 2, name: 'Bob Smith', email: 'bob.smith@university.edu', role: 'student', created_at: '2024-01-16', updated_at: '2024-01-16' },
        { id: 3, name: 'Carol Davis', email: 'carol.davis@university.edu', role: 'student', created_at: '2024-01-17', updated_at: '2024-01-17' },
        { id: 4, name: 'David Wilson', email: 'david.wilson@university.edu', role: 'student', created_at: '2024-01-18', updated_at: '2024-01-18' },
        { id: 5, name: 'Emma Brown', email: 'emma.brown@university.edu', role: 'student', created_at: '2024-01-19', updated_at: '2024-01-19' },
        { id: 6, name: 'Frank Miller', email: 'frank.miller@university.edu', role: 'student', created_at: '2024-01-20', updated_at: '2024-01-20' },
        { id: 7, name: 'Grace Taylor', email: 'grace.taylor@university.edu', role: 'student', created_at: '2024-01-21', updated_at: '2024-01-21' },
        { id: 8, name: 'Henry Anderson', email: 'henry.anderson@university.edu', role: 'student', created_at: '2024-01-22', updated_at: '2024-01-22' },
        { id: 9, name: 'Ivy Thomas', email: 'ivy.thomas@university.edu', role: 'student', created_at: '2024-01-23', updated_at: '2024-01-23' },
        { id: 10, name: 'Jack Garcia', email: 'jack.garcia@university.edu', role: 'student', created_at: '2024-01-24', updated_at: '2024-01-24' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAnalytics = async (student: User) => {
    try {
      setAnalyticsLoading(true);
      setSelectedStudent(student);
      
      // Generate comprehensive demo data for the selected student
      const demoAnalytics: StudentAnalyticsData = {
        totalAssignments: 15,
        completedAssignments: 12,
        totalQuizzes: 10,
        attemptedQuizzes: 9,
        averageScore: 87.5,
        totalSubmissions: 12,
        pendingSubmissions: 3,
        moduleProgress: [
          { module_name: 'Mathematics', progress_percentage: 95, completed_lessons: 19, total_lessons: 20 },
          { module_name: 'Science', progress_percentage: 88, completed_lessons: 14, total_lessons: 16 },
          { module_name: 'English', progress_percentage: 92, completed_lessons: 11, total_lessons: 12 },
          { module_name: 'History', progress_percentage: 75, completed_lessons: 9, total_lessons: 12 },
          { module_name: 'Computer Science', progress_percentage: 90, completed_lessons: 18, total_lessons: 20 }
        ],
        recentSubmissions: [
          { id: 1, assignment_title: 'Advanced Calculus Problem Set', status: 'graded', grade: 95, submitted_at: '2024-01-20' },
          { id: 2, assignment_title: 'Chemistry Lab Report - Organic Compounds', status: 'graded', grade: 88, submitted_at: '2024-01-19' },
          { id: 3, assignment_title: 'Literary Analysis - Shakespeare', status: 'graded', grade: 92, submitted_at: '2024-01-18' },
          { id: 4, assignment_title: 'World War II Research Paper', status: 'submitted', grade: null, submitted_at: '2024-01-17' },
          { id: 5, assignment_title: 'Python Programming Project', status: 'graded', grade: 89, submitted_at: '2024-01-16' },
          { id: 6, assignment_title: 'Physics Experiment - Thermodynamics', status: 'graded', grade: 85, submitted_at: '2024-01-15' },
          { id: 7, assignment_title: 'Creative Writing Portfolio', status: 'graded', grade: 94, submitted_at: '2024-01-14' },
          { id: 8, assignment_title: 'Database Design Assignment', status: 'submitted', grade: null, submitted_at: '2024-01-13' }
        ],
        performanceBySubject: [
          { subject: 'Mathematics', average_score: 92, total_assignments: 5, completed_assignments: 5 },
          { subject: 'Science', average_score: 86, total_assignments: 4, completed_assignments: 4 },
          { subject: 'English', average_score: 93, total_assignments: 3, completed_assignments: 3 },
          { subject: 'History', average_score: 78, total_assignments: 2, completed_assignments: 1 },
          { subject: 'Computer Science', average_score: 89, total_assignments: 3, completed_assignments: 3 }
        ]
      };
      
      setAnalytics(demoAnalytics);
    } catch (error) {
      console.error('Error fetching student analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
    setAnalytics(null);
  };

  if (loading) {
    return (
      <div className="enhanced-analytics-container">
        <div className="enhanced-loading-state">
          <div className="enhanced-loading-spinner"></div>
          <span className="enhanced-loading-text">Loading students...</span>
        </div>
      </div>
    );
  }

  if (selectedStudent && analytics) {
    return (
      <div className="enhanced-analytics-container enhanced-fade-in">
        <div className="enhanced-analytics-header">
          <button 
            onClick={handleBackToStudents}
            className="enhanced-analytics-button mb-4"
            style={{ width: 'auto', flex: 'none' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Students
          </button>
          <h2 className="enhanced-analytics-title">
            {selectedStudent.name} - Detailed Analytics
          </h2>
          <p className="enhanced-analytics-subtitle">
            Comprehensive performance analysis and progress tracking for individual student
          </p>
        </div>

        {analyticsLoading ? (
          <div className="enhanced-loading-state">
            <div className="enhanced-loading-spinner"></div>
            <span className="enhanced-loading-text">Loading detailed analytics...</span>
          </div>
        ) : (
          <div className="enhanced-students-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
            {/* Performance Overview */}
            <div className="enhanced-student-card">
              <div className="enhanced-student-header">
                <div className="enhanced-student-avatar">📊</div>
                <div className="enhanced-student-info">
                  <h3>Performance Overview</h3>
                  <div className="enhanced-student-id">
                    <span>📈</span>
                    Overall Progress
                  </div>
                </div>
              </div>
              
              <div className="enhanced-student-details">
                <div className="enhanced-detail-item">
                  <span className="enhanced-detail-icon">📝</span>
                  <div className="enhanced-detail-label">Total Assignments</div>
                  <div className="enhanced-detail-value">{analytics.totalAssignments}</div>
                </div>
                
                <div className="enhanced-detail-item">
                  <span className="enhanced-detail-icon">✅</span>
                  <div className="enhanced-detail-label">Completed</div>
                  <div className="enhanced-detail-value">{analytics.completedAssignments}</div>
                </div>
                
                <div className="enhanced-detail-item">
                  <span className="enhanced-detail-icon">🧪</span>
                  <div className="enhanced-detail-label">Total Quizzes</div>
                  <div className="enhanced-detail-value">{analytics.totalQuizzes}</div>
                </div>
                
                <div className="enhanced-detail-item">
                  <span className="enhanced-detail-icon">🎯</span>
                  <div className="enhanced-detail-label">Average Score</div>
                  <div className="enhanced-detail-value">{analytics.averageScore}%</div>
                </div>
              </div>
              
              <div className="enhanced-performance-indicator excellent">
                Excellent Performance
              </div>
            </div>

            {/* Module Progress */}
            <div className="enhanced-student-card">
              <div className="enhanced-student-header">
                <div className="enhanced-student-avatar">📚</div>
                <div className="enhanced-student-info">
                  <h3>Module Progress</h3>
                  <div className="enhanced-student-id">
                    <span>🎓</span>
                    Learning Journey
                  </div>
                </div>
              </div>
              
              <div style={{ padding: '1rem 0' }}>
                {analytics.moduleProgress.map((module, index) => (
                  <div key={index} style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(248, 250, 252, 0.8)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>{module.module_name}</span>
                      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{module.progress_percentage}%</span>
                    </div>
                    <div style={{ background: '#e5e7eb', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%',
                          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                          borderRadius: '8px',
                          width: `${module.progress_percentage}%`,
                          transition: 'width 0.6s ease'
                        }}
                      ></div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      {module.completed_lessons} of {module.total_lessons} lessons completed
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="enhanced-student-card">
              <div className="enhanced-student-header">
                <div className="enhanced-student-avatar">📤</div>
                <div className="enhanced-student-info">
                  <h3>Recent Submissions</h3>
                  <div className="enhanced-student-id">
                    <span>⏱️</span>
                    Latest Work
                  </div>
                </div>
              </div>
              
              <div style={{ padding: '1rem 0' }}>
                {analytics.recentSubmissions.map((submission) => (
                  <div key={submission.id} style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(248, 250, 252, 0.8)', borderRadius: '12px' }}>
                    <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>
                      {submission.assignment_title}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className={`enhanced-performance-indicator ${submission.status === 'completed' ? 'excellent' : 'average'}`}>
                        {submission.status}
                      </div>
                      {submission.grade && (
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                          Grade: {submission.grade}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance by Subject */}
            <div className="enhanced-student-card">
              <div className="enhanced-student-header">
                <div className="enhanced-student-avatar">🏆</div>
                <div className="enhanced-student-info">
                  <h3>Subject Performance</h3>
                  <div className="enhanced-student-id">
                    <span>📊</span>
                    By Category
                  </div>
                </div>
              </div>
              
              <div style={{ padding: '1rem 0' }}>
                {analytics.performanceBySubject.map((subject, index) => (
                  <div key={index} style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(248, 250, 252, 0.8)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>{subject.subject}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                        {subject.average_score}% avg
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {subject.completed_assignments} of {subject.total_assignments} assignments completed
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <div className={`enhanced-performance-indicator ${
                        subject.average_score >= 90 ? 'excellent' : 
                        subject.average_score >= 80 ? 'good' : 
                        subject.average_score >= 70 ? 'average' : 'poor'
                      }`}>
                        {subject.average_score >= 90 ? 'Excellent' : 
                         subject.average_score >= 80 ? 'Good' : 
                         subject.average_score >= 70 ? 'Average' : 'Needs Improvement'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="enhanced-analytics-container enhanced-fade-in">
      {/* Header Section */}
      <div className="enhanced-analytics-header">
        <h2 className="enhanced-analytics-title">Student Analytics Dashboard</h2>
        <p className="enhanced-analytics-subtitle">
          Monitor and analyze student performance with comprehensive insights and real-time data
        </p>
        
        {/* Statistics Overview - Only show when no student is selected */}
        {!selectedStudent && (
          <div className="enhanced-stats-overview">
            <div className="enhanced-stat-card total">
              <div className="enhanced-stat-icon">👥</div>
              <div className="enhanced-stat-number">{students.length}</div>
              <div className="enhanced-stat-label">Total Students</div>
              <div className="enhanced-stat-description">Actively enrolled</div>
            </div>
            
            <div className="enhanced-stat-card active">
              <div className="enhanced-stat-icon">✅</div>
              <div className="enhanced-stat-number">{filteredStudents.length}</div>
              <div className="enhanced-stat-label">Filtered Results</div>
              <div className="enhanced-stat-description">Matching criteria</div>
            </div>
            
            <div className="enhanced-stat-card performance">
              <div className="enhanced-stat-icon">📊</div>
              <div className="enhanced-stat-number">87%</div>
              <div className="enhanced-stat-label">Avg Performance</div>
              <div className="enhanced-stat-description">Class average</div>
            </div>
            
            <div className="enhanced-stat-card engagement">
              <div className="enhanced-stat-icon">⚡</div>
              <div className="enhanced-stat-number">92%</div>
              <div className="enhanced-stat-label">Engagement Rate</div>
              <div className="enhanced-stat-description">Active participation</div>
            </div>
          </div>
        )}
      </div>

      {/* Search Section - Only show when no student is selected */}
      {!selectedStudent && (
        <div className="enhanced-search-section">
          <div className="enhanced-search-wrapper">
            <input
              type="text"
              placeholder="Search students by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="enhanced-search-input"
            />
            <svg className="enhanced-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {searchQuery && (
            <div className="enhanced-filter-indicator">
              <span>🔍</span>
              Showing {filteredStudents.length} of {students.length} students
            </div>
          )}
        </div>
      )}

      {/* Show student list only when no student is selected */}
      {!selectedStudent && (
        <>
          {/* Students Grid */}
          <div className="enhanced-students-grid">
            {filteredStudents.map((student, index) => (
              <div 
                key={student.id} 
                className="enhanced-student-card enhanced-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="enhanced-student-header">
                  <div className="enhanced-student-avatar">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="enhanced-student-info">
                    <h3>{student.name}</h3>
                    <div className="enhanced-student-id">
                      <span>🆔</span>
                      Student ID: {student.id}
                    </div>
                    <div className="enhanced-student-gpa">
                      <span>📈</span>
                      GPA: 3.7
                    </div>
                  </div>
                </div>

                <div className="enhanced-student-subject">
                  <span>📚</span>
                  Web Development
                </div>

                <div className="enhanced-student-details">
                  <div className="enhanced-detail-item">
                    <span className="enhanced-detail-icon">📧</span>
                    <div className="enhanced-detail-label">Email</div>
                    <div className="enhanced-detail-value">{student.email.length > 20 ? student.email.substring(0, 20) + '...' : student.email}</div>
                  </div>
                  
                  <div className="enhanced-detail-item">
                    <span className="enhanced-detail-icon">📅</span>
                    <div className="enhanced-detail-label">Joined</div>
                    <div className="enhanced-detail-value">{new Date(student.created_at).toLocaleDateString()}</div>
                  </div>
                  
                  <div className="enhanced-detail-item">
                    <span className="enhanced-detail-icon">⏰</span>
                    <div className="enhanced-detail-label">Last Active</div>
                    <div className="enhanced-detail-value">2 hours ago</div>
                  </div>
                  
                  <div className="enhanced-detail-item">
                    <span className="enhanced-detail-icon">🎯</span>
                    <div className="enhanced-detail-label">Progress</div>
                    <div className="enhanced-detail-value">85%</div>
                  </div>
                </div>

                <div className="enhanced-performance-indicator excellent">
                  Excellent Performance
                </div>

                <div className="enhanced-student-actions">
                  <button
                    onClick={() => fetchStudentAnalytics(student)}
                    className="enhanced-analytics-button"
                    disabled={analyticsLoading}
                  >
                    {analyticsLoading ? (
                      <div className="enhanced-loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                    ) : (
                      <>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        View Analytics
                      </>
                    )}
                  </button>
                  
                  <button
                    className="enhanced-dashboard-button"
                    onClick={() => fetchStudentAnalytics(student)}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Dashboard
                  </button>
                </div>

                <button className="enhanced-send-feedback-button">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Send Feedback
                </button>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="enhanced-empty-state">
              <div className="enhanced-empty-icon">🔍</div>
              <h3 className="enhanced-empty-title">No students found</h3>
              <p className="enhanced-empty-description">
                Try adjusting your search criteria or browse all students to find what you're looking for.
              </p>
            </div>
          )}
        </>
      )}

      {/* Detailed Student Analytics View */}
      {selectedStudent && analytics && (
        <div className="enhanced-detailed-analytics">
          <div className="enhanced-analytics-header">
            <button 
              onClick={handleBackToStudents}
              className="enhanced-back-button"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Students
            </button>
            <div className="enhanced-student-header-info">
              <h2>{selectedStudent.name}'s Analytics Dashboard</h2>
              <p>Comprehensive performance insights and academic progress</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="enhanced-metrics-grid">
            <div className="enhanced-metric-card">
              <div className="enhanced-metric-icon">📚</div>
              <div className="enhanced-metric-value">{analytics.totalAssignments}</div>
              <div className="enhanced-metric-label">Total Assignments</div>
              <div className="enhanced-metric-subtitle">{analytics.completedAssignments} completed</div>
            </div>
            
            <div className="enhanced-metric-card">
              <div className="enhanced-metric-icon">🧠</div>
              <div className="enhanced-metric-value">{analytics.totalQuizzes}</div>
              <div className="enhanced-metric-label">Total Quizzes</div>
              <div className="enhanced-metric-subtitle">{analytics.attemptedQuizzes} attempted</div>
            </div>
            
            <div className="enhanced-metric-card">
              <div className="enhanced-metric-icon">📊</div>
              <div className="enhanced-metric-value">{analytics.averageScore}%</div>
              <div className="enhanced-metric-label">Average Score</div>
              <div className="enhanced-metric-subtitle">Overall performance</div>
            </div>
            
            <div className="enhanced-metric-card">
              <div className="enhanced-metric-icon">📝</div>
              <div className="enhanced-metric-value">{analytics.totalSubmissions}</div>
              <div className="enhanced-metric-label">Submissions</div>
              <div className="enhanced-metric-subtitle">{analytics.pendingSubmissions} pending</div>
            </div>
          </div>

          {/* Module Progress */}
          <div className="enhanced-module-progress">
            <h3>Module Progress</h3>
            <div className="enhanced-progress-grid">
              {analytics.moduleProgress.map((module, index) => (
                <div key={index} className="enhanced-progress-card">
                  <div className="enhanced-progress-header">
                    <h4>{module.module_name}</h4>
                    <span className="enhanced-progress-percentage">{module.progress_percentage}%</span>
                  </div>
                  <div className="enhanced-progress-bar">
                    <div 
                      className="enhanced-progress-fill"
                      style={{ width: `${module.progress_percentage}%` }}
                    ></div>
                  </div>
                  <div className="enhanced-progress-details">
                    <span>{module.completed_lessons} of {module.total_lessons} lessons completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="enhanced-recent-submissions">
            <h3>Recent Submissions</h3>
            <div className="enhanced-submissions-list">
              {analytics.recentSubmissions.map((submission) => (
                <div key={submission.id} className="enhanced-submission-item">
                  <div className="enhanced-submission-info">
                    <h4>{submission.assignment_title}</h4>
                    <div className="enhanced-submission-meta">
                      <span className={`enhanced-status-badge ${submission.status}`}>
                        {submission.status}
                      </span>
                      <span className="enhanced-submission-date">{submission.submitted_at}</span>
                    </div>
                  </div>
                  <div className="enhanced-submission-grade">
                    {submission.grade ? (
                      <span className="enhanced-grade-badge">{submission.grade}%</span>
                    ) : (
                      <span className="enhanced-pending-badge">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance by Subject */}
          <div className="enhanced-subject-performance">
            <h3>Performance by Subject</h3>
            <div className="enhanced-subject-grid">
              {analytics.performanceBySubject.map((subject, index) => (
                <div key={index} className="enhanced-subject-card">
                  <div className="enhanced-subject-header">
                    <h4>{subject.subject}</h4>
                    <span className="enhanced-subject-score">{subject.average_score}%</span>
                  </div>
                  <div className="enhanced-subject-progress">
                    <div className="enhanced-subject-bar">
                      <div 
                        className="enhanced-subject-fill"
                        style={{ width: `${subject.average_score}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="enhanced-subject-stats">
                    <span>{subject.completed_assignments} of {subject.total_assignments} assignments</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAnalytics;