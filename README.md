# TaskPlex

A comprehensive multi-purpose utility application with a Flutter frontend and FastAPI backend, providing video/image processing, PDF operations, regex validation, and unit conversion.

## Project Structure

```
TaskPlex/
├── backend/          # FastAPI backend (Python)
│   ├── app/
│   │   ├── api/      # API endpoints
│   │   ├── models/   # Data models
│   │   ├── services/ # Business logic
│   │   └── utils/    # Utilities
│   ├── requirements.txt
│   └── README.md
│
├── frontend/         # Flutter desktop/Android application
│   ├── lib/
│   │   ├── models/   # Data models
│   │   ├── services/ # API client
│   │   ├── screens/  # UI screens
│   │   ├── widgets/  # Reusable components
│   │   └── main.dart
│   ├── pubspec.yaml
│   └── README.md
│
└── TaskPlex/         # Docker deployment configuration
    ├── Dockerfile    # Single container for backend + frontend
    ├── entrypoint.sh # Startup script
    ├── start.sh      # Linux/macOS launcher
    ├── start.bat     # Windows launcher
    └── README.md
```

## Features

### 🎥 Video Processing
- Compress videos with quality presets (low, medium, high)
- Convert between formats: MP4, AVI, MOV, MKV, FLV, WMV
- Powered by FFmpeg

### 🖼️ Image Processing
- Compress images with quality presets
- Convert between formats: JPG, PNG, WEBP, GIF, BMP
- View compression ratios and file sizes

### 📄 PDF Operations
- **Merge**: Combine multiple PDFs into one
- **Compress**: Reduce PDF file size
- **Split**: Extract specific pages or ranges
- **Reorganize**: Reorder PDF pages

### 🔍 Regex Validator
- Test regex patterns against multiple strings
- Support for regex flags (case insensitive, multiline, etc.)
- View matches and capture groups

### 📏 Unit Converter
- Convert between various units:
  - Length (meter, kilometer, mile, foot, inch, etc.)
  - Mass (kilogram, gram, pound, ounce, etc.)
  - Temperature (celsius, fahrenheit, kelvin)
  - Time (second, minute, hour, day, week)
  - Speed (m/s, km/h, mph)
  - Volume (liter, gallon, milliliter, cubic meter)

## Quick Start

### Option 1: Standalone Executables (Recommended for End Users)

Build native executables without Docker:

**Linux:**
```bash
./build-executables.sh
cd build_output
./start-taskplex.sh
```

**Windows:**
```cmd
build-executables.bat
cd build_output
start-taskplex.bat
```

See `BUILD_GUIDE.md` for detailed instructions.

### Option 2: Using Docker (Recommended for Development)

The easiest way to run TaskPlex is using Docker:

**Linux/macOS:**
```bash
cd TaskPlex
chmod +x start.sh
./start.sh
```

**Windows:**
```cmd
cd TaskPlex
start.bat
```

This will:
1. Build a Docker image with all dependencies
2. Start both backend and frontend
3. Make the backend API available at http://localhost:8000
4. Launch the desktop application

### Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.main
```

Backend will be available at http://localhost:8000

#### Frontend

```bash
cd frontend
flutter pub get
flutter run -d linux  # Or -d windows, -d android
```

## Requirements

### Docker Deployment
- Docker 20.0+
- X11 server (Linux: built-in, Windows: VcXsrv/Xming, macOS: XQuartz)

### Manual Deployment

**Backend:**
- Python 3.9+
- FFmpeg (for video processing)

**Frontend:**
- Flutter SDK 3.0.0+
- Platform-specific dependencies (see Flutter installation guide)

## Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with async support
- **Structure**: Clean architecture with models, services, and API layers
- **File Processing**: Temporary file handling with automatic cleanup
- **CORS**: Enabled for frontend communication

### Frontend (Flutter)
- **Platform**: Desktop (Linux, Windows, macOS) and Android
- **Architecture**: Modular with separate screens for each feature
- **State Management**: Provider pattern
- **API Communication**: HTTP client with multipart/form-data support
- **UI**: Material Design 3 with responsive layout

### Communication
- RESTful API communication over HTTP
- JSON for structured data
- Multipart/form-data for file uploads
- File streaming for downloads

## Development

### Backend Development

```bash
cd backend
# Run with auto-reload
python -m app.main

# Run tests
pytest tests/ -v

# Format code
black app/
```

### Frontend Development

```bash
cd frontend
# Run in debug mode
flutter run

# Build release
flutter build linux --release

# Run tests
flutter test

# Format code
flutter format lib/
```

## API Documentation

When the backend is running, access the interactive API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Configuration

### Backend Environment Variables

Create a `.env` file in the backend directory:

```env
HOST=0.0.0.0
PORT=8000
DEBUG=True
MAX_FILE_SIZE=100  # MB
TEMP_FILE_CLEANUP_MINUTES=10
API_TITLE=TaskPlex API
API_VERSION=1.0.0
```

### Frontend Configuration

Set the backend API URL in `lib/services/api_service.dart` or via environment:

```bash
flutter run --dart-define=API_URL=http://localhost:8000
```

## Troubleshooting

### Backend Issues

**FFmpeg not found:**
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org and add to PATH
```

**Port already in use:**
```bash
# Find process using port 8000
lsof -i :8000  # Linux/macOS
netstat -ano | findstr :8000  # Windows

# Kill the process or change PORT in .env
```

### Frontend Issues

**Flutter not found:**
```bash
# Install Flutter SDK
# See https://flutter.dev/docs/get-started/install
```

**Build errors:**
```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter run
```

### Docker Issues

**Container fails to start:**
```bash
# Check logs
docker logs taskplex-app

# Rebuild image
docker build -t taskplex .
```

**X11 issues (Linux):**
```bash
# Allow Docker to connect to X server
xhost +local:docker
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or feature requests:
- Backend: See `backend/README.md`
- Frontend: See `frontend/README.md`
- Docker: See `TaskPlex/README.md`

## Roadmap

- [ ] Add authentication and user management
- [ ] Implement batch processing for files
- [ ] Add progress indicators for long operations
- [ ] Support for more file formats
- [ ] Cloud storage integration
- [ ] Mobile iOS support
- [ ] Web version
- [ ] API rate limiting
- [ ] WebSocket support for real-time updates

