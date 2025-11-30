"""
QR Code generation service
"""

import io
from pathlib import Path

import qrcode
from qrcode.constants import ERROR_CORRECT_H, ERROR_CORRECT_L, ERROR_CORRECT_M, ERROR_CORRECT_Q

from app.config import TEMP_DIR
from app.models.qrcode import QRCodeResponse
from app.utils.file_handler import generate_unique_filename

# Map error correction level strings to constants
ERROR_CORRECTION_MAP = {
    "L": ERROR_CORRECT_L,
    "M": ERROR_CORRECT_M,
    "Q": ERROR_CORRECT_Q,
    "H": ERROR_CORRECT_H,
}


def generate_qrcode(
    data: str, size: int = 10, border: int = 4, error_correction: str = "M"
) -> QRCodeResponse:
    """
    Generate a QR code image from text data

    Args:
        data: Text data to encode in QR code
        size: Size of each box in pixels (default: 10)
        border: Border size in boxes (default: 4)
        error_correction: Error correction level (L, M, Q, H)

    Returns:
        QRCodeResponse with QR code image URL
    """
    try:
        # Get error correction constant
        error_correction_level = ERROR_CORRECTION_MAP.get(error_correction.upper(), ERROR_CORRECT_M)

        # Create QR code instance
        qr = qrcode.QRCode(
            version=1,
            error_correction=error_correction_level,
            box_size=size,
            border=border,
        )

        # Add data to QR code
        qr.add_data(data)
        qr.make(fit=True)

        # Create image
        img = qr.make_image(fill_color="black", back_color="white")

        # Save to temporary file
        filename = generate_unique_filename("qrcode.png")
        file_path = TEMP_DIR / filename

        # Save image
        img.save(file_path, "PNG")

        # Return response with download URL
        return QRCodeResponse(
            success=True,
            message="QR code generated successfully",
            qr_code_url=f"/api/v1/download/{filename}",
            filename=filename,
        )

    except Exception as e:
        return QRCodeResponse(
            success=False,
            message=f"Error generating QR code: {str(e)}",
        )
