#!/bin/bash

echo "🚀 Starting Academic Portal Backend (Fixed)..."
echo "📍 Location: /home/nishit/academic-portal/backend"
echo ""

cd /home/nishit/academic-portal/backend

# Check if Python is available
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed or not in PATH"
    exit 1
fi

# Check if virtual environment exists and activate it
if [ -d "../.venv" ]; then
    echo "🐍 Activating virtual environment..."
    source ../.venv/bin/activate
fi

# Check if required packages are installed
echo "📦 Checking dependencies..."
python -c "import flask, flask_cors, flask_socketio" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "📦 Installing Python dependencies..."
    pip install flask flask-cors flask-socketio
fi

# Start the backend server
echo "🌐 Starting Flask server with Socket.IO on http://localhost:5005"
echo "Press Ctrl+C to stop the server"
echo ""

python simple_server.py
