#!/bin/bash
# Quick start script for AnyTools API

echo "🚀 Starting AnyTools API..."
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "⚠️  Virtual environment not found. Creating one..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Ensure pip is available in venv
if ! python -m pip --version &>/dev/null; then
    echo "📦 Installing pip in virtual environment..."
    python -m ensurepip --upgrade
fi

# Upgrade pip, setuptools, and wheel
echo "⬆️  Upgrading pip, setuptools, and wheel..."
python -m pip install --upgrade pip setuptools wheel --quiet

# Check if dependencies are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
    echo "✅ Dependencies installed"
fi

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  Warning: FFmpeg is not installed. Video processing will not work."
    echo "   Install it with: sudo apt install ffmpeg (Linux) or brew install ffmpeg (macOS)"
fi

# Create temp directory if it doesn't exist
mkdir -p temp

# Start the API
echo ""
echo "✅ Starting API server..."
echo "   API: http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo ""
python -m app.main

