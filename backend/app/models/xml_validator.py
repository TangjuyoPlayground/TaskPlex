"""
XML validator models
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class XMLError(BaseModel):
    """XML validation error"""

    message: str
    line: Optional[int] = None
    column: Optional[int] = None


class XMLValidationRequest(BaseModel):
    """Request model for XML validation"""

    xml: str = Field(..., min_length=1, description="XML content to validate")


class XMLValidationResponse(BaseModel):
    """Response model for XML validation"""

    success: bool
    message: str
    valid: bool
    errors: List[XMLError] = []
