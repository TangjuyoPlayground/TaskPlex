"""
Case converter service
"""

import re

from app.models.case_converter import CaseConverterRequest, CaseConverterResponse, CaseType


def convert_case(request: CaseConverterRequest) -> CaseConverterResponse:
    """
    Convert text to different case formats

    Args:
        request: CaseConverterRequest with text and target case type

    Returns:
        CaseConverterResponse with converted text
    """
    if not request.text or not request.text.strip():
        return CaseConverterResponse(
            success=False,
            message="Text cannot be empty",
        )

    try:
        original_text = request.text
        result_text = ""

        if request.case_type == CaseType.LOWERCASE:
            result_text = original_text.lower()

        elif request.case_type == CaseType.UPPERCASE:
            result_text = original_text.upper()

        elif request.case_type == CaseType.TITLE_CASE:
            # Title Case: First letter of each word is capitalized
            result_text = original_text.title()

        elif request.case_type == CaseType.SENTENCE_CASE:
            # Sentence case: First letter of first word in each sentence is capitalized
            sentences = re.split(r"([.!?]\s*)", original_text)
            result_text = ""
            for i, sentence in enumerate(sentences):
                if sentence.strip():
                    # Capitalize first letter of sentence
                    result_text += (
                        sentence[0].upper() + sentence[1:].lower()
                        if len(sentence) > 0
                        else sentence
                    )
                else:
                    result_text += sentence

        elif request.case_type == CaseType.CAMEL_CASE:
            # camelCase: first word lowercase, subsequent words capitalized
            words = re.split(r"[\s\-_]+", original_text)
            if not words:
                result_text = ""
            else:
                result_text = words[0].lower()
                for word in words[1:]:
                    if word:
                        result_text += word[0].upper() + word[1:].lower()

        elif request.case_type == CaseType.PASCAL_CASE:
            # PascalCase: First letter of each word is capitalized
            words = re.split(r"[\s\-_]+", original_text)
            result_text = "".join(word[0].upper() + word[1:].lower() for word in words if word)

        elif request.case_type == CaseType.SNAKE_CASE:
            # snake_case: words separated by underscores, all lowercase
            words = re.split(r"[\s\-]+", original_text)
            result_text = "_".join(word.lower() for word in words if word.strip())

        elif request.case_type == CaseType.KEBAB_CASE:
            # kebab-case: words separated by hyphens, all lowercase
            words = re.split(r"[\s_]+", original_text)
            result_text = "-".join(word.lower() for word in words if word.strip())

        else:
            return CaseConverterResponse(
                success=False,
                message=f"Unsupported case type: {request.case_type}",
            )

        return CaseConverterResponse(
            success=True,
            message=f"Text converted to {request.case_type.value} successfully",
            original_text=original_text,
            result_text=result_text,
            case_type=request.case_type.value,
        )

    except Exception as e:
        return CaseConverterResponse(
            success=False,
            message=f"Error converting case: {str(e)}",
        )
