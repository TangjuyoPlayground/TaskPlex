"""
Lorem Ipsum generator models
"""

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class LoremIpsumType(str, Enum):
    """Type of Lorem Ipsum generation"""

    PARAGRAPHS = "paragraphs"
    WORDS = "words"
    SENTENCES = "sentences"


class LoremIpsumRequest(BaseModel):
    """Request model for Lorem Ipsum generation"""

    type: LoremIpsumType = Field(
        LoremIpsumType.PARAGRAPHS, description="Type of Lorem Ipsum to generate"
    )
    count: int = Field(1, description="Number of paragraphs/words/sentences", ge=1, le=1000)
    start_with_lorem: bool = Field(True, description="Start with 'Lorem ipsum dolor sit amet'")


class LoremIpsumResponse(BaseModel):
    """Response model for Lorem Ipsum generation"""

    success: bool
    message: str
    text: Optional[str] = None
    type: Optional[str] = None
    count: Optional[int] = None
