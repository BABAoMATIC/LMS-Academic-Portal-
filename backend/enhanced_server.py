#!/usr/bin/env python3
"""
Enhanced Flask Server for Academic Portal
Provides advanced API endpoints, WebSocket support, and real-time features
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import sqlite3
import os
import json
from datetime import datetime
import uuid

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

def init_enhanced_database():
    """Initialize enhanced database with all tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create users table (using existing schema)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER NOT NULL, 
            name VARCHAR(100) NOT NULL, 
            email VARCHAR(120) NOT NULL, 
            password_hash VARCHAR(255) NOT NULL, 
            role VARCHAR(20) NOT NULL, 
            gender VARCHAR(10), 
            phone VARCHAR(20), 
            dob DATE, 
            profile_image VARCHAR(255), 
            bio TEXT, 
            social_links TEXT, 
            created_at DATETIME, 
            updated_at DATETIME, 
            PRIMARY KEY (id), 
            UNIQUE (email)
        )
    ''')
    
    # Create assignments table (using existing schema)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS assignments (
            id INTEGER NOT NULL, 
            teacher_id INTEGER NOT NULL, 
            module_id INTEGER, 
            title VARCHAR(200) NOT NULL, 
            description TEXT, 
            deadline DATETIME NOT NULL, 
            file_path VARCHAR(255), 
            max_marks FLOAT, 
            created_at DATETIME, 
            updated_at DATETIME, 
            PRIMARY KEY (id), 
            FOREIGN KEY(teacher_id) REFERENCES users (id), 
            FOREIGN KEY(module_id) REFERENCES modules (id)
        )
    ''')
    
    # Create submissions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            assignment_id INTEGER,
            student_id INTEGER,
            content TEXT,
            file_path TEXT,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'submitted',
            FOREIGN KEY (assignment_id) REFERENCES assignments (id),
            FOREIGN KEY (student_id) REFERENCES users (id)
        )
    ''')
    
    # Create quizzes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS quizzes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users (id)
        )
    ''')
    
    # Create questions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quiz_id INTEGER,
            question_text TEXT NOT NULL,
            question_type TEXT DEFAULT 'multiple_choice',
            options TEXT,
            correct_answer TEXT,
            points INTEGER DEFAULT 1,
            FOREIGN KEY (quiz_id) REFERENCES quizzes (id)
        )
    ''')
    
    # Create quiz_attempts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS quiz_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quiz_id INTEGER,
            student_id INTEGER,
            score INTEGER,
            total_questions INTEGER,
            attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (quiz_id) REFERENCES quizzes (id),
            FOREIGN KEY (student_id) REFERENCES users (id)
        )
    ''')
    
    # Create notifications table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            message TEXT,
            type TEXT DEFAULT 'info',
            read_status BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create reflections table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reflections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            title TEXT NOT NULL,
            content TEXT,
            learning_outcomes TEXT,
            skills_developed TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users (id)
        )
    ''')
    
    # Create portfolio_evidence table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS portfolio_evidence (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            evidence_type TEXT,
            file_path TEXT,
            skills_tagged TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users (id)
        )
    ''')
    
    # Create skills table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            category TEXT,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create learning_outcomes table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS learning_outcomes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            criteria TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create student_outcome_progress table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS student_outcome_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            outcome_id INTEGER,
            progress_percentage INTEGER DEFAULT 0,
            evidence_count INTEGER DEFAULT 0,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users (id),
            FOREIGN KEY (outcome_id) REFERENCES learning_outcomes (id)
        )
    ''')
    
    # Create portfolio_skills table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS portfolio_skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            portfolio_evidence_id INTEGER,
            skill_id INTEGER,
            proficiency_level TEXT DEFAULT 'beginner',
            FOREIGN KEY (portfolio_evidence_id) REFERENCES portfolio_evidence (id),
            FOREIGN KEY (skill_id) REFERENCES skills (id)
        )
    ''')
    
    # Insert sample data if tables are empty
    cursor.execute('SELECT COUNT(*) FROM users')
    if cursor.fetchone()[0] == 0:
        # Insert sample users
        cursor.execute('''
            INSERT INTO users (name, email, password_hash, role) VALUES
            ('admin', 'admin@example.com', 'hashed_password', 'admin'),
            ('teacher1', 'teacher@example.com', 'hashed_password', 'teacher'),
            ('student1', 'student@example.com', 'hashed_password', 'student')
        ''')
        
        # Insert sample assignments
        cursor.execute('''
            INSERT INTO assignments (title, description, deadline, teacher_id) VALUES
            ('Math Assignment 1', 'Complete exercises 1-10', '2024-02-15 23:59:59', 2),
            ('Science Project', 'Research and present findings', '2024-02-20 23:59:59', 2)
        ''')
        
        # Insert sample quiz
        cursor.execute('''
            INSERT INTO quizzes (title, description, created_by) VALUES
            ('Math Quiz 1', 'Basic arithmetic operations', 2)
        ''')
        
        # Insert sample questions
        cursor.execute('''
            INSERT INTO questions (quiz_id, question_text, question_type, options, correct_answer, points) VALUES
            (1, 'What is 2 + 2?', 'multiple_choice', '["3", "4", "5", "6"]', '4', 1),
            (1, 'What is 5 * 3?', 'multiple_choice', '["12", "15", "18", "20"]', '15', 1)
        ''')
        
        # Insert sample skills
        cursor.execute('''
            INSERT INTO skills (name, category, description) VALUES
            ('Problem Solving', 'Cognitive', 'Ability to analyze and solve complex problems'),
            ('Communication', 'Soft Skills', 'Effective verbal and written communication'),
            ('Critical Thinking', 'Cognitive', 'Analytical and evaluative thinking'),
            ('Teamwork', 'Soft Skills', 'Collaborative work in team environments')
        ''')
        
        # Insert sample learning outcomes
        cursor.execute('''
            INSERT INTO learning_outcomes (title, description, criteria) VALUES
            ('Mathematical Proficiency', 'Demonstrate mathematical problem-solving skills', 'Solve 80% of problems correctly'),
            ('Communication Skills', 'Present ideas clearly and effectively', 'Deliver clear presentations'),
            ('Critical Analysis', 'Analyze information critically', 'Evaluate sources and arguments')
        ''')
        
        # Insert sample reflections
        cursor.execute('''
            INSERT INTO reflections (student_id, title, content, learning_outcomes, skills_developed) VALUES
            (3, 'Math Learning Reflection', 'I learned about quadratic equations today. The concept was challenging but I understand it better now.', 'Mathematical Proficiency', 'Problem Solving, Critical Thinking')
        ''')
        
        # Insert sample portfolio evidence
        cursor.execute('''
            INSERT INTO portfolio_evidence (student_id, title, description, evidence_type, skills_tagged) VALUES
            (3, 'Math Project', 'Completed a comprehensive math project on algebra', 'project', 'Problem Solving, Critical Thinking')
        ''')
    
    conn.commit()
    conn.close()

