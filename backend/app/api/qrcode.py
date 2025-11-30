"""
QR Code generation API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.qrcode import QRCodeRequest, QRCodeResponse
from app.services.qrcode_service import generate_qrcode

router = APIRouter(prefix="/qrcode", tags=["QR Code"])


@router.post("/generate", response_model=QRCodeResponse)
async def generate_qrcode_endpoint(request: QRCodeRequest):
    """
    Generate a QR code from text data

    - **data**: Text or URL to encode in QR code
    - **size**: Size of each box in pixels (default: 10, range: 1-50)
    - **border**: Border size in boxes (default: 4, range: 0-10)
    - **error_correction**: Error correction level - L (Low), M (Medium), Q (Quartile), H (High) (default: M)
    """
    result = generate_qrcode(
        data=request.data,
        size=request.size or 10,
        border=request.border or 4,
        error_correction=request.error_correction or "M",
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
