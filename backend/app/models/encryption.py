"""
Pydantic models for file encryption/decryption
"""

from pydantic import BaseModel


class EncryptionResponse(BaseModel):
    """Response model for file encryption/decryption"""

    success: bool
    message: str
    filename: str = ""
    download_url: str = ""
    original_size: int | None = None
    processed_size: int | None = None
