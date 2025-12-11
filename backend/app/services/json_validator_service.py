"""
JSON validation service
"""

import json
from typing import List

from app.models.json_validator import JSONError, JSONValidationResponse


def validate_json(json_content: str) -> JSONValidationResponse:
    """
    Validate JSON content by parsing it

    Args:
        json_content: JSON string to validate

    Returns:
        JSONValidationResponse with validation results
    """
    if not json_content or not json_content.strip():
        return JSONValidationResponse(
            success=False,
            message="JSON cannot be empty",
            valid=False,
            errors=[JSONError(message="JSON input is empty")],
        )

    try:
        # Try to parse the JSON
        json.loads(json_content)

        return JSONValidationResponse(
            success=True,
            message="JSON is valid",
            valid=True,
            errors=[],
        )
    except json.JSONDecodeError as e:
        # Extract error information
        error_message = e.msg
        line = e.lineno
        column = e.colno

        return JSONValidationResponse(
            success=True,
            message=f"JSON validation failed: {error_message}",
            valid=False,
            errors=[
                JSONError(
                    message=error_message,
                    line=line,
                    column=column,
                )
            ],
        )
    except Exception as e:
        return JSONValidationResponse(
            success=False,
            message=f"Error validating JSON: {str(e)}",
            valid=False,
            errors=[JSONError(message=str(e))],
        )
