"""
JSON validator API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.json_validator import JSONValidationRequest, JSONValidationResponse
from app.services.json_validator_service import validate_json

router = APIRouter(prefix="/json-validator", tags=["JSON Validator"])


@router.post("/validate", response_model=JSONValidationResponse)
async def validate_json_endpoint(request: JSONValidationRequest):
    """
    Validate JSON content and return syntax errors
    """
    result = validate_json(request.json)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
