"""
JavaScript validator API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.js_validator import JSValidationRequest, JSValidationResponse
from app.services.js_validator_service import validate_javascript

router = APIRouter(prefix="/js-validator", tags=["JavaScript Validator"])


@router.post("/validate", response_model=JSValidationResponse)
async def validate_javascript_endpoint(request: JSValidationRequest):
    """
    Validate JavaScript code and return syntax errors
    """
    result = validate_javascript(request.javascript)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
