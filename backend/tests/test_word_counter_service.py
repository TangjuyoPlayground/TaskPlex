"""
Tests for word counter service
"""

from app.models.word_counter import WordCounterRequest
from app.services.word_counter_service import count_words


def test_count_words_basic():
    """Test basic word counting"""
    text = "Hello world. This is a test."
    result = count_words(text)
    assert result.success is True
    assert result.word_count == 6
    assert result.character_count == 28
    assert result.sentence_count >= 1
    assert result.paragraph_count == 1
    assert result.line_count == 1


def test_count_words_multiple_paragraphs():
    """Test counting with multiple paragraphs"""
    text = "First paragraph.\n\nSecond paragraph.\n\nThird paragraph."
    result = count_words(text)
    assert result.success is True
    assert result.paragraph_count == 3
    assert result.word_count == 6


def test_count_words_multiple_sentences():
    """Test counting with multiple sentences"""
    text = "First sentence. Second sentence! Third sentence?"
    result = count_words(text)
    assert result.success is True
    assert result.sentence_count >= 3


def test_count_words_empty():
    """Test with empty text"""
    text = ""
    result = count_words(text)
    assert result.success is False
    assert "empty" in result.message.lower()


def test_count_words_whitespace_only():
    """Test with whitespace only"""
    text = "   \n\n\t  "
    result = count_words(text)
    assert result.success is False


def test_count_words_characters_no_spaces():
    """Test character count without spaces"""
    text = "Hello world"
    result = count_words(text)
    assert result.success is True
    assert result.character_count == 11
    assert result.character_count_no_spaces == 10


def test_count_words_multiline():
    """Test with multiple lines"""
    text = "Line one\nLine two\nLine three"
    result = count_words(text)
    assert result.success is True
    assert result.line_count == 3
