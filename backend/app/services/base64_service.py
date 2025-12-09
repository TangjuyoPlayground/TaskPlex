"""
Service utilities for Base64 encoding/decoding
"""

import base64

from app.models.base64_model import Base64Response


def encode_base64(text: str) -> Base64Response:
    try:
        encoded = base64.b64encode(text.encode("utf-8")).decode("ascii")
        return Base64Response(success=True, message="Encoded successfully", result=encoded)
    except Exception as exc:
        return Base64Response(success=False, message=f"Error encoding: {exc}", result="")


def decode_base64(text: str) -> Base64Response:
    try:
        decoded = base64.b64decode(text.encode("utf-8"), validate=True).decode("utf-8")
        return Base64Response(success=True, message="Decoded successfully", result=decoded)
    except Exception as exc:
        return Base64Response(success=False, message=f"Error decoding: {exc}", result="")

