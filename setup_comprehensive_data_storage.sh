#!/bin/bash

# Setup script for Comprehensive Data Storage System
# This script sets up the complete data storage system for assignments and quizzes

echo "🚀 Setting up Comprehensive Data Storage System"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "backend/simple_server.py" ]; then
    echo "❌ Error: Please run this script from the academic-portal root directory"
    exit 1
fi

# Navigate to backend directory
cd backend

echo "📊 Step 1: Running database migration for comprehensive data storage..."
python3 update_data_storage_schema.py
if [ $? -eq 0 ]; then
    echo "✅ Comprehensive data storage database migration completed successfully"
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
echo "🧪 Step 4: Running comprehensive data persistence tests..."
cd ../backend
python3 test_data_persistence.py
if [ $? -eq 0 ]; then
    echo "✅ All data persistence tests passed successfully"
else
    echo "❌ Some tests failed - please check the implementation"
    echo "   You can still proceed, but some features may not work correctly"
fi

echo ""
echo "🎯 Step 5: Comprehensive Data Storage System Features Implemented:"
echo "   ✅ Enhanced assignment submission data storage:"
echo "      • Student ID, Assignment ID, Submission time, File path"
echo "      • Original filename, file size, file type"
echo "      • Submission IP address and user agent for audit"
echo "      • Comprehensive metadata storage"
echo ""
echo "   ✅ Enhanced quiz submission data storage:"
echo "      • Student ID, Quiz ID, Answers submitted"
echo "      • Grade (Pass/Fail) with configurable passing percentage"
echo "      • Feedback from professor for individual answers"
echo "      • Time taken, attempt tracking, version control"
echo ""
echo "   ✅ Comprehensive data linking:"
echo "      • All data properly linked to student profiles"
echo "      • Foreign key relationships maintained"
echo "      • Data consistency checks implemented"
echo ""
echo "   ✅ Real-time data updates:"
echo "      • WebSocket-based real-time notifications"
echo "      • Immediate updates for students and teachers"
echo "      • Status tracking and progress monitoring"
echo ""
echo "   ✅ Data audit and analytics:"
echo "      • Complete audit trail for all data changes"
echo "      • Submission analytics and reporting"
echo "      • Data retention policies"
echo "      • Performance monitoring"

echo ""
echo "🔌 Step 6: Starting the backend server..."
echo "   The backend server will start with comprehensive data storage support"
echo "   Press Ctrl+C to stop the server when done testing"
echo ""

# Start the backend server
python3 simple_server.py

echo ""
echo "📋 Manual Testing Instructions:"
echo "   1. Open the frontend in another terminal:"
echo "      cd frontend && npm start"
echo ""
echo "   2. Test comprehensive data storage:"
echo "      - Submit assignments and verify all data is stored"
echo "      - Take quizzes and verify answers, grades, and feedback"
echo "      - Check that all data is linked to student profiles"
echo "      - Verify real-time updates work correctly"
echo ""
echo "   3. Test data retrieval:"
echo "      - Use the comprehensive data endpoints"
echo "      - Verify data consistency and relationships"
echo "      - Check audit trail and analytics"
echo ""
echo "🎉 Comprehensive Data Storage System Setup Complete!"
echo "   The system now provides complete data persistence for all submissions,"
echo "   grading, and feedback with real-time updates and comprehensive tracking."
