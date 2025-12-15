"""
Case converter API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.case_converter import CaseConverterRequest, CaseConverterResponse
from app.services.case_converter_service import convert_case

router = APIRouter(prefix="/case-converter", tags=["Case Converter"])


@router.post("/convert", response_model=CaseConverterResponse)
async def convert_case_endpoint(request: CaseConverterRequest):
    """
    Convert text to different case formats

    - **text**: Text to convert
    - **case_type**: Target case type (lowercase, uppercase, title_case, sentence_case, camel_case, pascal_case, snake_case, kebab_case)

    Examples:
    - "hello world" -> lowercase: "hello world"
    - "hello world" -> UPPERCASE: "HELLO WORLD"
    - "hello world" -> Title Case: "Hello World"
    - "hello world" -> camelCase: "helloWorld"
    - "hello world" -> PascalCase: "HelloWorld"
    - "hello world" -> snake_case: "hello_world"
    - "hello world" -> kebab-case: "hello-world"
    """
    result = convert_case(request)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
