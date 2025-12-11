"""
Word counter service
"""

import re
from typing import List

from app.models.word_counter import WordCounterRequest, WordCounterResponse


def count_words(text: str) -> WordCounterResponse:
    """
    Count words, characters, sentences, paragraphs, and lines in text

    Args:
        text: Text to analyze

    Returns:
        WordCounterResponse with all counts
    """
    if not text or not text.strip():
        return WordCounterResponse(
            success=False,
            message="Text cannot be empty",
        )

    try:
        # Character counts
        character_count = len(text)
        character_count_no_spaces = len(text.replace(" ", "").replace("\n", "").replace("\t", ""))

        # Word count (split by whitespace and filter empty strings)
        words = text.split()
        word_count = len([w for w in words if w.strip()])

        # Sentence count (count sentence-ending punctuation)
        # Look for . ! ? followed by space or end of string
        sentence_pattern = r"[.!?]+(?:\s+|$)"
        sentences = re.findall(sentence_pattern, text)
        sentence_count = len(sentences) if sentences else 1 if text.strip() else 0

        # Paragraph count (split by double newlines or more)
        paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
        paragraph_count = len(paragraphs) if paragraphs else 1 if text.strip() else 0

        # Line count
        lines = [line for line in text.split("\n") if line.strip()]
        line_count = len(lines) if lines else 1 if text.strip() else 0

        return WordCounterResponse(
            success=True,
            message="Text analyzed successfully",
            word_count=word_count,
            character_count=character_count,
            character_count_no_spaces=character_count_no_spaces,
            sentence_count=sentence_count,
            paragraph_count=paragraph_count,
            line_count=line_count,
        )

    except Exception as e:
        return WordCounterResponse(
            success=False,
            message=f"Error counting words: {str(e)}",
        )
