"""
Barcode generation API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.barcode import BarcodeRequest, BarcodeResponse
from app.services.barcode_service import generate_barcode

router = APIRouter(prefix="/barcode", tags=["Barcode"])


@router.post("/generate", response_model=BarcodeResponse)
async def generate_barcode_endpoint(request: BarcodeRequest):
    """
    Generate a barcode from data

    - **data**: Data to encode (numbers/text depending on barcode type)
    - **barcode_type**: Type of barcode - ean13, ean8, upca, upce, code128, code39, isbn13, isbn10 (default: code128)
    - **width**: Width of barcode bars in mm (default: 2.0, range: 0.5-10.0)
    - **height**: Height of barcode in mm (default: 50.0, range: 10.0-200.0)
    - **add_checksum**: Add checksum digit if supported (default: True)
    """
    result = generate_barcode(
        data=request.data,
        barcode_type=request.barcode_type or "code128",
        width=request.width if request.width is not None else 1.0,
        height=request.height if request.height is not None else 50.0,
        add_checksum=request.add_checksum if request.add_checksum is not None else True,
    )

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
