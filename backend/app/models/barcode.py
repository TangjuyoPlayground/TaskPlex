"""
Barcode generation models
"""

from typing import Literal, Optional

from pydantic import BaseModel, Field


class BarcodeRequest(BaseModel):
    """Request model for barcode generation"""

    data: str = Field(
        ...,
        description="Data to encode in barcode (numbers, text depending on barcode type)",
        min_length=1,
        max_length=100,
    )
    barcode_type: Literal[
        "ean13", "ean8", "upca", "upce", "code128", "code39", "isbn13", "isbn10"
    ] = Field(
        "code128",
        description="Type of barcode to generate",
    )
    width: Optional[float] = Field(
        1.0,
        description="Width of the barcode bars in mm (default: 1.0, recommended: 1.0-2.0 for mobile scanning)",
        ge=0.5,
        le=10.0,
    )
    height: Optional[float] = Field(
        50.0, description="Height of the barcode in mm (default: 50.0)", ge=10.0, le=200.0
    )
    add_checksum: Optional[bool] = Field(
        True, description="Add checksum digit if supported by barcode type (default: True)"
    )


class BarcodeResponse(BaseModel):
    """Response model for barcode generation"""

    success: bool
    message: str
    barcode_url: Optional[str] = None
    filename: Optional[str] = None
