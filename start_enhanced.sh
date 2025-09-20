#!/bin/bash

# ===== ENHANCED ACADEMIC PORTAL LAUNCH SCRIPT =====
echo "🚀 Launching Enhanced Academic E-Portfolio LMS..."
echo "📡 Real-time features enabled with Socket.IO"
echo "🎯 Features: Reflections, Portfolio Evidence, Skills Tagging, Real-time Notifications"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found. Please run setup first:"
    echo "   ./setup_and_run.sh"
    exit 1
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source .venv/bin/activate

# Create enhanced database tables
print_status "Setting up enhanced database tables..."
cd backend
python create_enhanced_tables.py
if [ $? -eq 0 ]; then
    print_success "Enhanced database tables created successfully"
else
    print_warning "Database setup completed with warnings"
fi

# Function to cleanup background processes
cleanup() {
    print_status "Shutting down enhanced servers..."
    pkill -f "python enhanced_server.py"
    pkill -f "craco start"
    print_success "Enhanced servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start enhanced backend server
print_status "Starting enhanced backend server with Socket.IO..."
python enhanced_server.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    print_success "Enhanced backend server started (PID: $BACKEND_PID)"
else
    echo "❌ Failed to start enhanced backend server"
    exit 1
fi

# Start frontend server
print_status "Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 5

# Check if frontend is running
if ps -p $FRONTEND_PID > /dev/null; then
    print_success "Frontend server started (PID: $FRONTEND_PID)"
else
    echo "❌ Failed to start frontend server"
    exit 1
fi

# Display server information
echo ""
echo "=========================================="
echo "🎉 ENHANCED ACADEMIC E-PORTFOLIO LMS IS NOW RUNNING! 🎉"
echo "=========================================="
echo ""
echo "🌐 Frontend: http://localhost:3001"
echo "🔧 Enhanced Backend: http://localhost:5006"
echo "📊 API Docs: http://localhost:5006/"
echo "📡 Real-time: WebSocket enabled"
echo ""
echo "🎯 New Features Available:"
echo "   • Real-time notifications with toast popups"
echo "   • Reflection Journal for learning documentation"
echo "   • Portfolio Evidence with skill tagging"
echo "   • Learning Outcomes Analytics with charts"
echo "   • Enhanced assignment/quiz feedback system"
echo ""
echo "📱 Access URLs:"
echo "   • Regular Dashboard: http://localhost:3001/dashboard"
echo "   • Enhanced Student Dashboard: http://localhost:3001/enhanced-dashboard"
echo "   • Enhanced Teacher Dashboard: http://localhost:3001/enhanced-teacher-dashboard"
echo ""
echo "🛑 To stop servers, press Ctrl+C"
echo "=========================================="

# Keep script running and monitor servers
while true; do
    # Check if backend is still running
    if ! ps -p $BACKEND_PID > /dev/null; then
        echo "❌ Enhanced backend server stopped unexpectedly"
        break
    fi
    
    # Check if frontend is still running
    if ! ps -p $FRONTEND_PID > /dev/null; then
        echo "❌ Frontend server stopped unexpectedly"
        break
    fi
    
    sleep 10
done

# Cleanup on exit
cleanup
