"""
Unit conversion service using Pint library
"""
from pint import UnitRegistry, DimensionalityError, UndefinedUnitError
from app.models.units import UnitConversionResponse

# Initialize unit registry
ureg = UnitRegistry()


def convert_units(value: float, from_unit: str, to_unit: str) -> UnitConversionResponse:
    """
    Convert a value from one unit to another
    
    Args:
        value: Value to convert
        from_unit: Source unit
        to_unit: Target unit
        
    Returns:
        UnitConversionResponse with conversion result
    """
    try:
        # Create quantity with source unit
        quantity = value * ureg(from_unit)
        
        # Convert to target unit
        converted = quantity.to(to_unit)
        
        return UnitConversionResponse(
            success=True,
            message="Unit conversion successful",
            original_value=value,
            original_unit=from_unit,
            converted_value=float(converted.magnitude),
            converted_unit=to_unit,
            conversion_formula=f"1 {from_unit} = {(1 * ureg(from_unit)).to(to_unit).magnitude} {to_unit}"
        )
    
    except DimensionalityError:
        return UnitConversionResponse(
            success=False,
            message=f"Cannot convert from '{from_unit}' to '{to_unit}': incompatible dimensions",
            original_value=value,
            original_unit=from_unit
        )
    
    except UndefinedUnitError as e:
        return UnitConversionResponse(
            success=False,
            message=f"Undefined unit: {str(e)}",
            original_value=value,
            original_unit=from_unit
        )
    
    except Exception as e:
        return UnitConversionResponse(
            success=False,
            message=f"Error converting units: {str(e)}",
            original_value=value,
            original_unit=from_unit
        )

