"""
XML validation service
"""

from typing import List
import xml.etree.ElementTree as ET
from xml.parsers.expat import ExpatError

from app.models.xml_validator import XMLError, XMLValidationResponse


def validate_xml(xml_content: str) -> XMLValidationResponse:
    """
    Validate XML content by parsing it

    Args:
        xml_content: XML string to validate

    Returns:
        XMLValidationResponse with validation results
    """
    if not xml_content or not xml_content.strip():
        return XMLValidationResponse(
            success=False,
            message="XML cannot be empty",
            valid=False,
            errors=[XMLError(message="XML input is empty")],
        )

    try:
        # Try to parse the XML
        ET.fromstring(xml_content)

        return XMLValidationResponse(
            success=True,
            message="XML is valid",
            valid=True,
            errors=[],
        )
    except ET.ParseError as e:
        # Extract error information
        error_message = str(e)
        line = getattr(e, "lineno", None)
        column = getattr(e, "offset", None)

        return XMLValidationResponse(
            success=True,
            message=f"XML validation failed: {error_message}",
            valid=False,
            errors=[
                XMLError(
                    message=error_message,
                    line=line,
                    column=column,
                )
            ],
        )
    except ExpatError as e:
        return XMLValidationResponse(
            success=True,
            message=f"XML validation failed: {str(e)}",
            valid=False,
            errors=[
                XMLError(
                    message=str(e),
                    line=getattr(e, "lineno", None),
                    column=getattr(e, "offset", None),
                )
            ],
        )
    except Exception as e:
        return XMLValidationResponse(
            success=False,
            message=f"Error validating XML: {str(e)}",
            valid=False,
            errors=[XMLError(message=str(e))],
        )
