"""
Accent remover models
"""

from pydantic import BaseModel, Field


class AccentRemoverRequest(BaseModel):
    """Request model for accent removal"""

    text: str = Field(..., description="Text to remove accents from")


class AccentRemoverResponse(BaseModel):
    """Response model for accent removal"""

    success: bool
    message: str
    original_text: str = ""
    result_text: str = ""
    removed_count: int = 0
