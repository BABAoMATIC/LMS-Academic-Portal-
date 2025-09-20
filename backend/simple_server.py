#!/usr/bin/env python3
"""
Simple Flask Server for Academic Portal
Provides basic API endpoints and WebSocket support
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

def init_database():
    """Initialize database with basic tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create assignments table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            due_date TIMESTAMP,
            created_by INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users (id)
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
    
    # Insert sample data if tables are empty
    cursor.execute('SELECT COUNT(*) FROM users')
    if cursor.fetchone()[0] == 0:
        # Insert sample users
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, role) VALUES
            ('admin', 'admin@example.com', 'hashed_password', 'admin'),
            ('teacher1', 'teacher@example.com', 'hashed_password', 'teacher'),
            ('student1', 'student@example.com', 'hashed_password', 'student')
        ''')
        
        # Insert sample assignments
        cursor.execute('''
            INSERT INTO assignments (title, description, due_date, created_by) VALUES
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
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_database()

# API Routes
@app.route('/')
def index():
    """API documentation"""
    return jsonify({
        "message": "Academic Portal API",
        "version": "1.0.0",
        "endpoints": {
            "users": "/api/users",
            "assignments": "/api/assignments",
            "submissions": "/api/submissions",
            "quizzes": "/api/quizzes",
            "notifications": "/api/notifications",
            "reflections": "/api/reflections"
        }
    })

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users"""
    conn = get_db_connection()
    users = conn.execute('SELECT id, username, email, role, created_at FROM users').fetchall()
    conn.close()
    return jsonify([dict(user) for user in users])

@app.route('/api/assignments', methods=['GET'])
def get_assignments():
    """Get all assignments"""
    conn = get_db_connection()
    assignments = conn.execute('''
        SELECT a.*, u.username as created_by_name 
        FROM assignments a 
        LEFT JOIN users u ON a.created_by = u.id 
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
        INSERT INTO assignments (title, description, due_date, created_by)
        VALUES (?, ?, ?, ?)
    ''', (data['title'], data.get('description', ''), data.get('due_date'), data.get('created_by', 1)))
    
    conn.commit()
    assignment_id = cursor.lastrowid
    conn.close()
    
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
        SELECT q.*, u.username as created_by_name
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
        SELECT n.*, u.username as user_name
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
        SELECT r.*, u.username as student_name
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
    
    return jsonify({"id": reflection_id, "message": "Reflection created successfully"})

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
    # Broadcast notification to all clients
    socketio.emit('new_notification', data)

if __name__ == '__main__':
    print("🚀 Starting Academic Portal Backend Server...")
    print("📍 Backend API: http://localhost:5006")
    print("📡 WebSocket: ws://localhost:5006/socket.io")
    print("📊 API Docs: http://localhost:5006/")
    print("🛑 Press Ctrl+C to stop the server")
    print("=" * 50)
    
    # Run the server
    socketio.run(app, host='0.0.0.0', port=5006, debug=True)
