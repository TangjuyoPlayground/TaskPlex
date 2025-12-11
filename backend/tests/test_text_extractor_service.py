"""
Tests for text extractor service
"""

from app.models.text_extractor import TextExtractorRequest
from app.services.text_extractor_service import extract_emails, extract_keywords, extract_urls


def test_extract_keywords_basic():
    """Test basic keyword extraction"""
    text = "Python is a great programming language. Python is used for web development."
    request = TextExtractorRequest(text=text)
    result = extract_keywords(request)
    assert result.success is True
    assert result.count > 0
    assert "python" in result.keywords
    assert "programming" in result.keywords
    assert "language" in result.keywords


def test_extract_keywords_empty():
    """Test with empty text"""
    # Pydantic validation will catch empty string, but service should handle it too
    request = TextExtractorRequest(text="   ")
    result = extract_keywords(request)
    assert result.success is False


def test_extract_keywords_stop_words():
    """Test that stop words are filtered out"""
    text = "the and or but this that"
    request = TextExtractorRequest(text=text)
    result = extract_keywords(request)
    assert result.success is True
    # Stop words should not be in keywords
    assert "the" not in result.keywords
    assert "and" not in result.keywords


def test_extract_emails_basic():
    """Test basic email extraction"""
    text = "Contact us at support@example.com or info@test.org for more details."
    request = TextExtractorRequest(text=text)
    result = extract_emails(request)
    assert result.success is True
    assert result.count == 2
    assert "support@example.com" in result.emails
    assert "info@test.org" in result.emails


def test_extract_emails_duplicates():
    """Test that duplicate emails are removed"""
    text = "Email: test@example.com and also test@example.com again."
    request = TextExtractorRequest(text=text)
    result = extract_emails(request)
    assert result.success is True
    assert result.count == 1
    assert "test@example.com" in result.emails


def test_extract_emails_empty():
    """Test with empty text"""
    request = TextExtractorRequest(text="   ")
    result = extract_emails(request)
    assert result.success is False


def test_extract_urls_basic():
    """Test basic URL extraction"""
    text = "Visit https://example.com or http://test.org for more info. Also check www.demo.net"
    request = TextExtractorRequest(text=text)
    result = extract_urls(request)
    assert result.success is True
    assert result.count >= 2
    assert any("example.com" in url for url in result.urls)
    assert any("test.org" in url for url in result.urls)


def test_extract_urls_duplicates():
    """Test that duplicate URLs are removed"""
    text = "URL: https://example.com and also https://example.com again."
    request = TextExtractorRequest(text=text)
    result = extract_urls(request)
    assert result.success is True
    assert result.count == 1
    assert any("example.com" in url for url in result.urls)


def test_extract_urls_empty():
    """Test with empty text"""
    request = TextExtractorRequest(text="   ")
    result = extract_urls(request)
    assert result.success is False


def test_extract_urls_ftp():
    """Test FTP URL extraction"""
    text = "Download from ftp://files.example.com/pub/data.txt"
    request = TextExtractorRequest(text=text)
    result = extract_urls(request)
    assert result.success is True
    assert result.count >= 1
    assert any("ftp://" in url for url in result.urls)
