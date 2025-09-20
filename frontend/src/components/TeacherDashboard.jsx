import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import CourseModal from './CourseModal';
import StudentAnalytics from './StudentAnalytics';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTeacherData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedSubject) {
      fetchStudentsBySubject(selectedSubject.id);
      fetchCoursesBySubject(selectedSubject.id);
    }
  }, [selectedSubject]);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students]);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const [subjectsRes, studentsRes] = await Promise.all([
        axios.get(`/api/teacher/${user.id}/subjects`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`/api/teacher/${user.id}/students`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setSubjects(subjectsRes.data.subjects);
      setStudents(studentsRes.data.students);
      
      if (subjectsRes.data.subjects.length > 0) {
        setSelectedSubject(subjectsRes.data.subjects[0]);
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsBySubject = async (subjectId) => {
    try {
      const response = await axios.get(`/api/teacher/${user.id}/students?subject_id=${subjectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students by subject:', error);
    }
  };

  const fetchCoursesBySubject = async (subjectId) => {
    try {
      const response = await axios.get(`/api/teacher/${user.id}/courses?subject_id=${subjectId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching courses by subject:', error);
    }
  };

  const filterStudents = () => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toString().includes(searchQuery)
    );
    setFilteredStudents(filtered);
  };

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setShowCourseModal(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowCourseModal(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchCoursesBySubject(selectedSubject.id);
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const handleCourseSaved = () => {
    setShowCourseModal(false);
    fetchCoursesBySubject(selectedSubject.id);
  };

  const handleStudentClick = (student, event) => {
    // Prevent default behavior to avoid page refresh
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('🎯 Opening analytics for student:', student);
    console.log('🎯 Student data structure:', {
      id: student.id,
      name: student.name,
      email: student.email,
      hasId: !!student.id,
      hasName: !!student.name
    });
    
    // Ensure we have valid student data
    if (!student || !student.id) {
      console.error('❌ Invalid student data:', student);
      return;
    }
    
    setSelectedStudent(student);
    setShowAnalytics(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Teacher Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your subjects, students, and courses</p>
        </div>

        {/* Subject Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">Select Subject</h2>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  selectedSubject?.id === subject.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {subject.title}
              </button>
            ))}
          </div>
        </div>

        {selectedSubject && (
          <>
            {/* Subject Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{selectedSubject.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedSubject.description}</p>
                </div>
                <button
                  onClick={handleCreateCourse}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  + Add Course
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search students by name, email, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredStudents.length} students found
                </div>
              </div>
            </div>

            {/* Students List - Enhanced Layout */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Student List ({filteredStudents.length})</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Click on any student to view their detailed analytics</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing {filteredStudents.length} of {students.length} students
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No students found</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.id}
                        onClick={(event) => handleStudentClick(student, event)}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white text-base">{student.name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              Active
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Student ID:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{student.id}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Last Active:</span>
                            <span className="text-gray-900 dark:text-white">
                              {new Date(student.last_active || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleStudentClick(student, event);
                          }}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          View Analytics
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Courses List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Courses ({courses.length})</h3>
                </div>
                <div className="p-4 sm:p-6">
                  {courses.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">No courses found</p>
                  ) : (
                    <div className="space-y-3">
                      {courses.map((course) => (
                        <div key={course.id} className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">{course.title}</h4>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">{course.description}</p>
                              {course.content_link && (
                                <a
                                  href={course.content_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs sm:text-sm mt-1 inline-block"
                                >
                                  View Content →
                                </a>
                              )}
                            </div>
                            <div className="flex space-x-2 ml-0 sm:ml-4">
                              <button
                                onClick={() => handleEditCourse(course)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs sm:text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(course.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs sm:text-sm font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Course Modal */}
      {showCourseModal && (
        <CourseModal
          course={editingCourse}
          subjectId={selectedSubject?.id}
          onClose={() => setShowCourseModal(false)}
          onSaved={handleCourseSaved}
        />
      )}

      {/* Student Analytics Modal */}
      {showAnalytics && selectedStudent && (
        <div className="fixed inset-0 z-50">
          {console.log('🎯 Rendering StudentAnalytics modal for:', selectedStudent)}
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedStudent.name} - Student Analytics Dashboard
                    </h2>
                    <p className="text-gray-600">Student ID: {selectedStudent.id} | {selectedStudent.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      console.log('🎯 Closing StudentAnalytics modal');
                      setShowAnalytics(false);
                      setSelectedStudent(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-2">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedStudent.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Student ID</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedStudent.id}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-lg font-semibold text-gray-900">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-600">Total Quizzes</h3>
                    <p className="text-2xl font-bold text-blue-900">12</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-600">Modules Completed</h3>
                    <p className="text-2xl font-bold text-green-900">8</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-600">Assignments</h3>
                    <p className="text-2xl font-bold text-purple-900">15</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-orange-600">Overall GPA</h3>
                    <p className="text-2xl font-bold text-orange-900">87.5</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Analytics Dashboard</h3>
                  <p className="text-gray-600">
                    This is a test view of the student analytics dashboard. 
                    The full analytics component should load here with charts and detailed data.
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        console.log('🎯 Loading full analytics for:', selectedStudent);
                        // Here we would load the full StudentAnalytics component
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Load Full Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
