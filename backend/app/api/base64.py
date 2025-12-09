"""
API routes for Base64 encoding/decoding
"""

from fastapi import APIRouter, HTTPException

from app.models.base64_model import Base64Request, Base64Response
from app.services.base64_service import decode_base64, encode_base64

router = APIRouter(prefix="/base64", tags=["Base64"])


@router.post("/encode", response_model=Base64Response)
async def encode_base64_endpoint(request: Base64Request) -> Base64Response:
    """
    Encode text to Base64.
    """
    result = encode_base64(request.text)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)
    return result


@router.post("/decode", response_model=Base64Response)
async def decode_base64_endpoint(request: Base64Request) -> Base64Response:
    """
    Decode Base64 text.
    """
    result = decode_base64(request.text)
    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)
    return result
