#!/usr/bin/env python3
"""
Create Enhanced Database Tables
Initializes the database with all required tables and sample data
"""

import sqlite3
import os
from datetime import datetime

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'instance', 'education.db')

def create_enhanced_tables():
    """Create all enhanced database tables"""
    # Ensure instance directory exists
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("🗄️ Creating enhanced database tables...")
    
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
    print("✅ Users table created")
    
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
    print("✅ Assignments table created")
    
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
    print("✅ Submissions table created")
    
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
    print("✅ Quizzes table created")
    
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
    print("✅ Questions table created")
    
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
    print("✅ Quiz attempts table created")
    
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
    print("✅ Notifications table created")
    
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
    print("✅ Reflections table created")
    
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
    print("✅ Portfolio evidence table created")
    
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
    print("✅ Skills table created")
    
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
    print("✅ Learning outcomes table created")
    
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
    print("✅ Student outcome progress table created")
    
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
    print("✅ Portfolio skills table created")
    
    # Insert sample data if tables are empty
    cursor.execute('SELECT COUNT(*) FROM users')
    user_count = cursor.fetchone()[0]
    
    if user_count == 0:
        print("📝 Inserting sample data...")
        
        # Insert sample users
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, role) VALUES
            ('admin', 'admin@example.com', 'hashed_password', 'admin'),
            ('teacher1', 'teacher@example.com', 'hashed_password', 'teacher'),
            ('student1', 'student@example.com', 'hashed_password', 'student')
        ''')
        print("✅ Sample users inserted")
        
        # Insert sample assignments
        cursor.execute('''
            INSERT INTO assignments (title, description, due_date, created_by) VALUES
            ('Math Assignment 1', 'Complete exercises 1-10', '2024-02-15 23:59:59', 2),
            ('Science Project', 'Research and present findings', '2024-02-20 23:59:59', 2),
            ('English Essay', 'Write a 500-word essay on climate change', '2024-02-25 23:59:59', 2)
        ''')
        print("✅ Sample assignments inserted")
        
        # Insert sample quiz
        cursor.execute('''
            INSERT INTO quizzes (title, description, created_by) VALUES
            ('Math Quiz 1', 'Basic arithmetic operations', 2),
            ('Science Quiz 1', 'Basic science concepts', 2)
        ''')
        print("✅ Sample quizzes inserted")
        
        # Insert sample questions
        cursor.execute('''
            INSERT INTO questions (quiz_id, question_text, question_type, options, correct_answer, points) VALUES
            (1, 'What is 2 + 2?', 'multiple_choice', '["3", "4", "5", "6"]', '4', 1),
            (1, 'What is 5 * 3?', 'multiple_choice', '["12", "15", "18", "20"]', '15', 1),
            (2, 'What is the chemical symbol for water?', 'multiple_choice', '["H2O", "CO2", "O2", "H2SO4"]', 'H2O', 1)
        ''')
        print("✅ Sample questions inserted")
        
        # Insert sample skills
        cursor.execute('''
            INSERT INTO skills (name, category, description) VALUES
            ('Problem Solving', 'Cognitive', 'Ability to analyze and solve complex problems'),
            ('Communication', 'Soft Skills', 'Effective verbal and written communication'),
            ('Critical Thinking', 'Cognitive', 'Analytical and evaluative thinking'),
            ('Teamwork', 'Soft Skills', 'Collaborative work in team environments'),
            ('Mathematical Reasoning', 'Academic', 'Logical thinking in mathematical contexts'),
            ('Scientific Method', 'Academic', 'Systematic approach to scientific inquiry')
        ''')
        print("✅ Sample skills inserted")
        
        # Insert sample learning outcomes
        cursor.execute('''
            INSERT INTO learning_outcomes (title, description, criteria) VALUES
            ('Mathematical Proficiency', 'Demonstrate mathematical problem-solving skills', 'Solve 80% of problems correctly'),
            ('Communication Skills', 'Present ideas clearly and effectively', 'Deliver clear presentations'),
            ('Critical Analysis', 'Analyze information critically', 'Evaluate sources and arguments'),
            ('Scientific Understanding', 'Apply scientific concepts and methods', 'Demonstrate understanding of scientific principles')
        ''')
        print("✅ Sample learning outcomes inserted")
        
        # Insert sample reflections
        cursor.execute('''
            INSERT INTO reflections (student_id, title, content, learning_outcomes, skills_developed) VALUES
            (3, 'Math Learning Reflection', 'I learned about quadratic equations today. The concept was challenging but I understand it better now.', 'Mathematical Proficiency', 'Problem Solving, Critical Thinking'),
            (3, 'Science Project Reflection', 'Working on the climate change project helped me understand the scientific method better.', 'Scientific Understanding', 'Critical Thinking, Communication')
        ''')
        print("✅ Sample reflections inserted")
        
        # Insert sample portfolio evidence
        cursor.execute('''
            INSERT INTO portfolio_evidence (student_id, title, description, evidence_type, skills_tagged) VALUES
            (3, 'Math Project', 'Completed a comprehensive math project on algebra', 'project', 'Problem Solving, Critical Thinking, Mathematical Reasoning'),
            (3, 'Science Presentation', 'Presented findings on climate change research', 'presentation', 'Communication, Critical Thinking, Scientific Method')
        ''')
        print("✅ Sample portfolio evidence inserted")
        
        # Insert sample notifications
        cursor.execute('''
            INSERT INTO notifications (user_id, title, message, type) VALUES
            (3, 'New Assignment', 'Math Assignment 1 has been posted', 'info'),
            (3, 'Quiz Available', 'Math Quiz 1 is now available', 'info'),
            (3, 'Feedback Received', 'Your submission has been graded', 'success')
        ''')
        print("✅ Sample notifications inserted")
    
    conn.commit()
    conn.close()
    print("🎉 Enhanced database setup completed successfully!")

if __name__ == '__main__':
    create_enhanced_tables()
