"""
JavaScript validation service
"""

try:
    import jsbeautifier

    JS_BEAUTIFIER_AVAILABLE = True
except ImportError:
    JS_BEAUTIFIER_AVAILABLE = False

from app.models.js_validator import JSError, JSValidationResponse


def validate_javascript(javascript: str) -> JSValidationResponse:
    """
    Validate JavaScript code by attempting to parse it

    Args:
        javascript: JavaScript code to validate

    Returns:
        JSValidationResponse with validation results
    """
    if not javascript or not javascript.strip():
        return JSValidationResponse(
            success=False,
            message="JavaScript cannot be empty",
            valid=False,
            errors=[JSError(message="JavaScript input is empty")],
        )

    if not JS_BEAUTIFIER_AVAILABLE:
        return JSValidationResponse(
            success=False,
            message="jsbeautifier not available. Please install: pip install jsbeautifier",
            valid=False,
            errors=[JSError(message="jsbeautifier library not available")],
        )

    try:
        # Try to beautify the code - this will fail if syntax is invalid
        jsbeautifier.beautify(javascript)

        return JSValidationResponse(
            success=True,
            message="JavaScript is valid",
            valid=True,
            errors=[],
        )
    except Exception as e:
        error_message = str(e)
        # Try to extract line number from error message if available
        line = None
        column = None

        # Some error messages contain line information
        if "line" in error_message.lower():
            try:
                # Try to extract line number from error message
                import re

                line_match = re.search(r"line\s+(\d+)", error_message, re.IGNORECASE)
                if line_match:
                    line = int(line_match.group(1))
            except (ValueError, AttributeError):
                pass

        return JSValidationResponse(
            success=True,
            message=f"JavaScript validation failed: {error_message}",
            valid=False,
            errors=[
                JSError(
                    message=error_message,
                    line=line,
                    column=column,
                )
            ],
        )
