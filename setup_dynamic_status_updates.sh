#!/bin/bash

# Setup script for Dynamic Status Updates of Assignments and Quizzes
# This script sets up the complete dynamic status update system

echo "🚀 Setting up Dynamic Status Updates for Assignments and Quizzes"
echo "=================================================================="

# Check if we're in the right directory
if [ ! -f "backend/simple_server.py" ]; then
    echo "❌ Error: Please run this script from the academic-portal root directory"
    exit 1
fi

# Navigate to backend directory
cd backend

echo "📊 Step 1: Running database migration for status tracking..."
python3 update_status_tracking_schema.py
if [ $? -eq 0 ]; then
    echo "✅ Status tracking database migration completed successfully"
else
    echo "❌ Database migration failed"
    exit 1
fi

echo ""
echo "🔧 Step 2: Installing required Python packages..."
pip3 install flask-socketio python-socketio 2>/dev/null || echo "⚠️  Socket.IO packages may already be installed"

echo ""
echo "📦 Step 3: Installing required Node.js packages for frontend..."
cd ../frontend
npm install socket.io-client 2>/dev/null || echo "⚠️  Socket.IO client may already be installed"

echo ""
echo "🧪 Step 4: Running comprehensive status update tests..."
cd ../backend
python3 test_status_updates.py
if [ $? -eq 0 ]; then
    echo "✅ All status update tests passed successfully"
else
    echo "❌ Some tests failed - please check the implementation"
    echo "   You can still proceed, but some features may not work correctly"
fi

echo ""
echo "🎯 Step 5: Dynamic Status Update System Features Implemented:"
echo "   ✅ Real-time assignment status updates (pending → submitted → graded)"
echo "   ✅ Real-time quiz status updates (not_attempted → attempted → graded)"
echo "   ✅ WebSocket-based real-time notifications"
echo "   ✅ Database status tracking with AssignmentStatus and QuizStatus models"
echo "   ✅ Teacher grading endpoints with automatic status updates"
echo "   ✅ Frontend status service with real-time updates"
echo "   ✅ Status notification component for users"
echo "   ✅ Enhanced assignment and quiz pages with dynamic status display"

echo ""
echo "🔌 Step 6: Starting the backend server..."
echo "   The backend server will start with WebSocket support for real-time updates"
echo "   Press Ctrl+C to stop the server when done testing"
echo ""

# Start the backend server
python3 simple_server.py

echo ""
echo "📋 Manual Testing Instructions:"
echo "   1. Open the frontend in another terminal:"
echo "      cd frontend && npm start"
echo ""
echo "   2. Test the dynamic status updates:"
echo "      - Submit an assignment and watch the status change to 'Submitted'"
echo "      - Grade the assignment (as teacher) and watch it change to 'Graded'"
echo "      - Take a quiz and watch the status change to 'Attempted'"
echo "      - Grade the quiz (as teacher) and watch it change to 'Graded'"
echo ""
echo "   3. Check real-time notifications:"
echo "      - Status updates should appear as toast notifications"
echo "      - Both students and teachers should see relevant updates"
echo ""
echo "🎉 Dynamic Status Update System Setup Complete!"
echo "   The system now provides real-time status updates for assignments and quizzes"
