"""
Case converter models
"""

from enum import Enum

from pydantic import BaseModel, Field


class CaseType(str, Enum):
    """Available case conversion types"""

    LOWERCASE = "lowercase"
    UPPERCASE = "uppercase"
    TITLE_CASE = "title_case"
    SENTENCE_CASE = "sentence_case"
    CAMEL_CASE = "camel_case"
    PASCAL_CASE = "pascal_case"
    SNAKE_CASE = "snake_case"
    KEBAB_CASE = "kebab_case"


class CaseConverterRequest(BaseModel):
    """Request model for case conversion"""

    text: str = Field(..., description="Text to convert")
    case_type: CaseType = Field(..., description="Target case type")


class CaseConverterResponse(BaseModel):
    """Response model for case conversion"""

    success: bool
    message: str
    original_text: str = ""
    result_text: str = ""
    case_type: str = ""
