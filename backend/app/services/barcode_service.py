"""
Barcode generation service
"""

import io
from pathlib import Path

import barcode
from barcode.writer import ImageWriter
from PIL import Image

from app.config import TEMP_DIR
from app.models.barcode import BarcodeResponse
from app.utils.file_handler import generate_unique_filename

# Map barcode type strings to barcode classes
# Note: UPCE is not directly available, using UPCA instead
BARCODE_TYPE_MAP = {
    "ean13": barcode.EAN13,
    "ean8": barcode.EAN8,
    "upca": barcode.UPCA,
    "upce": barcode.UPCA,  # UPCE not available, using UPCA
    "code128": barcode.Code128,
    "code39": barcode.Code39,
    "isbn13": barcode.ISBN13,
    "isbn10": barcode.ISBN10,
}


def generate_barcode(
    data: str,
    barcode_type: str = "code128",
    width: float = 1.0,  # Reduced from 2.0 to 1.0 for better mobile scanning
    height: float = 50.0,
    add_checksum: bool = True,
) -> BarcodeResponse:
    """
    Generate a barcode image from data

    Args:
        data: Data to encode in barcode
        barcode_type: Type of barcode (ean13, ean8, upca, upce, code128, code39, isbn13, isbn10)
        width: Width of the barcode bars in mm
        height: Height of the barcode in mm
        add_checksum: Add checksum digit if supported

    Returns:
        BarcodeResponse with barcode image URL
    """
    try:
        # Get barcode class
        barcode_class = BARCODE_TYPE_MAP.get(barcode_type.lower())
        if not barcode_class:
            return BarcodeResponse(
                success=False,
                message=f"Unsupported barcode type: {barcode_type}",
            )

        # Create barcode instance
        try:
            # Note: UPCE is mapped to UPCA since UPCE is not available in python-barcode
            if barcode_type.lower() == "upce":
                # Convert UPCE to UPCA format (6 digits to 12 digits)
                # This is a simplified conversion - in production, proper UPCE to UPCA conversion should be used
                if len(data) == 6 and data.isdigit():
                    # Pad with zeros to make it 12 digits (simplified)
                    padded_data = "0" + data + "00000"
                else:
                    padded_data = data
                barcode_instance = barcode.UPCA(padded_data, writer=ImageWriter())
            elif add_checksum and barcode_type.lower() in [
                "ean13",
                "ean8",
                "upca",
                "isbn13",
                "isbn10",
            ]:
                # These types support checksum
                barcode_instance = barcode_class(data, writer=ImageWriter())
            else:
                # Code128 and Code39 don't use checksum parameter
                barcode_instance = barcode_class(data, writer=ImageWriter())
        except Exception as e:
            return BarcodeResponse(
                success=False,
                message=f"Invalid data for barcode type {barcode_type}: {str(e)}",
            )

        # Create image with custom options optimized for mobile scanning
        # Use higher module_width for better readability
        # Mobile scanners work better with larger bars
        effective_width = max(width, 1.0)  # Ensure minimum width of 1.0mm
        effective_height = max(height, 40.0)  # Ensure minimum height of 40mm

        options = {
            "module_width": effective_width,
            "module_height": effective_height,
            "quiet_zone": 6.5,  # Quiet zone is important for scanning
            "font_size": 12,  # Larger font for better readability
            "text_distance": 5.0,
            "background": "white",
            "foreground": "black",
            "write_text": True,  # Ensure text is written
        }

        # Generate barcode image
        img_buffer = io.BytesIO()
        barcode_instance.write(img_buffer, options=options)
        img_buffer.seek(0)

        # Open and save image
        img = Image.open(img_buffer)

        # Ensure minimum size for mobile scanning
        # Most mobile scanners need at least 200-300px width
        min_width = 400  # Increased for better mobile scanning
        if img.width < min_width:
            # Scale up the image while maintaining aspect ratio using high-quality resampling
            scale_factor = min_width / img.width
            new_width = int(img.width * scale_factor)
            new_height = int(img.height * scale_factor)
            img = img.resize((new_width, new_height), Image.LANCZOS)

        # Convert to RGB if needed (some barcode types might generate in different modes)
        if img.mode != "RGB":
            rgb_img = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "RGBA":
                rgb_img.paste(img, mask=img.split()[3] if len(img.split()) == 4 else None)
            else:
                rgb_img.paste(img)
            img = rgb_img

        # Save to temporary file
        filename = generate_unique_filename("barcode.png")
        file_path = TEMP_DIR / filename

        # Save image with high quality (PNG is lossless, perfect for barcodes)
        img.save(file_path, "PNG", optimize=True)

        # Return response with download URL
        return BarcodeResponse(
            success=True,
            message=f"Barcode ({barcode_type}) generated successfully",
            barcode_url=f"/api/v1/download/{filename}",
            filename=filename,
        )

    except Exception as e:
        return BarcodeResponse(
            success=False,
            message=f"Error generating barcode: {str(e)}",
        )
