"""
Python validator API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.py_validator import PyValidationRequest, PyValidationResponse
from app.services.py_validator_service import validate_python

router = APIRouter(prefix="/py-validator", tags=["Python Validator"])


@router.post("/validate", response_model=PyValidationResponse)
async def validate_python_endpoint(request: PyValidationRequest):
    """
    Validate Python code and return syntax errors
    """
    result = validate_python(request.python)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
