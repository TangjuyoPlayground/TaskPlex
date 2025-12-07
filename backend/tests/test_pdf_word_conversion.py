"""
Tests for PDF <-> Word conversions
"""

from pathlib import Path
from unittest.mock import MagicMock, patch

from docx import Document
from fastapi.testclient import TestClient
import fitz

from app.main import app

client = TestClient(app)


def create_dummy_pdf(path: Path, text: str = "Hello PDF"):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_textbox(fitz.Rect(72, 72, 540, 770), text, fontsize=12, fontname="helv")
    doc.save(path)
    doc.close()


def create_dummy_docx(path: Path, text: str = "Hello DOCX"):
    doc = Document()
    doc.add_paragraph(text)
    doc.save(path)


class TestPdfToWord:
    @patch("app.api.pdf.convert_pdf_to_word")
    @patch("app.api.pdf.save_upload_file")
    def test_pdf_to_word_success(self, mock_save, mock_convert):
        pdf_path = Path(__file__).parent / "test_data" / "sample.pdf"
        pdf_path.parent.mkdir(exist_ok=True)
        if not pdf_path.exists():
            create_dummy_pdf(pdf_path)

        mock_save.return_value = pdf_path
        mock_convert.return_value = MagicMock(
            success=True,
            message="PDF converted to Word successfully",
            filename="sample.docx",
            download_url="/api/v1/download/sample.docx",
            total_pages=1,
        )

        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/v1/pdf/to-word",
                files={"file": ("sample.pdf", f, "application/pdf")},
            )

        assert response.status_code == 200
        assert response.json()["success"] is True

    def test_pdf_to_word_invalid_format(self):
        txt_path = Path(__file__).parent / "test_data" / "not_pdf.txt"
        txt_path.parent.mkdir(exist_ok=True)
        txt_path.write_text("not a pdf")

        with open(txt_path, "rb") as f:
            response = client.post(
                "/api/v1/pdf/to-word",
                files={"file": ("not_pdf.txt", f, "text/plain")},
            )

        assert response.status_code == 400


class TestWordToPdf:
    @patch("app.api.pdf.convert_word_to_pdf")
    @patch("app.api.pdf.save_upload_file")
    def test_word_to_pdf_success(self, mock_save, mock_convert):
        docx_path = Path(__file__).parent / "test_data" / "sample.docx"
        docx_path.parent.mkdir(exist_ok=True)
        if not docx_path.exists():
            create_dummy_docx(docx_path)

        mock_save.return_value = docx_path
        mock_convert.return_value = MagicMock(
            success=True,
            message="Word converted to PDF successfully",
            filename="sample.pdf",
            download_url="/api/v1/download/sample.pdf",
            processed_size=123,
        )

        with open(docx_path, "rb") as f:
            response = client.post(
                "/api/v1/pdf/word-to-pdf",
                files={
                    "file": (
                        "sample.docx",
                        f,
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    )
                },
            )

        assert response.status_code == 200
        assert response.json()["success"] is True

    def test_word_to_pdf_invalid_format(self):
        pdf_path = Path(__file__).parent / "test_data" / "bad.pdf"
        pdf_path.parent.mkdir(exist_ok=True)
        create_dummy_pdf(pdf_path)

        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/v1/pdf/word-to-pdf",
                files={"file": ("bad.pdf", f, "application/pdf")},
            )

        assert response.status_code == 400

    def test_word_to_pdf_contains_text(self):
        docx_path = Path(__file__).parent / "test_data" / "sample_content.docx"
        docx_path.parent.mkdir(exist_ok=True)
        create_dummy_docx(docx_path, text="Hello content")

        output_pdf = Path(__file__).parent / "test_data" / "out.pdf"
        if output_pdf.exists():
            output_pdf.unlink()

        from app.services.pdf_service import convert_word_to_pdf

        result = convert_word_to_pdf(docx_path, output_pdf)
        assert result.success is True
        assert output_pdf.exists()

        with fitz.open(output_pdf) as pdf_doc:
            extracted = "\n".join(page.get_text() for page in pdf_doc)
            assert "Hello content" in extracted

        output_pdf.unlink(missing_ok=True)
