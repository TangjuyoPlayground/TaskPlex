"""
Accent remover API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.accent_remover import AccentRemoverRequest, AccentRemoverResponse
from app.services.accent_remover_service import remove_accents

router = APIRouter(prefix="/accent-remover", tags=["Accent Remover"])


@router.post("/remove", response_model=AccentRemoverResponse)
async def remove_accents_endpoint(request: AccentRemoverRequest):
    """
    Remove accents from text

    - **text**: Text to remove accents from

    Examples:
    - "café" -> "cafe"
    - "naïve" -> "naive"
    - "résumé" -> "resume"
    - "São Paulo" -> "Sao Paulo"
    """
    result = remove_accents(request)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
