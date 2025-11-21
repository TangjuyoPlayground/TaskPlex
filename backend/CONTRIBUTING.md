# Contributing to AnyTools API

Thank you for your interest in contributing to AnyTools API! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/AnyTools.git
   cd AnyTools
   ```
3. **Create a virtual environment** and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

## Development Workflow

1. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the code style guidelines below

3. **Run tests** to ensure nothing is broken:
   ```bash
   pytest tests/ -v
   ```

4. **Commit your changes** with clear, descriptive commit messages:
   ```bash
   git add .
   git commit -m "Add feature: description of your changes"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub with a clear description of your changes

## Code Style Guidelines

- Follow **PEP 8** style guidelines for Python code
- Use **type hints** where appropriate
- Write **docstrings** for all functions, classes, and modules
- Keep functions **small and focused** on a single task
- Use **meaningful variable and function names**

Example:
```python
def process_image(input_path: Path, output_path: Path, quality: str = "medium") -> ImageProcessingResponse:
    """
    Process an image with the specified quality
    
    Args:
        input_path: Path to the input image
        output_path: Path to save the processed image
        quality: Quality preset (low, medium, high)
        
    Returns:
        ImageProcessingResponse with processing results
    """
    # Implementation here
    pass
```

## Testing Guidelines

- Write **unit tests** for all new features
- Ensure **test coverage** remains high (aim for >80%)
- Use **descriptive test names** that explain what is being tested
- Test both **success and failure** cases

Example:
```python
def test_image_compression_success():
    """Test that image compression works correctly"""
    # Test implementation
    pass

def test_image_compression_invalid_format():
    """Test that invalid format raises appropriate error"""
    # Test implementation
    pass
```

## Architecture Guidelines

The project follows a clean, layered architecture:

- **Models** (`app/models/`): Pydantic models for request/response validation
- **Services** (`app/services/`): Business logic and processing
- **Utils** (`app/utils/`): Shared utilities and helpers
- **API** (`app/api/`): FastAPI route handlers

When adding new features:

1. Define **models** first (request/response schemas)
2. Implement **business logic** in services
3. Create **API endpoints** that use the services
4. Add **tests** for all layers

## Adding New Features

### Adding a New Processing Type

1. **Create models** in `app/models/your_feature.py`
2. **Create service** in `app/services/your_feature_service.py`
3. **Create API routes** in `app/api/your_feature.py`
4. **Register routes** in `app/main.py`
5. **Add tests** in `tests/test_your_feature.py`
6. **Update README** with usage examples

### Adding New File Formats

1. **Update supported formats** in `app/config.py`
2. **Update validators** in `app/utils/validators.py`
3. **Implement processing** in relevant service
4. **Add tests** for the new format
5. **Update documentation**

## Documentation

- Keep **README.md** up to date with new features
- Add **docstrings** to all public functions
- Update **API examples** in the README
- Consider adding usage examples for complex features

## Commit Message Guidelines

Use clear, descriptive commit messages:

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **test**: Adding or updating tests
- **refactor**: Code refactoring
- **style**: Code style changes (formatting)
- **chore**: Maintenance tasks

Examples:
```
feat: Add WebP support for image conversion
fix: Handle empty PDF files gracefully
docs: Update installation instructions
test: Add unit tests for regex validation
refactor: Simplify file upload handling
```

## Reporting Issues

When reporting issues, please include:

- **Clear description** of the problem
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Environment details** (OS, Python version, etc.)
- **Error messages** or logs if applicable

## Questions?

If you have questions about contributing, feel free to:

- Open an issue on GitHub
- Check existing issues and pull requests
- Review the project documentation

Thank you for contributing to AnyTools API! 🚀

