"""
JavaScript validator models
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class JSError(BaseModel):
    """JavaScript validation error"""

    message: str
    line: Optional[int] = None
    column: Optional[int] = None


class JSValidationRequest(BaseModel):
    """Request model for JavaScript validation"""

    javascript: str = Field(..., min_length=1, description="JavaScript code to validate")


class JSValidationResponse(BaseModel):
    """Response model for JavaScript validation"""

    success: bool
    message: str
    valid: bool
    errors: List[JSError] = []
