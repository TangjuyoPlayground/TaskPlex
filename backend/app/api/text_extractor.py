"""
Text extractor API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.text_extractor import (
    EmailExtractorResponse,
    KeywordExtractorResponse,
    TextExtractorRequest,
    URLExtractorResponse,
)
from app.services.text_extractor_service import (
    extract_emails,
    extract_keywords,
    extract_urls,
)

router = APIRouter(prefix="/text-extractor", tags=["Text Extractor"])


@router.post("/keywords", response_model=KeywordExtractorResponse)
async def extract_keywords_endpoint(request: TextExtractorRequest):
    """
    Extract keywords from text

    - **text**: Text to extract keywords from
    """
    result = extract_keywords(request)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result


@router.post("/emails", response_model=EmailExtractorResponse)
async def extract_emails_endpoint(request: TextExtractorRequest):
    """
    Extract email addresses from text

    - **text**: Text to extract emails from
    """
    result = extract_emails(request)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result


@router.post("/urls", response_model=URLExtractorResponse)
async def extract_urls_endpoint(request: TextExtractorRequest):
    """
    Extract URLs from text

    - **text**: Text to extract URLs from
    """
    result = extract_urls(request)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
