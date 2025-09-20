@echo off
chcp 65001 >nul
echo 🚀 Starting Academic Portal Setup...

REM Check if Python is installed
echo [INFO] Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)
echo [SUCCESS] Python found

REM Check if pip is installed
echo [INFO] Checking pip installation...
pip --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] pip is not installed. Please install pip first.
    pause
    exit /b 1
)
echo [SUCCESS] pip found

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)
echo [SUCCESS] Node.js found

REM Check if npm is installed
echo [INFO] Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)
echo [SUCCESS] npm found

REM Create virtual environment if it doesn't exist
echo [INFO] Setting up Python virtual environment...
if not exist ".venv" (
    echo [INFO] Creating virtual environment...
    python -m venv .venv
    echo [SUCCESS] Virtual environment created
) else (
    echo [SUCCESS] Virtual environment already exists
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call .venv\Scripts\activate.bat

REM Upgrade pip
echo [INFO] Upgrading pip...
python -m pip install --upgrade pip

REM Install Python requirements
echo [INFO] Installing Python requirements...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install Python requirements
    pause
    exit /b 1
)
echo [SUCCESS] Python requirements installed successfully

REM Install frontend dependencies
echo [INFO] Installing frontend dependencies...
cd frontend
npm install
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Frontend dependencies installed successfully
cd ..

REM Create necessary directories
echo [INFO] Creating necessary directories...
if not exist "backend\uploads" mkdir backend\uploads
if not exist "backend\instance" mkdir backend\instance
if not exist "backend\migrations" mkdir backend\migrations

REM Check if database exists
echo [INFO] Checking database...
if not exist "backend\education.db" (
    echo [WARNING] Database not found. Creating initial database...
    cd backend
    python create_db.py
    cd ..
    echo [SUCCESS] Database created
) else (
    echo [SUCCESS] Database already exists
)

echo.
echo ==========================================
echo 🎉 ACADEMIC PORTAL SETUP COMPLETE! 🎉
echo ==========================================
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5005
echo 📊 API Docs: http://localhost:5005/
echo.
echo 📱 Open your browser and go to: http://localhost:3000
echo.
echo 🚀 Starting servers...
echo.

REM Start backend server
echo [INFO] Starting backend server...
start "Backend Server" cmd /k "cd backend && python simple_server.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo [INFO] Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ==========================================
echo 🎉 SERVERS STARTED SUCCESSFULLY! 🎉
echo ==========================================
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5005
echo.
echo 📱 Open your browser and go to: http://localhost:3000
echo.
echo 🛑 Close the server windows to stop the servers
echo ==========================================
echo.
pause
