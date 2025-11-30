"""
QR Code generation models
"""

from typing import Optional

from pydantic import BaseModel, Field


class QRCodeRequest(BaseModel):
    """Request model for QR code generation"""

    data: str = Field(
        ...,
        description="Data to encode in QR code (text, URL, etc.)",
        min_length=1,
        max_length=2953,
    )
    size: Optional[int] = Field(
        10, description="Size of each box in pixels (default: 10)", ge=1, le=50
    )
    border: Optional[int] = Field(4, description="Border size in boxes (default: 4)", ge=0, le=10)
    error_correction: Optional[str] = Field(
        "M", description="Error correction level (L, M, Q, H)", pattern="^[LMQH]$"
    )


class QRCodeResponse(BaseModel):
    """Response model for QR code generation"""

    success: bool
    message: str
    qr_code_url: Optional[str] = None
    filename: Optional[str] = None
