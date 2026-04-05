@echo off
REM Setup script for Microanomalies Detection System (Windows)
REM Run: setup.bat

echo ================================
echo Microanomalies Detection Setup
echo ================================
echo.

REM Check Python
echo Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    exit /b 1
)
for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo OK: Found %PYTHON_VERSION%
echo.

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo OK: Found %NODE_VERSION%
echo.

REM Backend Setup
echo Setting up Backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -q -r requirements.txt

echo OK: Backend setup complete
echo.

REM Frontend Setup
cd ..\frontend

echo Setting up Frontend...

REM Install Node modules
if not exist "node_modules" (
    echo Installing Node dependencies...
    call npm install >nul 2>&1
)

echo OK: Frontend setup complete
echo.

REM Create directories
cd ..
if not exist "data\recordings" mkdir data\recordings
if not exist "data\models" mkdir data\models
if not exist "backend\logs" mkdir backend\logs

echo OK: Directories created
echo.

REM Summary
echo ================================
echo Setup Complete!
echo ================================
echo.
echo To start the application:
echo.
echo Command Window 1 ^(Backend^):
echo   cd backend
echo   venv\Scripts\activate
echo   python app.py
echo.
echo Command Window 2 ^(Frontend^):
echo   cd frontend
echo   npm run dev
echo.
echo Then open: http://localhost:3000
echo.
echo See QUICK_START.md for usage instructions
echo.
pause
