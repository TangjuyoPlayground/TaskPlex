"""
Tests for Lorem Ipsum service
"""

from app.models.lorem_ipsum import LoremIpsumRequest, LoremIpsumType
from app.services.lorem_ipsum_service import generate_lorem_ipsum


def test_generate_lorem_ipsum_paragraphs():
    """Test generating paragraphs"""
    request = LoremIpsumRequest(type=LoremIpsumType.PARAGRAPHS, count=2)
    result = generate_lorem_ipsum(request)

    assert result.success is True
    assert result.text is not None
    assert len(result.text) > 0
    assert result.count == 2
    assert result.type == "paragraphs"


def test_generate_lorem_ipsum_words():
    """Test generating words"""
    request = LoremIpsumRequest(type=LoremIpsumType.WORDS, count=10)
    result = generate_lorem_ipsum(request)

    assert result.success is True
    assert result.text is not None
    assert len(result.text) > 0
    assert result.count == 10
    assert result.type == "words"


def test_generate_lorem_ipsum_sentences():
    """Test generating sentences"""
    request = LoremIpsumRequest(type=LoremIpsumType.SENTENCES, count=3)
    result = generate_lorem_ipsum(request)

    assert result.success is True
    assert result.text is not None
    assert len(result.text) > 0
    assert result.count == 3
    assert result.type == "sentences"


def test_generate_lorem_ipsum_single_paragraph():
    """Test generating single paragraph"""
    request = LoremIpsumRequest(type=LoremIpsumType.PARAGRAPHS, count=1)
    result = generate_lorem_ipsum(request)

    assert result.success is True
    assert result.text is not None
    assert len(result.text) > 0
