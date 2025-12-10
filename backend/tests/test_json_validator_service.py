"""
Tests for JSON validator service
"""

import json

from app.models.json_validator import JSONValidationResponse
from app.services.json_validator_service import validate_json


def test_validate_json_valid():
    """Test validating valid JSON"""
    valid_json = json.dumps({"name": "test", "value": 123})
    result = validate_json(valid_json)

    assert result.success is True
    assert result.valid is True
    assert len(result.errors) == 0
    assert "valid" in result.message.lower()


def test_validate_json_invalid():
    """Test validating invalid JSON"""
    invalid_json = '{"name": "test", "value": 123'  # Missing closing brace
    result = validate_json(invalid_json)

    assert result.success is True
    assert result.valid is False
    assert len(result.errors) > 0


def test_validate_json_empty():
    """Test validating empty JSON"""
    result = validate_json("")

    assert result.success is False
    assert result.valid is False
    assert len(result.errors) > 0


def test_validate_json_nested():
    """Test validating nested JSON"""
    nested_json = json.dumps({"user": {"name": "test", "age": 30}})
    result = validate_json(nested_json)

    assert result.success is True
    assert result.valid is True
    assert len(result.errors) == 0


def test_validate_json_array():
    """Test validating JSON array"""
    array_json = json.dumps([1, 2, 3, {"key": "value"}])
    result = validate_json(array_json)

    assert result.success is True
    assert result.valid is True
    assert len(result.errors) == 0
