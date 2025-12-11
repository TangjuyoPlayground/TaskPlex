"""
Tests for accent remover service
"""

import pytest

from app.models.accent_remover import AccentRemoverRequest
from app.services.accent_remover_service import remove_accents


def test_remove_accents_success():
    """Test that accents are successfully removed from text"""
    request = AccentRemoverRequest(text="café naïve résumé São Paulo")
    result = remove_accents(request)

    assert result.success is True
    assert result.result_text == "cafe naive resume Sao Paulo"
    assert result.original_text == "café naïve résumé São Paulo"
    assert result.removed_count > 0


def test_remove_accents_french():
    """Test accent removal with French text"""
    request = AccentRemoverRequest(text="àáâãäåèéêëìíîïòóôõöùúûüýÿ")
    result = remove_accents(request)

    assert result.success is True
    assert "à" not in result.result_text
    assert "é" not in result.result_text
    assert "ü" not in result.result_text


def test_remove_accents_spanish():
    """Test accent removal with Spanish text"""
    request = AccentRemoverRequest(text="España mañana corazón")
    result = remove_accents(request)

    assert result.success is True
    assert result.result_text == "Espana manana corazon"
    assert result.removed_count == 3


def test_remove_accents_german():
    """Test accent removal with German text"""
    request = AccentRemoverRequest(text="Müller Straße")
    result = remove_accents(request)

    assert result.success is True
    assert result.result_text == "Muller Strasse"
    # Only "ü" is a combining accent, "ß" is a separate character replaced by "ss"
    assert result.removed_count == 1


def test_remove_accents_empty_text():
    """Test that empty text returns an error"""
    request = AccentRemoverRequest(text="")
    result = remove_accents(request)

    assert result.success is False
    assert "empty" in result.message.lower()


def test_remove_accents_empty_text_with_spaces():
    """Test that whitespace-only text returns an error"""
    request = AccentRemoverRequest(text="   ")
    result = remove_accents(request)

    assert result.success is False
    assert "empty" in result.message.lower()


def test_remove_accents_no_accents():
    """Test text without accents returns the same text"""
    request = AccentRemoverRequest(text="Hello World")
    result = remove_accents(request)

    assert result.success is True
    assert result.result_text == "Hello World"
    assert result.removed_count == 0


def test_remove_accents_mixed_content():
    """Test accent removal with mixed content (text with and without accents)"""
    request = AccentRemoverRequest(text="Hello café, how are you? I'm doing très bien!")
    result = remove_accents(request)

    assert result.success is True
    assert "cafe" in result.result_text
    assert "tres" in result.result_text
    assert "Hello" in result.result_text
    assert "you" in result.result_text
