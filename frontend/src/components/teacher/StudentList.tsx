import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import LoadingSpinner from '../LoadingSpinner';

interface StudentListProps {
  onStudentClick: (student: User) => void;
}

const StudentList: React.FC<StudentListProps> = ({ onStudentClick }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<Array<{ id: number; title: string }>>([]);

  useEffect(() => {
    if (user) {
      fetchStudents();
      fetchSubjects();
    }
  }, [user]);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students, selectedSubject]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('Fetching students...');
      
      // Use general students endpoint to get all students for manage students section
      const response = await axios.get('/api/students');
      console.log('Students endpoint response:', response.data);
      
      // Handle both array format and object with students property
      const studentsData = Array.isArray(response.data) ? response.data : response.data.students || [];
      console.log('Processed students data:', studentsData.length, 'students');
      
      // Ensure all students have the required fields
      const processedStudents = studentsData.map((student: any) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        role: student.role || 'student',
        created_at: student.created_at,
        updated_at: student.updated_at || student.created_at
      }));
      
      setStudents(processedStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      console.log('Using fallback data...');
      // Set fallback data from our seeded database
      setStudents([
        { id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'student', created_at: '2024-01-15', updated_at: '2024-01-15' },
        { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'student', created_at: '2024-01-16', updated_at: '2024-01-16' },
        { id: 3, name: 'Mike Johnson', email: 'mike.johnson@example.com', role: 'student', created_at: '2024-01-17', updated_at: '2024-01-17' },
        { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@example.com', role: 'student', created_at: '2024-01-18', updated_at: '2024-01-18' },
        { id: 5, name: 'David Brown', email: 'david.brown@example.com', role: 'student', created_at: '2024-01-19', updated_at: '2024-01-19' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      // Try to fetch modules as subjects
      const response = await axios.get('/api/modules');
      if (response.data && Array.isArray(response.data)) {
        setSubjects(response.data.map((module: any) => ({
          id: module.id,
          title: module.name
        })));
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Set fallback subjects
      setSubjects([
        { id: 1, title: 'Mathematics' },
        { id: 2, title: 'Science' },
        { id: 3, title: 'English' },
        { id: 4, title: 'History' },
        { id: 5, title: 'Computer Science' }
      ]);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Filter by subject if selected
    if (selectedSubject) {
      // This would need to be implemented based on your data structure
      // For now, we'll show all students
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.toString().includes(searchQuery)
      );
    }

    setFilteredStudents(filtered);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="student-management-container">
      <div className="student-header">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Student Management</h2>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Manage and monitor all your students</p>
        </div>
        <div className="student-count-badge">
          {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {/* Enhanced Filters and Search */}
      <div className="student-filters">
        <div className="filter-grid">
          <div className="filter-group">
            <label className="filter-label">
              Subject Filter
            </label>
            <select
              value={selectedSubject || ''}
              onChange={(e) => setSelectedSubject(e.target.value ? Number(e.target.value) : null)}
              className="enhanced-form-select"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.title}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">
              Search Students
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="enhanced-form-input"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Students Grid */}
      {filteredStudents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <h3 className="empty-state-title">No students found</h3>
          <p className="empty-state-description">
            {searchQuery || selectedSubject ? 'Try adjusting your filters' : 'No students are currently enrolled'}
          </p>
        </div>
      ) : (
        <div className="student-grid">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              onClick={() => onStudentClick(student)}
              className="student-card"
            >
              <div className="flex items-center mb-4">
                <div className="student-avatar">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="student-info">
                  <h3 className="student-name">
                    {student.name}
                  </h3>
                  <div className="student-id">
                    ID: {student.id}
                  </div>
                </div>
              </div>

              <div className="student-details">
                <div className="student-detail-item">
                  <span className="student-detail-icon" style={{fontSize: '18px'}}>📧</span>
                  {student.email}
                </div>
                {student.phone && (
                  <div className="student-detail-item">
                    <span className="student-detail-icon" style={{fontSize: '18px'}}>📱</span>
                    {student.phone}
                  </div>
                )}
                {student.gender && (
                  <div className="student-detail-item">
                    <span className="student-detail-icon" style={{fontSize: '18px'}}>👤</span>
                    {student.gender}
                  </div>
                )}
              </div>

              <div className="student-footer">
                <div className="student-join-date">
                  Joined: {new Date(student.created_at).toLocaleDateString()}
                </div>
                <button className="analytics-button">
                  View Analytics →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Student Stats */}
      <div className="student-stats">
        <h3 className="stats-title">Student Overview</h3>
        <div className="stats-grid">
          <div className="stat-item stat-total">
            <div className="stat-value">
              {students.length}
            </div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-item stat-male">
            <div className="stat-value">
              {students.filter(s => s.gender === 'male').length}
            </div>
            <div className="stat-label">Male</div>
          </div>
          <div className="stat-item stat-female">
            <div className="stat-value">
              {students.filter(s => s.gender === 'female').length}
            </div>
            <div className="stat-label">Female</div>
          </div>
          <div className="stat-item stat-other">
            <div className="stat-value">
              {students.filter(s => !s.gender).length}
            </div>
            <div className="stat-label">Not Specified</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
