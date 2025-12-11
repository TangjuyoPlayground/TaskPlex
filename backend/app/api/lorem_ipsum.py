"""
Lorem Ipsum generator API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.lorem_ipsum import LoremIpsumRequest, LoremIpsumResponse
from app.services.lorem_ipsum_service import generate_lorem_ipsum

router = APIRouter(prefix="/lorem-ipsum", tags=["Lorem Ipsum"])


@router.post("/generate", response_model=LoremIpsumResponse)
async def generate_lorem_ipsum_endpoint(request: LoremIpsumRequest):
    """
    Generate Lorem Ipsum text

    - **type**: Type of generation (paragraphs, words, sentences)
    - **count**: Number of paragraphs/words/sentences (1-1000)
    - **start_with_lorem**: Start with 'Lorem ipsum dolor sit amet' (default: true)
    """
    result = generate_lorem_ipsum(request)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
