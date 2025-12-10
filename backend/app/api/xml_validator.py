"""
XML validator API endpoints
"""

from fastapi import APIRouter, HTTPException

from app.models.xml_validator import XMLValidationRequest, XMLValidationResponse
from app.services.xml_validator_service import validate_xml

router = APIRouter(prefix="/xml-validator", tags=["XML Validator"])


@router.post("/validate", response_model=XMLValidationResponse)
async def validate_xml_endpoint(request: XMLValidationRequest):
    """
    Validate XML content and return syntax errors
    """
    result = validate_xml(request.xml)

    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)

    return result
