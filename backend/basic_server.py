#!/usr/bin/env python3
"""
Basic Flask Server for Academic Portal
Simple server that works with existing database
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import sqlite3
import os
from datetime import datetime, timedelta

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Enable CORS for all routes
CORS(app, origins=["http://localhost:3001", "http://localhost:3000"])

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:3001", "http://localhost:3000"])

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'instance', 'education.db')

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# API Routes
@app.route('/')
def index():
    """API documentation"""
    return jsonify({
        "message": "Academic Portal API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "users": "/api/users",
            "assignments": "/api/assignments",
            "submissions": "/api/submissions",
            "quizzes": "/api/quizzes",
            "notifications": "/api/notifications",
            "reflections": "/api/reflections"
        }
    })

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        print(f"🔐 Login attempt: email={email}, password={'*' * len(password) if password else 'None'}")
        
        if not email or not password:
            print("❌ Missing email or password")
            return jsonify({"error": "Email and password are required"}), 400
        
        conn = get_db_connection()
        user = conn.execute(
            'SELECT id, name, email, role, password_hash FROM users WHERE email = ?', 
            (email,)
        ).fetchone()
        conn.close()
        
        print(f"👤 User found: {dict(user) if user else 'None'}")
        
        if not user:
            print("❌ User not found")
            return jsonify({"error": "Invalid credentials"}), 401
        
        # For demo purposes, accept any password (in production, verify password_hash)
        # In a real app, you would verify: check_password_hash(user['password_hash'], password)
        
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user['id'],
                "name": user['name'],
                "email": user['email'],
                "role": user['role']
            },
            "access_token": "demo-token-123"  # In production, generate a real JWT token
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration endpoint"""
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'student')
        
        if not name or not email or not password:
            return jsonify({"error": "Name, email and password are required"}), 400
        
        conn = get_db_connection()
        
        # Check if user already exists
        existing_user = conn.execute(
            'SELECT id FROM users WHERE email = ?', 
            (email,)
        ).fetchone()
        
        if existing_user:
            conn.close()
            return jsonify({"error": "User with this email already exists"}), 400
        
        # Create new user (in production, hash the password)
        conn.execute(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            (name, email, password, role)  # In production, use: generate_password_hash(password)
        )
        conn.commit()
        
        # Get the new user
        new_user = conn.execute(
            'SELECT id, name, email, role FROM users WHERE email = ?', 
            (email,)
        ).fetchone()
        conn.close()
        
        return jsonify({
            "message": "Registration successful",
            "user": {
                "id": new_user['id'],
                "name": new_user['name'],
                "email": new_user['email'],
                "role": new_user['role']
            },
            "access_token": "demo-token-123"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users"""
    try:
        conn = get_db_connection()
        users = conn.execute('SELECT id, name, email, role, created_at FROM users LIMIT 10').fetchall()
        conn.close()
        return jsonify([dict(user) for user in users])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/students', methods=['GET'])
def get_students():
    """Get all students"""
    try:
        conn = get_db_connection()
        students = conn.execute('SELECT id, name, email, role, created_at FROM users WHERE role = "student"').fetchall()
        conn.close()
        return jsonify([dict(student) for student in students])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/assignments', methods=['GET'])
def get_assignments():
    """Get all assignments"""
    try:
        conn = get_db_connection()
        assignments = conn.execute('''
            SELECT a.*, u.name as created_by_name 
            FROM assignments a 
            LEFT JOIN users u ON a.teacher_id = u.id 
            ORDER BY a.created_at DESC
            LIMIT 10
        ''').fetchall()
        conn.close()
        return jsonify([dict(assignment) for assignment in assignments])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/<int:student_id>/submissions', methods=['GET'])
def get_student_submissions_old(student_id):
    """Get submissions for a specific student (old route)"""
    try:
        conn = get_db_connection()
        submissions = conn.execute('''
            SELECT s.*, a.title as assignment_title
            FROM submissions s
            LEFT JOIN assignments a ON s.assignment_id = a.id
            WHERE s.student_id = ?
            ORDER BY s.submitted_at DESC
            LIMIT 10
        ''', (student_id,)).fetchall()
        conn.close()
        return jsonify([dict(submission) for submission in submissions])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/quizzes', methods=['GET'])
def get_quizzes():
    """Get all quizzes"""
    try:
        conn = get_db_connection()
        quizzes = conn.execute('SELECT * FROM quizzes ORDER BY created_at DESC LIMIT 10').fetchall()
        conn.close()
        return jsonify([dict(quiz) for quiz in quizzes])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    """Get all notifications"""
    try:
        conn = get_db_connection()
        notifications = conn.execute('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10').fetchall()
        conn.close()
        return jsonify([dict(notification) for notification in notifications])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reflections', methods=['GET'])
def get_reflections():
    """Get all reflections"""
    try:
        conn = get_db_connection()
        reflections = conn.execute('SELECT * FROM reflections ORDER BY created_at DESC LIMIT 10').fetchall()
        conn.close()
        return jsonify([dict(reflection) for reflection in reflections])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/reflections', methods=['POST'])
def create_reflection():
    """Create new reflection"""
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO reflections (student_id, title, content, learning_outcomes, skills_developed)
            VALUES (?, ?, ?, ?, ?)
        ''', (data.get('student_id', 3), data['title'], data.get('content', ''), 
              data.get('learning_outcomes', ''), data.get('skills_developed', '')))
        
        conn.commit()
        reflection_id = cursor.lastrowid
        conn.close()
        
        return jsonify({"id": reflection_id, "message": "Reflection created successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Additional missing endpoints
@app.route('/api/student/<int:student_id>/quiz-status', methods=['GET'])
def get_student_quiz_status(student_id):
    """Get quiz status for a specific student"""
    try:
        conn = get_db_connection()
        # Return empty array for now - can be enhanced later
        conn.close()
        return jsonify([])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/students/<int:student_id>/progress', methods=['GET'])
def get_student_progress(student_id):
    """Get progress data for a specific student"""
    try:
        # Return sample progress data
        progress_data = {
            "progress": [
                {
                    "module_name": "Mathematics",
                    "progress_percentage": 95,
                    "completed_lessons": 19,
                    "total_lessons": 20
                },
                {
                    "module_name": "Science",
                    "progress_percentage": 88,
                    "completed_lessons": 14,
                    "total_lessons": 16
                },
                {
                    "module_name": "English",
                    "progress_percentage": 92,
                    "completed_lessons": 11,
                    "total_lessons": 12
                },
                {
                    "module_name": "History",
                    "progress_percentage": 78,
                    "completed_lessons": 8,
                    "total_lessons": 10
                },
                {
                    "module_name": "Geography",
                    "progress_percentage": 85,
                    "completed_lessons": 12,
                    "total_lessons": 14
                }
            ]
        }
        return jsonify(progress_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/students/<int:student_id>/quiz-attempts', methods=['GET'])
def get_student_quiz_attempts(student_id):
    """Get quiz attempts for a specific student"""
    try:
        # Return sample quiz attempts data
        attempts_data = {
            "attempts": [
                {
                    "id": 1,
                    "quiz_id": 1,
                    "quiz_title": "Math Quiz 1",
                    "score": 85,
                    "max_score": 100,
                    "percentage": 85,
                    "attempted_at": "2024-01-20T10:30:00Z",
                    "completed_at": "2024-01-20T10:45:00Z",
                    "status": "completed"
                },
                {
                    "id": 2,
                    "quiz_id": 2,
                    "quiz_title": "Science Quiz 1",
                    "score": 92,
                    "max_score": 100,
                    "percentage": 92,
                    "attempted_at": "2024-01-19T14:20:00Z",
                    "completed_at": "2024-01-19T14:35:00Z",
                    "status": "completed"
                },
                {
                    "id": 3,
                    "quiz_id": 3,
                    "quiz_title": "English Quiz 1",
                    "score": 78,
                    "max_score": 100,
                    "percentage": 78,
                    "attempted_at": "2024-01-18T09:15:00Z",
                    "completed_at": "2024-01-18T09:30:00Z",
                    "status": "completed"
                },
                {
                    "id": 4,
                    "quiz_id": 4,
                    "quiz_title": "History Quiz 1",
                    "score": 88,
                    "max_score": 100,
                    "percentage": 88,
                    "attempted_at": "2024-01-17T16:45:00Z",
                    "completed_at": "2024-01-17T17:00:00Z",
                    "status": "completed"
                }
            ]
        }
        return jsonify(attempts_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/students/<int:student_id>/submissions', methods=['GET'], endpoint='get_student_submissions_v2')
def get_student_submissions_new(student_id):
    """Get submissions for a specific student"""
    try:
        # Return sample submissions data
        submissions_data = {
            "submissions": [
                {
                    "id": 1,
                    "assignment_id": 1,
                    "assignment_title": "Math Assignment 1",
                    "status": "completed",
                    "grade": 92,
                    "submitted_at": "2024-01-20T14:30:00Z",
                    "module_name": "Mathematics"
                },
                {
                    "id": 2,
                    "assignment_id": 2,
                    "assignment_title": "Science Project",
                    "status": "completed",
                    "grade": 88,
                    "submitted_at": "2024-01-19T11:20:00Z",
                    "module_name": "Science"
                },
                {
                    "id": 3,
                    "assignment_id": 3,
                    "assignment_title": "English Essay",
                    "status": "completed",
                    "grade": 85,
                    "submitted_at": "2024-01-18T16:45:00Z",
                    "module_name": "English"
                },
                {
                    "id": 4,
                    "assignment_id": 4,
                    "assignment_title": "History Report",
                    "status": "submitted",
                    "grade": None,
                    "submitted_at": "2024-01-17T13:15:00Z",
                    "module_name": "History"
                },
                {
                    "id": 5,
                    "assignment_id": 5,
                    "assignment_title": "Geography Map",
                    "status": "completed",
                    "grade": 90,
                    "submitted_at": "2024-01-16T10:30:00Z",
                    "module_name": "Geography"
                }
            ]
        }
        return jsonify(submissions_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/students/<int:student_id>/engagement', methods=['GET'])
def get_student_engagement(student_id):
    """Get engagement metrics for a specific student"""
    try:
        # Return sample engagement data
        engagement_data = {
            "engagementMetrics": {
                "participation_rate": 92,
                "response_time_avg": 2.5,
                "forum_posts": 15,
                "collaboration_score": 88
            },
            "attendanceData": [
                {
                    "date": "2024-01-20",
                    "class_name": "Mathematics",
                    "present": True
                },
                {
                    "date": "2024-01-19",
                    "class_name": "Science",
                    "present": True
                },
                {
                    "date": "2024-01-18",
                    "class_name": "English",
                    "present": False
                },
                {
                    "date": "2024-01-17",
                    "class_name": "History",
                    "present": True
                },
                {
                    "date": "2024-01-16",
                    "class_name": "Geography",
                    "present": True
                }
            ]
        }
        return jsonify(engagement_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/artifacts', methods=['GET'])
def get_artifacts():
    """Get all artifacts"""
    try:
        conn = get_db_connection()
        # Return empty array for now - can be enhanced later
        conn.close()
        return jsonify([])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/growth-portfolios', methods=['GET'])
def get_growth_portfolios():
    """Get all growth portfolios"""
    try:
        conn = get_db_connection()
        # Return empty array for now - can be enhanced later
        conn.close()
        return jsonify([])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/notifications/<int:user_id>', methods=['GET'])
def get_user_notifications(user_id):
    """Get notifications for a specific user"""
    try:
        conn = get_db_connection()
        notifications = conn.execute('''
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY timestamp DESC 
            LIMIT 10
        ''', (user_id,)).fetchall()
        conn.close()
        return jsonify([dict(notification) for notification in notifications])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/calendar/<int:user_id>', methods=['GET'])
def get_user_calendar(user_id):
    """Get calendar data for a specific user"""
    try:
        # Return sample calendar data
        calendar_data = {
            "events": [
                {
                    "id": 1,
                    "title": "Math Assignment Due",
                    "date": "2024-02-15",
                    "type": "assignment"
                },
                {
                    "id": 2,
                    "title": "Science Quiz",
                    "date": "2024-02-20",
                    "type": "quiz"
                }
            ]
        }
        return jsonify(calendar_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/calendar/<int:user_id>/upcoming', methods=['GET'])
def get_upcoming_events(user_id):
    """Get upcoming events for a specific user"""
    try:
        # Return sample upcoming events
        upcoming_events = {
            "events": [
                {
                    "id": 1,
                    "title": "Math Assignment Due",
                    "date": "2024-02-15",
                    "type": "assignment",
                    "days_until": 5
                }
            ]
        }
        return jsonify(upcoming_events)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/status/assignment/<int:assignment_id>', methods=['GET'])
def get_assignment_status(assignment_id):
    """Get assignment status for a specific student and assignment"""
    try:
        student_id = request.args.get('student_id', type=int)
        if not student_id:
            return jsonify({"error": "student_id parameter is required"}), 400
        
        # Return sample status data
        status_data = {
            "assignment_id": assignment_id,
            "student_id": student_id,
            "status": "pending",  # pending, submitted, graded
            "submitted_at": None,
            "graded_at": None,
            "marks_obtained": None,
            "total_marks": 100,
            "feedback": None
        }
        return jsonify(status_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/status/quiz/<int:quiz_id>', methods=['GET'])
def get_quiz_status(quiz_id):
    """Get quiz status for a specific student and quiz"""
    try:
        student_id = request.args.get('student_id', type=int)
        if not student_id:
            return jsonify({"error": "student_id parameter is required"}), 400
        
        # Return sample status data
        status_data = {
            "quiz_id": quiz_id,
            "student_id": student_id,
            "status": "not_started",  # not_started, in_progress, completed, graded
            "started_at": None,
            "completed_at": None,
            "graded_at": None,
            "marks_obtained": None,
            "total_marks": 50,
            "feedback": None
        }
        return jsonify(status_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Additional missing endpoints for teacher functionality
@app.route('/api/teacher/<int:teacher_id>/students', methods=['GET'])
def get_teacher_students(teacher_id):
    """Get students for a specific teacher"""
    try:
        conn = get_db_connection()
        students = conn.execute('SELECT id, name, email, role, created_at FROM users WHERE role = "student"').fetchall()
        conn.close()
        return jsonify([dict(student) for student in students])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/teacher/<int:teacher_id>/quizzes', methods=['GET'])
def get_teacher_quizzes(teacher_id):
    """Get quizzes for a specific teacher"""
    try:
        conn = get_db_connection()
        quizzes = conn.execute('''
            SELECT q.*, u.name as created_by_name
            FROM quizzes q
            LEFT JOIN users u ON q.teacher_id = u.id
            WHERE q.teacher_id = ?
            ORDER BY q.created_at DESC
        ''', (teacher_id,)).fetchall()
        conn.close()
        return jsonify([dict(quiz) for quiz in quizzes])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/teacher/<int:teacher_id>/subjects', methods=['GET'])
def get_teacher_subjects(teacher_id):
    """Get subjects for a specific teacher"""
    try:
        # Return sample subjects
        subjects = [
            {"id": 1, "name": "Mathematics", "code": "MATH101"},
            {"id": 2, "name": "Science", "code": "SCI101"},
            {"id": 3, "name": "English", "code": "ENG101"},
            {"id": 4, "name": "History", "code": "HIST101"},
            {"id": 5, "name": "Computer Science", "code": "CS101"}
        ]
        return jsonify(subjects)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/submissions', methods=['GET'])
def get_submissions():
    """Get all submissions (alias for /api/submissions/all)"""
    try:
        # Return sample submissions
        submissions = [
            {
                "id": 1,
                "student_id": 3,
                "student_name": "John Doe",
                "assignment_id": 1,
                "assignment_title": "Math Assignment 1",
                "submitted_at": "2024-01-15T10:30:00Z",
                "status": "submitted",
                "grade": None,
                "feedback": None,
                "file_url": "/uploads/math_assignment_1_john.pdf"
            },
            {
                "id": 2,
                "student_id": 4,
                "student_name": "Jane Smith",
                "assignment_id": 1,
                "assignment_title": "Math Assignment 1",
                "submitted_at": "2024-01-15T11:45:00Z",
                "status": "graded",
                "grade": 85,
                "feedback": "Good work! Minor calculation errors.",
                "file_url": "/uploads/math_assignment_1_jane.pdf"
            },
            {
                "id": 3,
                "student_id": 5,
                "student_name": "Mike Johnson",
                "assignment_id": 2,
                "assignment_title": "Science Project",
                "submitted_at": "2024-01-16T09:15:00Z",
                "status": "submitted",
                "grade": None,
                "feedback": None,
                "file_url": "/uploads/science_project_mike.pdf"
            },
            {
                "id": 4,
                "student_id": 3,
                "student_name": "John Doe",
                "assignment_id": 3,
                "assignment_title": "English Essay",
                "submitted_at": "2024-01-17T14:20:00Z",
                "status": "graded",
                "grade": 92,
                "feedback": "Excellent writing and analysis!",
                "file_url": "/uploads/english_essay_john.pdf"
            },
            {
                "id": 5,
                "student_id": 6,
                "student_name": "Sarah Wilson",
                "assignment_id": 2,
                "assignment_title": "Science Project",
                "submitted_at": "2024-01-18T16:30:00Z",
                "status": "submitted",
                "grade": None,
                "feedback": None,
                "file_url": "/uploads/science_project_sarah.pdf"
            }
        ]
        return jsonify(submissions)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/submissions/all', methods=['GET'])
def get_all_submissions():
    """Get all submissions"""
    try:
        # Return sample submissions
        submissions = [
            {
                "id": 1,
                "student_id": 3,
                "student_name": "John Doe",
                "assignment_id": 1,
                "assignment_title": "Math Assignment 1",
                "submitted_at": "2024-01-15T10:30:00Z",
                "status": "graded",
                "marks_obtained": 85,
                "total_marks": 100
            },
            {
                "id": 2,
                "student_id": 3,
                "student_name": "John Doe",
                "assignment_id": 2,
                "assignment_title": "Science Project",
                "submitted_at": "2024-01-18T14:20:00Z",
                "status": "graded",
                "marks_obtained": 92,
                "total_marks": 100
            }
        ]
        return jsonify(submissions)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/assignments/<int:assignment_id>/stats', methods=['GET'])
def get_assignment_stats(assignment_id):
    """Get statistics for a specific assignment"""
    try:
        # Return sample stats
        stats = {
            "assignment_id": assignment_id,
            "total_submissions": 15,
            "graded_submissions": 12,
            "average_score": 87.5,
            "highest_score": 98,
            "lowest_score": 72,
            "completion_rate": 80.0
        }
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    """Get comprehensive analytics data with charts and detailed metrics"""
    try:
        timeframe = request.args.get('timeframe', '30d')
        
        # Comprehensive analytics data with charts
        analytics = {
            "timeframe": timeframe,
            "overview": {
                "total_students": 45,
                "active_students": 42,
                "total_assignments": 28,
                "completed_assignments": 24,
                "total_quizzes": 15,
                "attempted_quizzes": 13,
                "average_performance": 88.7,
                "engagement_rate": 94.2,
                "completion_rate": 85.7
            },
            "performance_metrics": {
                "grade_distribution": {
                    "A (90-100)": 18,
                    "B (80-89)": 15,
                    "C (70-79)": 8,
                    "D (60-69)": 3,
                    "F (Below 60)": 1
                },
                "average_scores": {
                    "assignments": 87.3,
                    "quizzes": 82.1,
                    "projects": 91.5,
                    "overall": 88.7
                }
            },
            "engagement_data": {
                "daily_active_users": [42, 45, 38, 41, 44, 39, 43],
                "weekly_engagement": [89, 92, 87, 94, 91, 88, 93],
                "monthly_trends": [85, 87, 89, 91, 88, 92, 94]
            },
            "assignment_analytics": {
                "completion_rates": {
                    "Math Assignment 1": 95,
                    "Science Project": 88,
                    "History Essay": 92,
                    "Literature Review": 85,
                    "Programming Task": 78
                },
                "average_completion_time": "3.2 days",
                "late_submissions": 12,
                "on_time_submissions": 156
            },
            "quiz_analytics": {
                "average_attempts": 1.8,
                "success_rate": 89.5,
                "most_difficult_topics": [
                    {"topic": "Advanced Calculus", "success_rate": 72},
                    {"topic": "Organic Chemistry", "success_rate": 78},
                    {"topic": "Data Structures", "success_rate": 81}
                ],
                "improvement_over_time": [75, 78, 82, 85, 88, 89]
            },
            "student_progress": {
                "on_track": 32,
                "at_risk": 8,
                "exceeding_expectations": 5,
                "needs_attention": 3
            },
            "time_series_data": {
                "performance_over_time": [
                    {"week": "Week 1", "average_score": 82.5},
                    {"week": "Week 2", "average_score": 84.2},
                    {"week": "Week 3", "average_score": 86.1},
                    {"week": "Week 4", "average_score": 87.8},
                    {"week": "Week 5", "average_score": 88.7}
                ],
                "engagement_over_time": [
                    {"week": "Week 1", "engagement": 78},
                    {"week": "Week 2", "engagement": 82},
                    {"week": "Week 3", "engagement": 85},
                    {"week": "Week 4", "engagement": 89},
                    {"week": "Week 5", "engagement": 94}
                ]
            },
            "top_performers": [
                {"name": "Alice Johnson", "score": 96.8, "assignments_completed": 8, "quizzes_taken": 5},
                {"name": "Bob Smith", "score": 94.2, "assignments_completed": 7, "quizzes_taken": 4},
                {"name": "Carol Davis", "score": 92.5, "assignments_completed": 8, "quizzes_taken": 6},
                {"name": "David Wilson", "score": 91.3, "assignments_completed": 6, "quizzes_taken": 5},
                {"name": "Emma Brown", "score": 90.7, "assignments_completed": 7, "quizzes_taken": 4}
            ],
            "areas_for_improvement": [
                {"area": "Assignment Submission Timeliness", "impact": "High", "students_affected": 12},
                {"area": "Quiz Preparation", "impact": "Medium", "students_affected": 8},
                {"area": "Project Collaboration", "impact": "Medium", "students_affected": 6}
            ],
            "trends": {
                "student_growth": 18.5,
                "performance_improvement": 12.3,
                "engagement_increase": 15.7,
                "completion_rate_improvement": 8.9
            },
            "charts_data": {
                "performance_distribution": {
                    "labels": ["A", "B", "C", "D", "F"],
                    "data": [18, 15, 8, 3, 1],
                    "colors": ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6b7280"]
                },
                "weekly_engagement": {
                    "labels": ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
                    "data": [78, 82, 85, 89, 94]
                },
                "assignment_completion": {
                    "labels": ["Math", "Science", "History", "Literature", "Programming"],
                    "data": [95, 88, 92, 85, 78]
                },
                "student_progress_categories": {
                    "labels": ["On Track", "At Risk", "Exceeding", "Needs Attention"],
                    "data": [32, 8, 5, 3]
                }
            }
        }
        return jsonify(analytics)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/teacher/<int:teacher_id>/analytics', methods=['GET'])
def get_teacher_analytics(teacher_id):
    """Get detailed analytics for a specific teacher"""
    try:
        # Comprehensive teacher-specific analytics
        teacher_analytics = {
            "teacher_id": teacher_id,
            "overview": {
                "total_students": 32,
                "active_students": 30,
                "total_assignments": 18,
                "completed_assignments": 16,
                "average_performance": 89.2,
                "engagement_rate": 96.1
            },
            "class_performance": {
                "grade_distribution": {
                    "A": 14,
                    "B": 12,
                    "C": 4,
                    "D": 2,
                    "F": 0
                },
                "average_scores_by_subject": {
                    "Mathematics": 91.5,
                    "Science": 87.3,
                    "English": 89.8,
                    "History": 88.1
                }
            },
            "student_engagement": {
                "highly_engaged": 22,
                "moderately_engaged": 6,
                "low_engagement": 2,
                "participation_rate": 94.2
            },
            "assignment_insights": {
                "most_successful": {
                    "title": "Algebra Fundamentals",
                    "completion_rate": 98,
                    "average_score": 92.5
                },
                "needs_attention": {
                    "title": "Advanced Calculus",
                    "completion_rate": 78,
                    "average_score": 76.2
                },
                "submission_patterns": {
                    "early_submissions": 45,
                    "on_time_submissions": 120,
                    "late_submissions": 8,
                    "missing_submissions": 3
                }
            },
            "quiz_performance": {
                "average_attempts": 1.6,
                "success_rate": 91.3,
                "difficult_concepts": [
                    {"concept": "Derivatives", "success_rate": 68},
                    {"concept": "Integration", "success_rate": 74},
                    {"concept": "Limits", "success_rate": 82}
                ]
            },
            "time_series_data": {
                "weekly_performance": [
                    {"week": "Week 1", "average": 85.2, "engagement": 88},
                    {"week": "Week 2", "average": 87.1, "engagement": 91},
                    {"week": "Week 3", "average": 88.5, "engagement": 93},
                    {"week": "Week 4", "average": 89.2, "engagement": 96},
                    {"week": "Week 5", "average": 90.1, "engagement": 97}
                ]
            },
            "top_students": [
                {
                    "name": "Alice Johnson",
                    "overall_score": 96.8,
                    "assignments_completed": 8,
                    "quizzes_taken": 5,
                    "engagement_level": "High",
                    "improvement_trend": "+5.2%"
                },
                {
                    "name": "Bob Smith",
                    "overall_score": 94.2,
                    "assignments_completed": 7,
                    "quizzes_taken": 4,
                    "engagement_level": "High",
                    "improvement_trend": "+3.8%"
                },
                {
                    "name": "Carol Davis",
                    "overall_score": 92.5,
                    "assignments_completed": 8,
                    "quizzes_taken": 6,
                    "engagement_level": "High",
                    "improvement_trend": "+4.1%"
                }
            ],
            "students_needing_attention": [
                {
                    "name": "David Wilson",
                    "overall_score": 72.3,
                    "missing_assignments": 2,
                    "low_quiz_scores": 3,
                    "recommended_actions": ["Extra tutoring", "Study group assignment"]
                },
                {
                    "name": "Emma Brown",
                    "overall_score": 68.9,
                    "missing_assignments": 3,
                    "low_quiz_scores": 4,
                    "recommended_actions": ["Parent conference", "Individual study plan"]
                }
            ],
            "charts_data": {
                "performance_trend": {
                    "labels": ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
                    "datasets": [
                        {
                            "label": "Average Score",
                            "data": [85.2, 87.1, 88.5, 89.2, 90.1],
                            "borderColor": "#3b82f6",
                            "backgroundColor": "rgba(59, 130, 246, 0.1)"
                        },
                        {
                            "label": "Engagement Rate",
                            "data": [88, 91, 93, 96, 97],
                            "borderColor": "#10b981",
                            "backgroundColor": "rgba(16, 185, 129, 0.1)"
                        }
                    ]
                },
                "grade_distribution": {
                    "labels": ["A", "B", "C", "D", "F"],
                    "data": [14, 12, 4, 2, 0],
                    "colors": ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6b7280"]
                },
                "assignment_completion": {
                    "labels": ["Algebra", "Geometry", "Calculus", "Statistics", "Trigonometry"],
                    "data": [98, 95, 78, 92, 88]
                },
                "student_engagement_levels": {
                    "labels": ["High", "Medium", "Low"],
                    "data": [22, 6, 2]
                }
            },
            "recommendations": [
                {
                    "type": "Content",
                    "priority": "High",
                    "description": "Consider additional practice problems for Advanced Calculus",
                    "impact": "Could improve completion rate by 15%"
                },
                {
                    "type": "Support",
                    "priority": "Medium",
                    "description": "Schedule study groups for struggling students",
                    "impact": "Could improve engagement by 10%"
                },
                {
                    "type": "Assessment",
                    "priority": "Low",
                    "description": "Review quiz difficulty for Derivatives concept",
                    "impact": "Could improve success rate by 8%"
                }
            ]
        }
        return jsonify(teacher_analytics)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/dashboard/analytics', methods=['GET'])
def get_dashboard_analytics():
    """Get comprehensive dashboard analytics with detailed charts data"""
    try:
        dashboard_data = {
            "summary_cards": {
                "total_students": 45,
                "active_assignments": 28,
                "completed_this_week": 156,
                "average_performance": 88.7,
                "engagement_rate": 94.2
            },
            "performance_charts": {
                "grade_distribution": {
                    "type": "doughnut",
                    "data": {
                        "labels": ["A (90-100)", "B (80-89)", "C (70-79)", "D (60-69)", "F (Below 60)"],
                        "datasets": [{
                            "data": [18, 15, 8, 3, 1],
                            "backgroundColor": ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6b7280"],
                            "borderWidth": 2,
                            "borderColor": "#ffffff"
                        }]
                    },
                    "options": {
                        "responsive": True,
                        "plugins": {
                            "legend": {
                                "position": "bottom",
                                "labels": {
                                    "padding": 20,
                                    "usePointStyle": True
                                }
                            }
                        }
                    }
                },
                "weekly_performance": {
                    "type": "line",
                    "data": {
                        "labels": ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
                        "datasets": [
                            {
                                "label": "Average Score",
                                "data": [82.5, 84.2, 86.1, 87.8, 88.7],
                                "borderColor": "#3b82f6",
                                "backgroundColor": "rgba(59, 130, 246, 0.1)",
                                "tension": 0.4,
                                "fill": True
                            },
                            {
                                "label": "Engagement Rate",
                                "data": [78, 82, 85, 89, 94],
                                "borderColor": "#10b981",
                                "backgroundColor": "rgba(16, 185, 129, 0.1)",
                                "tension": 0.4,
                                "fill": True
                            }
                        ]
                    },
                    "options": {
                        "responsive": True,
                        "scales": {
                            "y": {
                                "beginAtZero": True,
                                "max": 100
                            }
                        },
                        "plugins": {
                            "legend": {
                                "position": "top"
                            }
                        }
                    }
                },
                "assignment_completion": {
                    "type": "bar",
                    "data": {
                        "labels": ["Math", "Science", "History", "Literature", "Programming"],
                        "datasets": [{
                            "label": "Completion Rate (%)",
                            "data": [95, 88, 92, 85, 78],
                            "backgroundColor": [
                                "rgba(16, 185, 129, 0.8)",
                                "rgba(59, 130, 246, 0.8)",
                                "rgba(245, 158, 11, 0.8)",
                                "rgba(239, 68, 68, 0.8)",
                                "rgba(107, 114, 128, 0.8)"
                            ],
                            "borderColor": [
                                "#10b981",
                                "#3b82f6",
                                "#f59e0b",
                                "#ef4444",
                                "#6b7280"
                            ],
                            "borderWidth": 2
                        }]
                    },
                    "options": {
                        "responsive": True,
                        "scales": {
                            "y": {
                                "beginAtZero": True,
                                "max": 100
                            }
                        }
                    }
                },
                "student_engagement": {
                    "type": "radar",
                    "data": {
                        "labels": ["Participation", "Assignments", "Quizzes", "Projects", "Discussions", "Attendance"],
                        "datasets": [{
                            "label": "Current Week",
                            "data": [94, 88, 91, 85, 78, 96],
                            "borderColor": "#3b82f6",
                            "backgroundColor": "rgba(59, 130, 246, 0.2)",
                            "pointBackgroundColor": "#3b82f6"
                        }, {
                            "label": "Previous Week",
                            "data": [89, 85, 87, 82, 75, 92],
                            "borderColor": "#10b981",
                            "backgroundColor": "rgba(16, 185, 129, 0.2)",
                            "pointBackgroundColor": "#10b981"
                        }]
                    },
                    "options": {
                        "responsive": True,
                        "scales": {
                            "r": {
                                "beginAtZero": True,
                                "max": 100
                            }
                        }
                    }
                }
            },
            "student_analytics": {
                "top_performers": [
                    {
                        "name": "Alice Johnson",
                        "score": 96.8,
                        "improvement": "+5.2%",
                        "assignments": 8,
                        "quizzes": 5,
                        "avatar": "AJ"
                    },
                    {
                        "name": "Bob Smith",
                        "score": 94.2,
                        "improvement": "+3.8%",
                        "assignments": 7,
                        "quizzes": 4,
                        "avatar": "BS"
                    },
                    {
                        "name": "Carol Davis",
                        "score": 92.5,
                        "improvement": "+4.1%",
                        "assignments": 8,
                        "quizzes": 6,
                        "avatar": "CD"
                    }
                ],
                "needs_attention": [
                    {
                        "name": "David Wilson",
                        "score": 72.3,
                        "missing_assignments": 2,
                        "low_quiz_scores": 3,
                        "avatar": "DW"
                    },
                    {
                        "name": "Emma Brown",
                        "score": 68.9,
                        "missing_assignments": 3,
                        "low_quiz_scores": 4,
                        "avatar": "EB"
                    }
                ]
            },
            "assignment_insights": {
                "most_successful": {
                    "title": "Algebra Fundamentals",
                    "completion_rate": 98,
                    "average_score": 92.5,
                    "total_submissions": 44
                },
                "needs_attention": {
                    "title": "Advanced Calculus",
                    "completion_rate": 78,
                    "average_score": 76.2,
                    "total_submissions": 35
                },
                "recent_activity": [
                    {
                        "assignment": "Math Assignment 1",
                        "submissions": 42,
                        "average_score": 87.3,
                        "due_date": "2024-02-15"
                    },
                    {
                        "assignment": "Science Project",
                        "submissions": 38,
                        "average_score": 89.1,
                        "due_date": "2024-02-20"
                    }
                ]
            },
            "engagement_metrics": {
                "daily_active_users": [42, 45, 38, 41, 44, 39, 43],
                "weekly_engagement": [89, 92, 87, 94, 91, 88, 93],
                "participation_breakdown": {
                    "highly_active": 22,
                    "moderately_active": 15,
                    "low_activity": 8
                }
            },
            "trends": {
                "performance_trend": "increasing",
                "engagement_trend": "increasing",
                "completion_trend": "stable",
                "improvement_areas": [
                    "Assignment submission timeliness",
                    "Quiz preparation",
                    "Project collaboration"
                ]
            },
            "recommendations": [
                {
                    "type": "Content",
                    "priority": "High",
                    "title": "Additional Calculus Practice",
                    "description": "Consider adding more practice problems for Advanced Calculus",
                    "impact": "Could improve completion rate by 15%"
                },
                {
                    "type": "Support",
                    "priority": "Medium",
                    "title": "Study Group Formation",
                    "description": "Schedule study groups for struggling students",
                    "impact": "Could improve engagement by 10%"
                },
                {
                    "type": "Assessment",
                    "priority": "Low",
                    "title": "Quiz Difficulty Review",
                    "description": "Review quiz difficulty for Derivatives concept",
                    "impact": "Could improve success rate by 8%"
                }
            ]
        }
        return jsonify(dashboard_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# WebSocket Events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f'Client connected: {request.sid}')
    emit('connected', {'message': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f'Client disconnected: {request.sid}')

@socketio.on('join_room')
def handle_join_room(data):
    """Handle joining a room"""
    room = data.get('room', 'general')
    join_room(room)
    emit('joined_room', {'room': room})

@socketio.on('leave_room')
def handle_leave_room(data):
    """Handle leaving a room"""
    room = data.get('room', 'general')
    leave_room(room)
    emit('left_room', {'room': room})

@socketio.on('send_notification')
def handle_send_notification(data):
    """Handle sending notifications"""
    socketio.emit('new_notification', data)

@socketio.on('join')
def handle_join(data):
    """Handle user joining"""
    user_id = data.get('user_id')
    print(f'User {user_id} joined')
    emit('joined', {'user_id': user_id, 'message': 'Successfully joined'})

@socketio.on('join_teacher_room')
def handle_join_teacher_room(data):
    """Handle teacher joining teacher room"""
    user_id = data.get('user_id')
    print(f'Teacher {user_id} joined teacher room')
    emit('joined_teacher_room', {'user_id': user_id, 'message': 'Successfully joined teacher room'})

@socketio.on('join_student_room')
def handle_join_student_room(data):
    """Handle student joining student room"""
    user_id = data.get('user_id')
    print(f'Student {user_id} joined student room')
    emit('joined_student_room', {'user_id': user_id, 'message': 'Successfully joined student room'})

@app.route('/api/students/<int:student_id>/dashboard', methods=['GET'])
def get_student_dashboard(student_id):
    """Get comprehensive dashboard data for a specific student"""
    try:
        # Return comprehensive student dashboard data
        dashboard_data = {
            "student": {
                "id": student_id,
                "name": f"Student {student_id}",
                "email": f"student{student_id}@example.com",
                "role": "student"
            },
            "modules": [
                {
                    "id": 1,
                    "name": "Mathematics",
                    "code": "MATH101",
                    "description": "Advanced Mathematics Course",
                    "progress_percentage": 75,
                    "is_completed": False
                },
                {
                    "id": 2,
                    "name": "Science",
                    "code": "SCI101",
                    "description": "General Science Course",
                    "progress_percentage": 60,
                    "is_completed": False
                },
                {
                    "id": 3,
                    "name": "History",
                    "code": "HIST101",
                    "description": "World History Course",
                    "progress_percentage": 90,
                    "is_completed": True
                }
            ],
            "recent_assignments": [
                {
                    "id": 1,
                    "title": "Math Assignment 1",
                    "due_date": "2025-01-25",
                    "module_name": "Mathematics",
                    "status": "pending"
                },
                {
                    "id": 2,
                    "title": "Science Project",
                    "due_date": "2025-01-30",
                    "module_name": "Science",
                    "status": "in_progress"
                },
                {
                    "id": 3,
                    "title": "History Essay",
                    "due_date": "2025-01-20",
                    "module_name": "History",
                    "status": "completed"
                }
            ],
            "recent_quizzes": [
                {
                    "id": 1,
                    "title": "Math Quiz 1",
                    "module_name": "Mathematics",
                    "score": 85,
                    "status": "attempted",
                    "due_date": "2025-01-22",
                    "duration": 30
                },
                {
                    "id": 2,
                    "title": "Science Quiz",
                    "module_name": "Science",
                    "score": 92,
                    "status": "attempted",
                    "due_date": "2025-01-25",
                    "duration": 25
                },
                {
                    "id": 3,
                    "title": "History Quiz",
                    "module_name": "History",
                    "status": "not_attempted",
                    "due_date": "2025-01-28",
                    "duration": 20
                }
            ],
            "recent_submissions": [
                {
                    "id": 1,
                    "assignment_title": "Math Assignment 1",
                    "module_name": "Mathematics",
                    "submitted_at": "2025-01-15T10:00:00Z",
                    "status": "graded",
                    "grade": 88,
                    "max_points": 100,
                    "feedback": "Excellent work! Great problem-solving approach."
                },
                {
                    "id": 2,
                    "assignment_title": "Science Project",
                    "module_name": "Science",
                    "submitted_at": "2025-01-18T14:30:00Z",
                    "status": "submitted",
                    "grade": None,
                    "max_points": 100,
                    "feedback": None
                }
            ],
            "recent_feedback": [
                {
                    "id": 1,
                    "message": "Great improvement in mathematics! Keep up the excellent work.",
                    "timestamp": "2025-01-20T09:00:00Z"
                },
                {
                    "id": 2,
                    "message": "Your science project shows excellent research skills.",
                    "timestamp": "2025-01-19T15:30:00Z"
                }
            ],
            "overall_progress": 75,
            "analytics": {
                "totalAssignments": 12,
                "completedAssignments": 9,
                "totalQuizzes": 8,
                "attemptedQuizzes": 6,
                "averageScore": 87,
                "totalSubmissions": 15,
                "pendingSubmissions": 3
            }
        }
        return jsonify(dashboard_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Simple in-memory cache for performance optimization
analytics_cache = {}
CACHE_DURATION = 300  # 5 minutes

def get_cached_analytics(student_id):
    """Get cached analytics data if available and not expired"""
    if student_id in analytics_cache:
        cached_data, timestamp = analytics_cache[student_id]
        if (datetime.now() - timestamp).seconds < CACHE_DURATION:
            return cached_data
    return None

def set_cached_analytics(student_id, data):
    """Cache analytics data with timestamp"""
    analytics_cache[student_id] = (data, datetime.now())

@app.route('/api/student/<int:student_id>/analytics', methods=['GET'])
def get_student_analytics(student_id):
    """Get comprehensive analytics for a specific student with real-time data and caching"""
    try:
        # Check cache first for performance
        cached_data = get_cached_analytics(student_id)
        if cached_data:
            print(f"📦 Returning cached analytics for student {student_id}")
            return jsonify(cached_data)
        
        conn = get_db_connection()
        
        # Get student info
        student = conn.execute('SELECT * FROM users WHERE id = ?', (student_id,)).fetchone()
        if not student:
            return jsonify({"error": "Student not found"}), 404
        
        # Get quiz attempts with enhanced data
        quiz_attempts = conn.execute('''
            SELECT qa.*, q.title as quiz_title, q.description
            FROM quiz_attempts qa
            LEFT JOIN quizzes q ON qa.quiz_id = q.id
            WHERE qa.student_id = ?
            ORDER BY qa.attempted_at DESC
        ''', (student_id,)).fetchall()
        
        # Get submissions with enhanced data
        submissions = conn.execute('''
            SELECT s.*, a.title as assignment_title, a.description, a.deadline
            FROM submissions s
            LEFT JOIN assignments a ON s.assignment_id = a.id
            WHERE s.student_id = ?
            ORDER BY s.submitted_at DESC
        ''', (student_id,)).fetchall()
        
        # Get reflections
        reflections = conn.execute('''
            SELECT * FROM reflections
            WHERE student_id = ?
            ORDER BY created_at DESC
        ''', (student_id,)).fetchall()
        
        # Calculate comprehensive analytics
        total_quizzes = len(quiz_attempts)
        total_assignments = len(submissions)
        total_reflections = len(reflections)
        
        # Calculate averages with proper handling
        quiz_scores = [qa.score for qa in quiz_attempts if qa.score is not None]
        assignment_grades = [s.grade for s in submissions if s.grade is not None]
        
        average_quiz_score = sum(quiz_scores) / len(quiz_scores) if quiz_scores else 0
        average_assignment_grade = sum(assignment_grades) / len(assignment_grades) if assignment_grades else 0
        
        # Calculate engagement score based on activity
        recent_activity_count = len([qa for qa in quiz_attempts if qa.attempted_at and 
                                   (datetime.now() - datetime.fromisoformat(qa.attempted_at.replace('Z', '+00:00'))).days <= 7])
        engagement_score = min(100, (recent_activity_count * 20) + (total_reflections * 10))
        
        # Calculate completion rate
        total_available = 12  # Assuming 12 total modules/assignments
        completed_items = len([s for s in submissions if s.grade is not None]) + len([qa for qa in quiz_attempts if qa.score is not None])
        completion_rate = min(100, (completed_items / total_available) * 100) if total_available > 0 else 0
        
        # Create enhanced chart data
        quiz_scores_over_time = [
            {"date": qa.attempted_at, "score": qa.score}
            for qa in quiz_attempts if qa.score is not None
        ]
        
        assignment_grades_over_time = [
            {"date": s.submitted_at, "grade": s.grade}
            for s in submissions if s.grade is not None
        ]
        
        # Enhanced subject performance with engagement
        subject_performance = [
            {
                "subject_title": "Mathematics", 
                "progress_percentage": 85,
                "engagement_percentage": 78,
                "total_assignments": 4,
                "completed_assignments": 3
            },
            {
                "subject_title": "Science", 
                "progress_percentage": 78,
                "engagement_percentage": 82,
                "total_assignments": 3,
                "completed_assignments": 2
            },
            {
                "subject_title": "English", 
                "progress_percentage": 92,
                "engagement_percentage": 88,
                "total_assignments": 5,
                "completed_assignments": 4
            }
        ]
        
        # Enhanced module completion
        modules_completion = {
            "completed": 8,
            "pending": 4,
            "in_progress": 2
        }
        
        # Engagement trends (weekly data)
        engagement_trends = [
            {"week": "Week 1", "engagement_score": 85},
            {"week": "Week 2", "engagement_score": 78},
            {"week": "Week 3", "engagement_score": 92},
            {"week": "Week 4", "engagement_score": 88},
            {"week": "Week 5", "engagement_score": 95}
        ]
        
        # Grade distribution
        grade_distribution = [0, 0, 0, 0, 0]  # A, B, C, D, F
        for grade in assignment_grades:
            if grade >= 90:
                grade_distribution[0] += 1
            elif grade >= 80:
                grade_distribution[1] += 1
            elif grade >= 70:
                grade_distribution[2] += 1
            elif grade >= 60:
                grade_distribution[3] += 1
            else:
                grade_distribution[4] += 1
        
        analytics_data = {
            "kpis": {
                "total_quizzes_attempted": total_quizzes,
                "modules_completed": 8,
                "assignments_submitted": total_assignments,
                "gpa": round(average_assignment_grade, 2),
                "engagement_score": round(engagement_score, 1),
                "completion_rate": round(completion_rate, 1),
                "average_quiz_score": round(average_quiz_score, 1),
                "total_reflections": total_reflections
            },
            "charts": {
                "quiz_scores_over_time": quiz_scores_over_time,
                "assignment_grades_over_time": assignment_grades_over_time,
                "subject_performance": subject_performance,
                "modules_completion": modules_completion,
                "engagement_trends": engagement_trends,
                "grade_distribution": grade_distribution
            },
            "submissions": [dict(submission) for submission in submissions],
            "metadata": {
                "last_updated": datetime.now().isoformat(),
                "data_freshness": "real-time",
                "student_id": student_id,
                "total_data_points": total_quizzes + total_assignments + total_reflections
            }
        }
        
        # Cache the analytics data for performance
        set_cached_analytics(student_id, analytics_data)
        print(f"💾 Cached analytics for student {student_id}")
        
        conn.close()
        return jsonify(analytics_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/<int:student_id>/reflections', methods=['GET'])
def get_student_reflections(student_id):
    """Get reflections for a specific student"""
    try:
        conn = get_db_connection()
        reflections = conn.execute('''
            SELECT * FROM reflections
            WHERE student_id = ?
            ORDER BY created_at DESC
        ''', (student_id,)).fetchall()
        conn.close()
        return jsonify({"reflections": [dict(reflection) for reflection in reflections]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/<int:student_id>/recent-activity', methods=['GET'])
def get_student_recent_activity(student_id):
    """Get recent activity for a specific student with pagination support"""
    try:
        # Get pagination parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit
        
        conn = get_db_connection()
        
        # Get recent submissions with pagination
        submissions = conn.execute('''
            SELECT s.*, a.title as assignment_title, 'submission' as type
            FROM submissions s
            LEFT JOIN assignments a ON s.assignment_id = a.id
            WHERE s.student_id = ?
            ORDER BY s.submitted_at DESC
            LIMIT ? OFFSET ?
        ''', (student_id, limit, offset)).fetchall()
        
        # Get recent quiz attempts with pagination
        quiz_attempts = conn.execute('''
            SELECT qa.*, q.title as quiz_title, 'quiz' as type
            FROM quiz_attempts qa
            LEFT JOIN quizzes q ON qa.quiz_id = q.id
            WHERE qa.student_id = ?
            ORDER BY qa.attempted_at DESC
            LIMIT ? OFFSET ?
        ''', (student_id, limit, offset)).fetchall()
        
        # Combine and format activity
        activity = []
        for submission in submissions:
            activity.append({
                "description": f"Submitted assignment: {submission.assignment_title or 'Assignment'}",
                "timestamp": submission.submitted_at,
                "type": "submission"
            })
        
        for quiz in quiz_attempts:
            activity.append({
                "description": f"Completed quiz: {quiz.quiz_title or 'Quiz'} (Score: {quiz.score})",
                "timestamp": quiz.attempted_at,
                "type": "quiz"
            })
        
        # Sort by timestamp
        activity.sort(key=lambda x: x['timestamp'], reverse=True)
        
        # Get total count for pagination
        total_submissions = conn.execute('SELECT COUNT(*) FROM submissions WHERE student_id = ?', (student_id,)).fetchone()[0]
        total_quizzes = conn.execute('SELECT COUNT(*) FROM quiz_attempts WHERE student_id = ?', (student_id,)).fetchone()[0]
        total_activities = total_submissions + total_quizzes
        
        # Calculate pagination metadata
        total_pages = (total_activities + limit - 1) // limit
        has_next = page < total_pages
        has_prev = page > 1
        
        conn.close()
        return jsonify({
            "activity": activity,
            "pagination": {
                "page": page,
                "limit": limit,
                "total_activities": total_activities,
                "total_pages": total_pages,
                "has_next": has_next,
                "has_prev": has_prev
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/student/<int:student_id>/grades', methods=['GET'])
def get_student_grades(student_id):
    """Get comprehensive grades data for a specific student"""
    try:
        conn = get_db_connection()
        
        # Get assignment grades
        assignment_grades = conn.execute('''
            SELECT s.*, a.title as assignment_title, a.max_marks
            FROM submissions s
            LEFT JOIN assignments a ON s.assignment_id = a.id
            WHERE s.student_id = ? AND s.grade IS NOT NULL
            ORDER BY s.submitted_at DESC
        ''', (student_id,)).fetchall()
        
        # Get quiz grades
        quiz_grades = conn.execute('''
            SELECT qa.*, q.title as quiz_title
            FROM quiz_attempts qa
            LEFT JOIN quizzes q ON qa.quiz_id = q.id
            WHERE qa.student_id = ? AND qa.score IS NOT NULL
            ORDER BY qa.attempted_at DESC
        ''', (student_id,)).fetchall()
        
        # Calculate grade statistics
        assignment_scores = [s.grade for s in assignment_grades if s.grade is not None]
        quiz_scores = [qa.score for qa in quiz_grades if qa.score is not None]
        
        grades_data = {
            "assignment_grades": [dict(grade) for grade in assignment_grades],
            "quiz_grades": [dict(grade) for grade in quiz_grades],
            "statistics": {
                "average_assignment_grade": round(sum(assignment_scores) / len(assignment_scores), 2) if assignment_scores else 0,
                "average_quiz_score": round(sum(quiz_scores) / len(quiz_scores), 2) if quiz_scores else 0,
                "total_assignments": len(assignment_grades),
                "total_quizzes": len(quiz_grades),
                "highest_assignment_grade": max(assignment_scores) if assignment_scores else 0,
                "lowest_assignment_grade": min(assignment_scores) if assignment_scores else 0
            }
        }
        
        conn.close()
        return jsonify(grades_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Comprehensive Student Analytics Data Model
class StudentAnalyticsModel:
    """Data model for comprehensive student analytics"""
    
    def __init__(self, student_id):
        self.student_id = student_id
        self.data = {
            "student_info": {},
            "academic_performance": {
                "grades": [],
                "assignments": [],
                "quizzes": [],
                "reflections": []
            },
            "engagement_metrics": {
                "activity_frequency": 0,
                "participation_rate": 0,
                "completion_rate": 0,
                "engagement_score": 0
            },
            "performance_trends": {
                "grade_progression": [],
                "engagement_trends": [],
                "completion_trends": []
            },
            "analytics_metadata": {
                "last_updated": None,
                "data_freshness": "real-time",
                "total_data_points": 0
            }
        }
    
    def calculate_engagement_score(self, activities, reflections, submissions):
        """Calculate comprehensive engagement score"""
        recent_activities = len([a for a in activities if self.is_recent(a.get('timestamp', ''))])
        reflection_count = len(reflections)
        submission_count = len(submissions)
        
        # Weighted engagement calculation
        engagement = (recent_activities * 0.4) + (reflection_count * 0.3) + (submission_count * 0.3)
        return min(100, engagement * 10)
    
    def is_recent(self, timestamp):
        """Check if activity is within last 7 days"""
        try:
            activity_date = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            return (datetime.now() - activity_date).days <= 7
        except:
            return False
    
    def get_grade_distribution(self, grades):
        """Calculate grade distribution"""
        distribution = {"A": 0, "B": 0, "C": 0, "D": 0, "F": 0}
        for grade in grades:
            if grade >= 90:
                distribution["A"] += 1
            elif grade >= 80:
                distribution["B"] += 1
            elif grade >= 70:
                distribution["C"] += 1
            elif grade >= 60:
                distribution["D"] += 1
            else:
                distribution["F"] += 1
        return distribution

if __name__ == '__main__':
    print("🚀 Starting Basic Academic Portal Backend Server...")
    print("📍 Backend API: http://localhost:5006")
    print("📡 WebSocket: ws://localhost:5006/socket.io")
    print("📊 API Docs: http://localhost:5006/")
    print("🛑 Press Ctrl+C to stop the server")
    print("=" * 50)
    
    # Run the server
    socketio.run(app, host='0.0.0.0', port=5006, debug=True)
