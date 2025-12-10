"""
Python validation service
"""

import ast
from typing import List

from app.models.py_validator import PyError, PyValidationResponse


def validate_python(python_code: str) -> PyValidationResponse:
    """
    Validate Python code by parsing it with AST

    Args:
        python_code: Python code to validate

    Returns:
        PyValidationResponse with validation results
    """
    if not python_code or not python_code.strip():
        return PyValidationResponse(
            success=False,
            message="Python code cannot be empty",
            valid=False,
            errors=[PyError(message="Python input is empty")],
        )

    try:
        # Try to parse the Python code using AST
        ast.parse(python_code)

        return PyValidationResponse(
            success=True,
            message="Python code is valid",
            valid=True,
            errors=[],
        )
    except SyntaxError as e:
        # Extract error information from SyntaxError
        error_message = e.msg
        line = e.lineno
        column = e.offset

        return PyValidationResponse(
            success=True,
            message=f"Python validation failed: {error_message}",
            valid=False,
            errors=[
                PyError(
                    message=error_message,
                    line=line,
                    column=column,
                )
            ],
        )
    except Exception as e:
        return PyValidationResponse(
            success=False,
            message=f"Error validating Python code: {str(e)}",
            valid=False,
            errors=[PyError(message=str(e))],
        )
