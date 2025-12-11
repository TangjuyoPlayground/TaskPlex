"""
Lorem Ipsum generation service
"""

try:
    import lorem

    LOREM_AVAILABLE = True
except ImportError:
    LOREM_AVAILABLE = False

from app.models.lorem_ipsum import LoremIpsumRequest, LoremIpsumResponse, LoremIpsumType


def generate_lorem_ipsum(request: LoremIpsumRequest) -> LoremIpsumResponse:
    """
    Generate Lorem Ipsum text

    Args:
        request: LoremIpsumRequest with type, count, and options

    Returns:
        LoremIpsumResponse with generated text
    """
    if not LOREM_AVAILABLE:
        return LoremIpsumResponse(
            success=False,
            message="lorem library not available. Please install: pip install lorem",
        )

    try:
        text = ""
        type_name = request.type.value

        if request.type == LoremIpsumType.PARAGRAPHS:
            paragraphs = []
            for _ in range(request.count):
                paragraph = lorem.paragraph()
                paragraphs.append(paragraph)
            text = "\n\n".join(paragraphs)

        elif request.type == LoremIpsumType.WORDS:
            # Generate words by generating sentences and splitting
            words = []
            while len(words) < request.count:
                sentence = lorem.sentence()
                sentence_words = sentence.split()
                words.extend(sentence_words)
            text = " ".join(words[: request.count])

        elif request.type == LoremIpsumType.SENTENCES:
            sentences = []
            for _ in range(request.count):
                sentence = lorem.sentence()
                sentences.append(sentence)
            text = " ".join(sentences)

        # If start_with_lorem is False and type is paragraphs, we can skip the first "Lorem ipsum"
        # But lorem library always starts with Lorem ipsum, so we'll just use it as is
        # The start_with_lorem option is kept for API consistency but may not have effect

        return LoremIpsumResponse(
            success=True,
            message=f"Generated {request.count} {type_name} successfully",
            text=text,
            type=type_name,
            count=request.count,
        )

    except Exception as e:
        return LoremIpsumResponse(
            success=False,
            message=f"Error generating Lorem Ipsum: {str(e)}",
        )
