"""
Word counter API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.word_counter import WordCounterRequest, WordCounterResponse
from app.services.word_counter_service import count_words

router = APIRouter(prefix="/word-counter", tags=["Word Counter"])


@router.post("/count", response_model=WordCounterResponse)
async def count_words_endpoint(request: WordCounterRequest):
    """
    Count words, characters, sentences, paragraphs, and lines in text

    - **text**: Text to analyze
    """
    result = count_words(request.text)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
