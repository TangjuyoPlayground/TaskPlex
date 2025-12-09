"""
Models for Base64 encoding/decoding
"""

from pydantic import BaseModel, Field


class Base64Request(BaseModel):
    """Request payload for Base64 operations"""

    text: str = Field(..., min_length=1, description="Text to encode/decode")


class Base64Response(BaseModel):
    """Response payload for Base64 operations"""

    success: bool
    message: str
    result: str

