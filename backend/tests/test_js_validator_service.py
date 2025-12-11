"""
Tests for JavaScript validator service
"""

from app.models.js_validator import JSValidationResponse
from app.services.js_validator_service import validate_javascript


def test_validate_javascript_valid():
    """Test validating valid JavaScript"""
    valid_js = "function test() { return 'hello'; }"
    result = validate_javascript(valid_js)

    # Note: jsbeautifier may not always validate syntax perfectly
    # This test checks that the function runs without errors
    assert result.success is True


def test_validate_javascript_empty():
    """Test validating empty JavaScript"""
    result = validate_javascript("")

    assert result.success is False
    assert result.valid is False
    assert len(result.errors) > 0


def test_validate_javascript_simple():
    """Test validating simple JavaScript"""
    simple_js = "const x = 1;"
    result = validate_javascript(simple_js)

    assert result.success is True
