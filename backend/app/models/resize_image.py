"""
Resize image models
"""

from typing import Literal, Optional

from pydantic import BaseModel, Field


class ResizeImageRequest(BaseModel):
    """Request model for image resizing"""

    width: Optional[int] = Field(None, description="Target width in pixels (optional)")
    height: Optional[int] = Field(None, description="Target height in pixels (optional)")
    maintain_aspect_ratio: bool = Field(True, description="Maintain aspect ratio when resizing")
    resample: Literal["nearest", "bilinear", "bicubic", "lanczos"] = Field(
        "lanczos", description="Resampling algorithm for resizing"
    )
