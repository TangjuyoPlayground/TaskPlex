"""
Text extractor service for keywords, emails, and URLs
"""

from collections import Counter
import re
from typing import List

from app.models.text_extractor import (
    EmailExtractorResponse,
    KeywordExtractorResponse,
    TextExtractorRequest,
    URLExtractorResponse,
)

# Email regex pattern (RFC 5322 compliant)
EMAIL_PATTERN = r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"

# URL regex pattern (supports http, https, ftp, and common domains)
URL_PATTERN = r'https?://[^\s<>"{}|\\^`\[\]]+|www\.[^\s<>"{}|\\^`\[\]]+|ftp://[^\s<>"{}|\\^`\[\]]+'


def extract_keywords(request: TextExtractorRequest) -> KeywordExtractorResponse:
    """
    Extract keywords from text

    Args:
        request: TextExtractorRequest with text to analyze

    Returns:
        KeywordExtractorResponse with extracted keywords
    """
    if not request.text or not request.text.strip():
        return KeywordExtractorResponse(
            success=False,
            message="Text cannot be empty",
        )

    try:
        # Convert to lowercase and split into words
        # Remove punctuation and keep only alphanumeric words
        words = re.findall(r"\b[a-zA-Z]{3,}\b", request.text.lower())

        # Count word frequencies
        word_counts = Counter(words)

        # Filter out common stop words (basic list)
        stop_words = {
            "the",
            "be",
            "to",
            "of",
            "and",
            "a",
            "in",
            "that",
            "have",
            "i",
            "it",
            "for",
            "not",
            "on",
            "with",
            "he",
            "as",
            "you",
            "do",
            "at",
            "this",
            "but",
            "his",
            "by",
            "from",
            "they",
            "we",
            "say",
            "her",
            "she",
            "or",
            "an",
            "will",
            "my",
            "one",
            "all",
            "would",
            "there",
            "their",
            "le",
            "de",
            "et",
            "un",
            "une",
            "des",
            "les",
            "du",
            "la",
            "pour",
            "que",
            "qui",
            "est",
            "son",
            "ses",
            "sur",
            "par",
            "avec",
            "sans",
            "el",
            "la",
            "de",
            "que",
            "y",
            "a",
            "en",
            "un",
            "ser",
            "se",
            "no",
            "haber",
            "por",
            "con",
            "su",
            "para",
            "como",
            "estar",
            "tener",
            "le",
            "lo",
        }

        # Get keywords (words that appear at least once, excluding stop words)
        keywords = [
            word
            for word, count in word_counts.most_common(50)
            if word not in stop_words and len(word) >= 3
        ]

        return KeywordExtractorResponse(
            success=True,
            message=f"Extracted {len(keywords)} keywords successfully",
            keywords=keywords,
            count=len(keywords),
        )

    except Exception as e:
        return KeywordExtractorResponse(
            success=False,
            message=f"Error extracting keywords: {str(e)}",
        )


def extract_emails(request: TextExtractorRequest) -> EmailExtractorResponse:
    """
    Extract email addresses from text

    Args:
        request: TextExtractorRequest with text to analyze

    Returns:
        EmailExtractorResponse with extracted emails
    """
    if not request.text or not request.text.strip():
        return EmailExtractorResponse(
            success=False,
            message="Text cannot be empty",
        )

    try:
        # Find all email addresses
        emails = re.findall(EMAIL_PATTERN, request.text)

        # Remove duplicates while preserving order
        seen = set()
        unique_emails = []
        for email in emails:
            email_lower = email.lower()
            if email_lower not in seen:
                seen.add(email_lower)
                unique_emails.append(email)

        return EmailExtractorResponse(
            success=True,
            message=f"Extracted {len(unique_emails)} email address(es) successfully",
            emails=unique_emails,
            count=len(unique_emails),
        )

    except Exception as e:
        return EmailExtractorResponse(
            success=False,
            message=f"Error extracting emails: {str(e)}",
        )


def extract_urls(request: TextExtractorRequest) -> URLExtractorResponse:
    """
    Extract URLs from text

    Args:
        request: TextExtractorRequest with text to analyze

    Returns:
        URLExtractorResponse with extracted URLs
    """
    if not request.text or not request.text.strip():
        return URLExtractorResponse(
            success=False,
            message="Text cannot be empty",
        )

    try:
        # Find all URLs
        urls = re.findall(URL_PATTERN, request.text)

        # Remove duplicates while preserving order
        seen = set()
        unique_urls = []
        for url in urls:
            url_lower = url.lower()
            if url_lower not in seen:
                seen.add(url_lower)
                unique_urls.append(url)

        return URLExtractorResponse(
            success=True,
            message=f"Extracted {len(unique_urls)} URL(s) successfully",
            urls=unique_urls,
            count=len(unique_urls),
        )

    except Exception as e:
        return URLExtractorResponse(
            success=False,
            message=f"Error extracting URLs: {str(e)}",
        )
