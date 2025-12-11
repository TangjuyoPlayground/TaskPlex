"""
Accent remover service
"""

import unicodedata

from app.models.accent_remover import AccentRemoverRequest, AccentRemoverResponse


def remove_accents(request: AccentRemoverRequest) -> AccentRemoverResponse:
    """
    Remove accents from text

    Args:
        request: AccentRemoverRequest with text to process

    Returns:
        AccentRemoverResponse with text without accents
    """
    if not request.text or not request.text.strip():
        return AccentRemoverResponse(
            success=False,
            message="Text cannot be empty",
        )

    try:
        original_text = request.text

        # Normalize to NFD (decomposed form) and remove combining characters (accents)
        # NFD = Normalization Form Decomposed
        # This separates base characters from their combining marks (accents)
        normalized = unicodedata.normalize("NFD", original_text)

        # Count combining characters (accents, diacritics) before removal
        # Characters with category "Mn" (Nonspacing Mark) are accents
        removed_count = sum(1 for char in normalized if unicodedata.category(char) == "Mn")

        # Remove combining characters (accents, diacritics)
        result_text = "".join(char for char in normalized if unicodedata.category(char) != "Mn")

        # Handle special case: German eszett (ß) -> ss
        # This is not a combining character, so it needs special handling
        if "ß" in result_text:
            result_text = result_text.replace("ß", "ss")

        return AccentRemoverResponse(
            success=True,
            message=f"Successfully removed accents from text",
            original_text=original_text,
            result_text=result_text,
            removed_count=removed_count,
        )

    except Exception as e:
        return AccentRemoverResponse(
            success=False,
            message=f"Error removing accents: {str(e)}",
        )
