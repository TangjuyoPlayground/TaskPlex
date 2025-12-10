"""
Python validator models
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class PyError(BaseModel):
    """Python validation error"""

    message: str
    line: Optional[int] = None
    column: Optional[int] = None


class PyValidationRequest(BaseModel):
    """Request model for Python validation"""

    python: str = Field(..., min_length=1, description="Python code to validate")


class PyValidationResponse(BaseModel):
    """Response model for Python validation"""

    success: bool
    message: str
    valid: bool
    errors: List[PyError] = []
