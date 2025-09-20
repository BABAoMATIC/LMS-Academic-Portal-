import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import SubmissionUpload from './SubmissionUpload';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmissionUpload, setShowSubmissionUpload] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    if (user) {
      fetchStudentData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedSubject) {
      fetchCoursesBySubject(selectedSubject.id);
    }
  }, [selectedSubject]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`/api/student/${user.id}/subjects`, { headers });
      setSubjects(response.data.subjects);
      
      if (response.data.subjects.length > 0) {
        setSelectedSubject(response.data.subjects[0]);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesBySubject = async (subjectId) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(`/api/student/${user.id}/courses?subject_id=${subjectId}`, { headers });
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching courses by subject:', error);
    }
  };

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowSubmissionUpload(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Here are your enrolled subjects and courses.</p>
        </div>

        {/* Subject Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Subjects</h2>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedSubject?.id === subject.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedSubject.title}</h2>
                <p className="text-gray-600 mt-1">{selectedSubject.description}</p>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-6">Available Courses</h3>
              {courses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No courses available for this subject</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleCourseClick(course)}
                    >
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h4>
                        <p className="text-gray-600 text-sm mb-3">{course.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{course.progress_percentage || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${course.progress_percentage || 0}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            course.is_completed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {course.is_completed ? 'Completed' : 'In Progress'}
                          </span>
                          
                          {course.content_link && (
                            <a
                              href={course.content_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Content →
                            </a>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseClick(course);
                        }}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {course.is_completed ? 'Review Course' : 'Continue Learning'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Submission Upload Modal */}
      {showSubmissionUpload && selectedCourse && (
        <SubmissionUpload
          course={selectedCourse}
          onClose={() => {
            setShowSubmissionUpload(false);
            setSelectedCourse(null);
          }}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
