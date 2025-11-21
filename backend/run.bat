@echo off
REM Quick start script for AnyTools API (Windows)

echo Starting AnyTools API...
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Virtual environment not found. Creating one...
    python -m venv venv
    echo Virtual environment created
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if dependencies are installed
python -c "import fastapi" 2>nul
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
    echo Dependencies installed
)

REM Check if FFmpeg is installed
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo Warning: FFmpeg is not installed. Video processing will not work.
    echo Install it from: https://ffmpeg.org/download.html
)

REM Create temp directory if it doesn't exist
if not exist "temp" mkdir temp

REM Start the API
echo.
echo Starting API server...
echo    API: http://localhost:8000
echo    Docs: http://localhost:8000/docs
echo.
python -m app.main

