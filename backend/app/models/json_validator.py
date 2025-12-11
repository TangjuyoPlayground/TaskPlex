"""
JSON validator models
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class JSONError(BaseModel):
    """JSON validation error"""

    message: str
    line: Optional[int] = None
    column: Optional[int] = None


class JSONValidationRequest(BaseModel):
    """Request model for JSON validation"""

    json: str = Field(..., min_length=1, description="JSON content to validate")


class JSONValidationResponse(BaseModel):
    """Response model for JSON validation"""

    success: bool
    message: str
    valid: bool
    errors: List[JSONError] = []
