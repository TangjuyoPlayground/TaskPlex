"""
Text extractor models for keywords, emails, and URLs
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class TextExtractorRequest(BaseModel):
    """Request model for text extraction"""

    text: str = Field(..., min_length=1, description="Text to extract from")


class KeywordExtractorResponse(BaseModel):
    """Response model for keyword extraction"""

    success: bool
    message: str
    keywords: List[str] = []
    count: int = 0


class EmailExtractorResponse(BaseModel):
    """Response model for email extraction"""

    success: bool
    message: str
    emails: List[str] = []
    count: int = 0


class URLExtractorResponse(BaseModel):
    """Response model for URL extraction"""

    success: bool
    message: str
    urls: List[str] = []
    count: int = 0
