# AnyTools API

A comprehensive REST API for file processing and utility operations. Built with FastAPI, this API provides endpoints for video/image compression and conversion, PDF manipulation, regex validation, and unit conversion.

## Features

- 🎥 **Video Processing**: Compress and convert videos between formats (MP4, AVI, MOV, MKV, FLV, WMV)
- 🖼️ **Image Processing**: Compress and convert images between formats (JPG, PNG, WEBP, GIF, BMP)
- 📄 **PDF Operations**: Merge, compress, split, reorganize, and OCR (text extraction from scanned PDFs)
- 🔍 **Regex Validation**: Test regex patterns against multiple strings
- 📏 **Unit Conversion**: Convert between various scientific units (length, mass, temperature, etc.)

## Architecture

The project follows a clean, modular architecture:

```
AnyTools/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration and settings
│   ├── models/              # Pydantic data models
│   │   ├── video.py
│   │   ├── image.py
│   │   ├── pdf.py
│   │   ├── regex.py
│   │   └── units.py
│   ├── services/            # Business logic
│   │   ├── video_service.py
│   │   ├── image_service.py
│   │   ├── pdf_service.py
│   │   ├── regex_service.py
│   │   └── units_service.py
│   ├── utils/               # Utilities
│   │   ├── file_handler.py
│   │   └── validators.py
│   └── api/                 # API routes
│       ├── video.py
│       ├── image.py
│       ├── pdf.py
│       ├── regex.py
│       └── units.py
├── tests/                   # Tests
├── temp/                    # Temporary files (auto-cleaned)
└── requirements.txt         # Python dependencies
```

## Installation

### Prerequisites

- Python 3.12+
- FFmpeg (for video processing)
- Tesseract OCR (for PDF OCR feature)
- Poppler (for PDF to image conversion)

#### Installing FFmpeg

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH.

#### Installing Tesseract OCR (for PDF OCR)

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install tesseract-ocr tesseract-ocr-eng tesseract-ocr-fra tesseract-ocr-spa
# For additional languages, install: tesseract-ocr-<lang-code>
```

**macOS:**
```bash
brew install tesseract
brew install tesseract-lang  # For additional languages
```

**Windows:**
Download installer from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki) and add to PATH.

#### Installing Poppler (for PDF to image conversion)

**Linux (Ubuntu/Debian):**
```bash
sudo apt install poppler-utils
```

**macOS:**
```bash
brew install poppler
```

**Windows:**
Download from [poppler-windows](https://github.com/oschwartz10612/poppler-windows/releases) and add to PATH.

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd AnyTools
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment file (optional):
```bash
cp .env.example .env
# Edit .env with your settings
```

## Running the API

### Development Mode

```bash
python -m app.main
```

Or with uvicorn directly:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Documentation (Swagger)**: http://localhost:8000/docs
- **Alternative Documentation (ReDoc)**: http://localhost:8000/redoc

## API Endpoints

### Video Operations

#### Compress Video
```http
POST /api/v1/video/compress
Content-Type: multipart/form-data

file: <video_file>
quality: low|medium|high (default: medium)
```

#### Convert Video
```http
POST /api/v1/video/convert
Content-Type: multipart/form-data

file: <video_file>
output_format: mp4|avi|mov|mkv|flv|wmv
quality: low|medium|high (default: medium)
```

### Image Operations

#### Compress Image
```http
POST /api/v1/image/compress
Content-Type: multipart/form-data

file: <image_file>
quality: low|medium|high (default: medium)
```

#### Convert Image
```http
POST /api/v1/image/convert
Content-Type: multipart/form-data

file: <image_file>
output_format: jpg|png|webp|gif|bmp
quality: low|medium|high (default: medium)
```

### PDF Operations

#### Merge PDFs
```http
POST /api/v1/pdf/merge
Content-Type: multipart/form-data

files: <pdf_file_1>
files: <pdf_file_2>
files: <pdf_file_3>
...
```

#### Compress PDF
```http
POST /api/v1/pdf/compress
Content-Type: multipart/form-data

file: <pdf_file>
```

#### Split PDF
```http
POST /api/v1/pdf/split
Content-Type: multipart/form-data

file: <pdf_file>
pages: 1,3,5 (optional - specific pages)
page_ranges: 1-3,5-7 (optional - page ranges)
```

#### Reorganize PDF
```http
POST /api/v1/pdf/reorganize
Content-Type: multipart/form-data

file: <pdf_file>
page_order: 3,1,2,4 (new page order)
```

#### Extract Text with OCR
```http
POST /api/v1/pdf/ocr
Content-Type: multipart/form-data

file: <pdf_file>
language: eng (optional, default: "eng")
```

**Supported languages:** eng, fra, spa, deu, ita, por, rus, chi_sim, chi_tra, jpn, kor, ara, and more.

**Note:** Requires Tesseract OCR and Poppler to be installed on the system.

### Regex Validation

#### Validate Regex Pattern
```http
POST /api/v1/regex/validate
Content-Type: application/json

