#!/bin/bash

# ===== ACADEMIC PORTAL SETUP AND RUN SCRIPT =====
echo "🚀 Starting Academic Portal Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Python is installed
print_status "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    print_error "Python3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
print_success "Python $PYTHON_VERSION found"

# Check if pip is installed
print_status "Checking pip installation..."
if ! command -v pip3 &> /dev/null; then
    print_error "pip3 is not installed. Please install pip first."
    exit 1
fi

print_success "pip3 found"

# Check if Node.js is installed
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

NODE_VERSION=$(node --version)
print_success "Node.js $NODE_VERSION found"

# Check if npm is installed
print_status "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "npm found"

# Create virtual environment if it doesn't exist
print_status "Setting up Python virtual environment..."
if [ ! -d ".venv" ]; then
    print_status "Creating virtual environment..."
    python3 -m venv .venv
    print_success "Virtual environment created"
else
    print_success "Virtual environment already exists"
fi

# Activate virtual environment
print_status "Activating virtual environment..."
source .venv/bin/activate

# Upgrade pip
print_status "Upgrading pip..."
pip install --upgrade pip

# Install Python requirements
print_status "Installing Python requirements..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    print_success "Python requirements installed successfully"
else
    print_error "Failed to install Python requirements"
    exit 1
fi

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install

if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed successfully"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

cd ..

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p backend/uploads
mkdir -p backend/instance
mkdir -p backend/migrations

# Check if database exists
print_status "Checking database..."
if [ ! -f "backend/education.db" ]; then
    print_warning "Database not found. Creating initial database..."
    cd backend
    python create_db.py
    cd ..
    print_success "Database created"
else
    print_success "Database already exists"
fi

# Function to cleanup background processes
cleanup() {
    print_status "Shutting down servers..."
    pkill -f "python simple_server.py"
    pkill -f "craco start"
    print_success "Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend server
print_status "Starting backend server..."
cd backend
python simple_server.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if ps -p $BACKEND_PID > /dev/null; then
    print_success "Backend server started (PID: $BACKEND_PID)"
else
    print_error "Failed to start backend server"
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
    print_error "Failed to start frontend server"
    exit 1
fi

# Display server information
echo ""
echo "=========================================="
echo "🎉 ACADEMIC PORTAL IS NOW RUNNING! 🎉"
echo "=========================================="
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5005"
echo "📊 API Docs: http://localhost:5005/"
echo ""
echo "📱 Open your browser and go to: http://localhost:3000"
echo ""
echo "🛑 To stop servers, press Ctrl+C"
echo "=========================================="

# Keep script running and monitor servers
while true; do
    # Check if backend is still running
    if ! ps -p $BACKEND_PID > /dev/null; then
        print_error "Backend server stopped unexpectedly"
        break
    fi
    
    # Check if frontend is still running
    if ! ps -p $FRONTEND_PID > /dev/null; then
        print_error "Frontend server stopped unexpectedly"
        break
    fi
    
    sleep 10
done

# Cleanup on exit
cleanup
