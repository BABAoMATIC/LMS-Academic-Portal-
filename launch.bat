@echo off
chcp 65001 >nul
echo 🚀 Launching Academic Portal...

REM Check if virtual environment exists
if not exist ".venv" (
    echo ❌ Virtual environment not found. Please run setup first:
    echo    setup_and_run.bat
    pause
    exit /b 1
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call .venv\Scripts\activate.bat

echo.
echo ==========================================
echo 🎉 ACADEMIC PORTAL IS NOW RUNNING! 🎉
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
