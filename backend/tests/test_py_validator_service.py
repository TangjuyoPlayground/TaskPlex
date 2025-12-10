"""
Tests for Python validator service
"""

from app.models.py_validator import PyValidationResponse
from app.services.py_validator_service import validate_python


def test_validate_python_valid():
    """Test validating valid Python"""
    valid_py = "def test():\n    return 'hello'"
    result = validate_python(valid_py)

    assert result.success is True
    assert result.valid is True
    assert len(result.errors) == 0
    assert "valid" in result.message.lower()


def test_validate_python_invalid():
    """Test validating invalid Python"""
    invalid_py = "def test():\n    return 'hello'"  # Missing colon or syntax error
    # Actually this is valid, let's use a real syntax error
    invalid_py = "def test(\n    return 'hello'"  # Missing closing parenthesis
    result = validate_python(invalid_py)

    assert result.success is True
    assert result.valid is False
    assert len(result.errors) > 0


def test_validate_python_empty():
    """Test validating empty Python"""
    result = validate_python("")

    assert result.success is False
    assert result.valid is False
    assert len(result.errors) > 0


def test_validate_python_syntax_error():
    """Test validating Python with syntax error"""
    invalid_py = "x = "  # Incomplete statement
    result = validate_python(invalid_py)

    assert result.success is True
    assert result.valid is False
    assert len(result.errors) > 0