{
  "pattern": "^\\d{3}-\\d{2}-\\d{4}$",
  "test_strings": ["123-45-6789", "invalid", "987-65-4321"],
  "flags": "i" (optional: i=ignorecase, m=multiline, s=dotall, x=verbose)
}
```

### Unit Conversion

#### Convert Units
```http
POST /api/v1/units/convert
Content-Type: application/json

{
  "value": 100,
  "from_unit": "meter",
  "to_unit": "feet"
}
```

**Supported unit types:**
- Length: meter, kilometer, mile, foot, inch, centimeter, millimeter
- Mass: kilogram, gram, pound, ounce, ton
- Temperature: celsius, fahrenheit, kelvin
- Time: second, minute, hour, day, week
- Speed: meter/second, kilometer/hour, mile/hour
- Volume: liter, gallon, milliliter, cubic_meter
- And many more...

## Usage Examples

### Using cURL

**Compress an image:**
```bash
curl -X POST "http://localhost:8000/api/v1/image/compress" \
  -F "file=@path/to/image.jpg" \
  -F "quality=high"
```

**Convert video format:**
```bash
curl -X POST "http://localhost:8000/api/v1/video/convert" \
  -F "file=@path/to/video.avi" \
  -F "output_format=mp4" \
  -F "quality=medium" \
  -o output.mp4
```

**Merge PDFs:**
```bash
curl -X POST "http://localhost:8000/api/v1/pdf/merge" \
  -F "files=@file1.pdf" \
  -F "files=@file2.pdf" \
  -F "files=@file3.pdf"
```

**Validate regex:**
```bash
curl -X POST "http://localhost:8000/api/v1/regex/validate" \
  -H "Content-Type: application/json" \
  -d '{
    "pattern": "^[a-z]+@[a-z]+\\.[a-z]+$",
    "test_strings": ["test@example.com", "invalid.email", "user@domain.org"]
  }'
```

**Convert units:**
```bash
curl -X POST "http://localhost:8000/api/v1/units/convert" \
  -H "Content-Type: application/json" \
  -d '{
    "value": 100,
    "from_unit": "celsius",
    "to_unit": "fahrenheit"
  }'
```

### Using Python

```python
import requests

# Compress an image
with open('image.jpg', 'rb') as f:
    files = {'file': f}
    data = {'quality': 'high'}
    response = requests.post('http://localhost:8000/api/v1/image/compress', files=files, data=data)
    print(response.json())

# Convert units
data = {
    "value": 100,
    "from_unit": "meter",
    "to_unit": "feet"
}
response = requests.post('http://localhost:8000/api/v1/units/convert', json=data)
print(response.json())

# Validate regex
data = {
    "pattern": r"^\d{3}-\d{2}-\d{4}$",
    "test_strings": ["123-45-6789", "invalid", "987-65-4321"]
}
response = requests.post('http://localhost:8000/api/v1/regex/validate', json=data)
print(response.json())
```

## Configuration

Configuration is managed through environment variables or the `.env` file:

```env
# Server
HOST=0.0.0.0
PORT=8000
DEBUG=True

# File upload limits (in MB)
MAX_FILE_SIZE=100

# Temporary files
TEMP_DIR=./temp
TEMP_FILE_CLEANUP_MINUTES=30

# API metadata
API_TITLE=AnyTools API
API_VERSION=1.0.0
API_DESCRIPTION=Multi-purpose API for file processing and utilities
```

## Testing

Run tests with pytest:

```bash
pytest tests/ -v
```

Run with coverage:

```bash
pytest tests/ --cov=app --cov-report=html
```

## File Handling

- Uploaded files are temporarily stored in the `temp/` directory
- Files are automatically cleaned up after processing
- A background cleanup task removes files older than 30 minutes (configurable)
- Maximum file size is 100MB by default (configurable)

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description here"
}
```

HTTP status codes:
- `200`: Success
- `400`: Bad request (invalid input)
- `500`: Server error (processing failure)

## Performance Considerations

- **Video processing** can be CPU-intensive and time-consuming for large files
- Consider using **task queues** (Celery, RQ) for production deployments with heavy load
- Implement **rate limiting** for production use
- Use **nginx** or similar for serving large files efficiently

## Security Considerations

- Input validation is performed on all file uploads
- Filenames are sanitized to prevent path traversal attacks
- CORS is configured (update for production)
- Consider adding **authentication/authorization** for production
- Set appropriate **file size limits** based on your infrastructure

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

## Roadmap

Future enhancements:
- [ ] Async task queue for long-running operations
- [ ] User authentication and API keys
- [ ] Rate limiting
- [ ] WebSocket support for progress updates
- [ ] Additional file formats (audio, documents)
- [ ] Batch processing endpoints
- [ ] Docker containerization
- [ ] Cloud storage integration (S3, GCS)

