"""
Async PDF OCR service with progress tracking
Uses Tesseract OCR with progress updates for real-time feedback
"""

import asyncio
from pathlib import Path
from typing import Optional

try:
    from pdf2image import convert_from_path
    import pytesseract

    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

from app.tasks.models import TaskResult
from app.tasks.store import task_store
from app.utils.file_handler import get_file_size


async def extract_text_with_ocr_async(
    task_id: str,
    input_path: Path,
    output_path: Path,
    language: str = "eng",
) -> TaskResult:
    """
    Extract text from PDF using OCR with real-time progress updates

    Progress is tracked by processing pages one by one
    """
    if not OCR_AVAILABLE:
        task_store.fail_task(
            task_id, "OCR dependencies not available. Please install pytesseract and pdf2image."
        )
        return TaskResult(
            success=False,
            error="OCR dependencies not available. Please install: pip install pytesseract pdf2image",
        )

    try:
        # Check if Tesseract is installed
        try:
            pytesseract.get_tesseract_version()
        except Exception as e:
            error_msg = (
                f"Tesseract OCR not found. Please install Tesseract on your system. Error: {str(e)}"
            )
            task_store.fail_task(task_id, error_msg)
            return TaskResult(success=False, error=error_msg)

        # Update task: Starting
        task_store.update_progress(task_id, 0, "Converting PDF to images...", "converting")

        # Convert PDF pages to images
        try:
            images = convert_from_path(str(input_path), dpi=300)
        except Exception as e:
            error_msg = str(e)
            if "poppler" in error_msg.lower() or "pdftoppm" in error_msg.lower():
                error_msg = "Poppler not installed. Please install poppler-utils (Linux) or poppler (macOS/Windows)."
            task_store.fail_task(task_id, error_msg)
            return TaskResult(success=False, error=error_msg)

        if not images:
            error_msg = "Could not convert PDF pages to images"
            task_store.fail_task(task_id, error_msg)
            return TaskResult(success=False, error=error_msg)

        total_pages = len(images)
        task_store.update_progress(
            task_id, 10, f"Processing {total_pages} page(s)...", "processing"
        )

        # Extract text from each page using OCR
        extracted_text = []
        for i, image in enumerate(images):
            # Update progress based on page number
            page_progress = 10 + int((i / total_pages) * 80)  # 10% to 90%
            task_store.update_progress(
                task_id,
                page_progress,
                f"Extracting text from page {i + 1}/{total_pages}...",
                "processing",
            )

            try:
                # Run OCR in executor to avoid blocking
                loop = asyncio.get_event_loop()
                text = await loop.run_in_executor(
                    None, pytesseract.image_to_string, image, language
                )

                if text.strip():
                    extracted_text.append(f"--- Page {i + 1} ---\n{text}\n")
            except Exception as e:
                # If OCR fails for a page, continue with other pages
                extracted_text.append(f"--- Page {i + 1} ---\n[OCR Error: {str(e)}]\n")

        if not extracted_text:
            error_msg = "No text could be extracted from the PDF"
            task_store.fail_task(task_id, error_msg)
            return TaskResult(success=False, error=error_msg)

        # Update progress: Writing file
        task_store.update_progress(task_id, 90, "Writing extracted text to file...", "finalizing")

        # Write extracted text to file
        full_text = "\n".join(extracted_text)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(full_text)

        # Get file size
        processed_size = get_file_size(output_path)

        # Update progress: Complete
        task_store.update_progress(
            task_id,
            100,
            f"Text extracted from {total_pages} page(s)",
            "completed",
        )

        # Create result object
        result = TaskResult(
            success=True,
            message=f"Text extracted from {total_pages} page(s)",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            processed_size=processed_size,
            total_pages=total_pages,
        )

        # Complete task with result
        task_store.complete_task(task_id, result)

        return result

    except Exception as e:
        error_msg = f"Error performing OCR: {str(e)}"
        task_store.fail_task(task_id, error_msg)
        return TaskResult(success=False, error=error_msg)
