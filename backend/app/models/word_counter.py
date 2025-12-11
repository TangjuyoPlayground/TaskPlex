"""
Word counter models
"""

from pydantic import BaseModel, Field


class WordCounterRequest(BaseModel):
    """Request model for word counting"""

    text: str = Field(..., min_length=1, description="Text to analyze")


class WordCounterResponse(BaseModel):
    """Response model for word counting"""

    success: bool
    message: str
    word_count: int = 0
    character_count: int = 0
    character_count_no_spaces: int = 0
    sentence_count: int = 0
    paragraph_count: int = 0
    line_count: int = 0