# Initialize enhanced database on startup
init_enhanced_database()

# API Routes
@app.route('/')
def index():
    """API documentation"""
    return jsonify({
        "message": "Enhanced Academic Portal API",
        "version": "2.0.0",
        "features": [
            "Real-time WebSocket communication",
            "Portfolio evidence tracking",
            "Skills tagging system",
            "Learning outcomes analytics",
            "Reflection journal",
            "Enhanced notifications"
        ],
        "endpoints": {
            "users": "/api/users",
            "assignments": "/api/assignments",
            "submissions": "/api/submissions",
            "quizzes": "/api/quizzes",
            "notifications": "/api/notifications",
            "reflections": "/api/reflections",
            "portfolio": "/api/portfolio",
            "skills": "/api/skills",
            "outcomes": "/api/outcomes"
        }
    })

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users"""
    conn = get_db_connection()
    users = conn.execute('SELECT id, name, email, role, created_at FROM users').fetchall()
    conn.close()
    return jsonify([dict(user) for user in users])

@app.route('/api/assignments', methods=['GET'])
def get_assignments():
    """Get all assignments"""
    conn = get_db_connection()
    assignments = conn.execute('''
        SELECT a.*, u.name as created_by_name 
        FROM assignments a 
        LEFT JOIN users u ON a.teacher_id = u.id 
        ORDER BY a.created_at DESC
    ''').fetchall()
    conn.close()
    return jsonify([dict(assignment) for assignment in assignments])

@app.route('/api/assignments', methods=['POST'])
def create_assignment():
    """Create new assignment"""
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO assignments (title, description, deadline, teacher_id)
        VALUES (?, ?, ?, ?)
    ''', (data['title'], data.get('description', ''), data.get('deadline'), data.get('teacher_id', 1)))
    
    conn.commit()
    assignment_id = cursor.lastrowid
    conn.close()
    
    # Emit real-time notification
    socketio.emit('new_assignment', {
        'id': assignment_id,
        'title': data['title'],
        'message': f'New assignment: {data["title"]}'
    })
    
    return jsonify({"id": assignment_id, "message": "Assignment created successfully"})

@app.route('/api/student/<int:student_id>/submissions', methods=['GET'])
def get_student_submissions(student_id):
    """Get submissions for a specific student"""
    conn = get_db_connection()
    submissions = conn.execute('''
        SELECT s.*, a.title as assignment_title
        FROM submissions s
        LEFT JOIN assignments a ON s.assignment_id = a.id
        WHERE s.student_id = ?
        ORDER BY s.submitted_at DESC
    ''', (student_id,)).fetchall()
    conn.close()
    return jsonify([dict(submission) for submission in submissions])

@app.route('/api/quizzes', methods=['GET'])
def get_quizzes():
    """Get all quizzes"""
    conn = get_db_connection()
    quizzes = conn.execute('''
        SELECT q.*, u.name as created_by_name
        FROM quizzes q
        LEFT JOIN users u ON q.created_by = u.id
        ORDER BY q.created_at DESC
    ''').fetchall()
    conn.close()
    return jsonify([dict(quiz) for quiz in quizzes])

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    """Get all notifications"""
    conn = get_db_connection()
    notifications = conn.execute('''
        SELECT n.*, u.name as user_name
        FROM notifications n
        LEFT JOIN users u ON n.user_id = u.id
        ORDER BY n.created_at DESC
    ''').fetchall()
    conn.close()
    return jsonify([dict(notification) for notification in notifications])

@app.route('/api/reflections', methods=['GET'])
def get_reflections():
    """Get all reflections"""
    conn = get_db_connection()
    reflections = conn.execute('''
        SELECT r.*, u.name as student_name
        FROM reflections r
        LEFT JOIN users u ON r.student_id = u.id
        ORDER BY r.created_at DESC
    ''').fetchall()
    conn.close()
    return jsonify([dict(reflection) for reflection in reflections])

@app.route('/api/reflections', methods=['POST'])
def create_reflection():
    """Create new reflection"""
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
    
    # Emit real-time notification
    socketio.emit('new_reflection', {
        'id': reflection_id,
        'title': data['title'],
        'message': f'New reflection: {data["title"]}'
    })
    
    return jsonify({"id": reflection_id, "message": "Reflection created successfully"})

@app.route('/api/portfolio', methods=['GET'])
def get_portfolio_evidence():
    """Get all portfolio evidence"""
    conn = get_db_connection()
    evidence = conn.execute('''
        SELECT p.*, u.name as student_name
        FROM portfolio_evidence p
        LEFT JOIN users u ON p.student_id = u.id
        ORDER BY p.created_at DESC
    ''').fetchall()
    conn.close()
    return jsonify([dict(item) for item in evidence])

@app.route('/api/portfolio', methods=['POST'])
def create_portfolio_evidence():
    """Create new portfolio evidence"""
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO portfolio_evidence (student_id, title, description, evidence_type, skills_tagged)
        VALUES (?, ?, ?, ?, ?)
    ''', (data.get('student_id', 3), data['title'], data.get('description', ''), 
          data.get('evidence_type', 'project'), data.get('skills_tagged', '')))
    
    conn.commit()
    evidence_id = cursor.lastrowid
    conn.close()
    
    return jsonify({"id": evidence_id, "message": "Portfolio evidence created successfully"})

@app.route('/api/skills', methods=['GET'])
def get_skills():
    """Get all skills"""
    conn = get_db_connection()
    skills = conn.execute('SELECT * FROM skills ORDER BY name').fetchall()
    conn.close()
    return jsonify([dict(skill) for skill in skills])

@app.route('/api/outcomes', methods=['GET'])
def get_learning_outcomes():
    """Get all learning outcomes"""
    conn = get_db_connection()
    outcomes = conn.execute('SELECT * FROM learning_outcomes ORDER BY title').fetchall()
    conn.close()
    return jsonify([dict(outcome) for outcome in outcomes])

# WebSocket Events
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f'Client connected: {request.sid}')
    emit('connected', {'message': 'Connected to enhanced server'})

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
    # Broadcast notification to all clients
    socketio.emit('new_notification', data)

@socketio.on('update_progress')
def handle_update_progress(data):
    """Handle progress updates"""
    # Broadcast progress update to all clients
    socketio.emit('progress_updated', data)

if __name__ == '__main__':
    print("🚀 Starting Enhanced Academic Portal Backend Server...")
    print("📍 Backend API: http://localhost:5006")
    print("📡 WebSocket: ws://localhost:5006/socket.io")
    print("📊 API Docs: http://localhost:5006/")
    print("🎯 Enhanced Features: Portfolio, Skills, Analytics")
    print("🛑 Press Ctrl+C to stop the server")
    print("=" * 50)
    
    # Run the server
    socketio.run(app, host='0.0.0.0', port=5006, debug=True)
