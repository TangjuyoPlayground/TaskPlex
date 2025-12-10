"""
Tests for XML validator service
"""

from app.models.xml_validator import XMLValidationResponse
from app.services.xml_validator_service import validate_xml


def test_validate_xml_valid():
    """Test validating valid XML"""
    valid_xml = '<?xml version="1.0"?><root><item>test</item></root>'
    result = validate_xml(valid_xml)

    assert result.success is True
    assert result.valid is True
    assert len(result.errors) == 0
    assert "valid" in result.message.lower()


def test_validate_xml_invalid():
    """Test validating invalid XML"""
    invalid_xml = "<root><item>test</item>"  # Missing closing tag
    result = validate_xml(invalid_xml)

    assert result.success is True
    assert result.valid is False
    assert len(result.errors) > 0


def test_validate_xml_empty():
    """Test validating empty XML"""
    result = validate_xml("")

    assert result.success is False
    assert result.valid is False
    assert len(result.errors) > 0


def test_validate_xml_nested():
    """Test validating nested XML"""
    nested_xml = '<?xml version="1.0"?><root><parent><child>test</child></parent></root>'
    result = validate_xml(nested_xml)

    assert result.success is True
    assert result.valid is True
    assert len(result.errors) == 0
