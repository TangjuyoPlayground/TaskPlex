"""
Tests for extract_colors endpoint
"""

from pathlib import Path
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestExtractColorsEndpoint:
    """Tests for /api/v1/image/extract-colors endpoint"""

    @patch("app.api.image.extract_colors")
    @patch("app.api.image.save_upload_file")
    def test_extract_colors_success(self, mock_save, mock_extract):
        """Test successful color extraction"""
        test_file = Path(__file__).parent / "test_data" / "test_image.png"
        test_file.parent.mkdir(exist_ok=True)

        if not test_file.exists():
            from PIL import Image

            img = Image.new("RGB", (10, 10), color="red")
            img.save(test_file)

        mock_save.return_value = test_file
        mock_extract.return_value = MagicMock(
            success=True,
            message="Colors extracted successfully",
            filename="test_image.png",
            colors=[{"hex": "#ff0000", "ratio": 1.0}],
        )

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/extract-colors",
                files={"file": ("test_image.png", f, "image/png")},
                data={"max_colors": 3},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["colors"][0]["hex"] == "#ff0000"

    def test_extract_colors_invalid_max(self):
        """Test invalid max_colors parameter"""
        test_file = Path(__file__).parent / "test_data" / "test_image.png"
        test_file.parent.mkdir(exist_ok=True)

        if not test_file.exists():
            from PIL import Image

            img = Image.new("RGB", (10, 10), color="red")
            img.save(test_file)

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/extract-colors",
                files={"file": ("test_image.png", f, "image/png")},
                data={"max_colors": 0},
            )

        assert response.status_code == 400
        assert "max_colors" in response.json()["detail"]

    def test_extract_colors_invalid_format(self):
        """Test invalid file format"""
        test_file = Path(__file__).parent / "test_data" / "test.txt"
        test_file.parent.mkdir(exist_ok=True)
        test_file.write_text("not an image")

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/extract-colors",
                files={"file": ("test.txt", f, "text/plain")},
                data={"max_colors": 3},
            )

        assert response.status_code == 400
        assert "Unsupported" in response.json()["detail"]

    @patch("app.api.image.extract_colors")
    @patch("app.api.image.save_upload_file")
    def test_extract_colors_failure(self, mock_save, mock_extract):
        """Test service failure returns 500"""
        test_file = Path(__file__).parent / "test_data" / "test_image.png"
        test_file.parent.mkdir(exist_ok=True)

        if not test_file.exists():
            from PIL import Image

            img = Image.new("RGB", (10, 10), color="red")
            img.save(test_file)

        mock_save.return_value = test_file
        mock_extract.return_value = MagicMock(
            success=False,
            message="Error extracting colors",
            filename="test_image.png",
            colors=[],
        )

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/extract-colors",
                files={"file": ("test_image.png", f, "image/png")},
                data={"max_colors": 3},
            )

        assert response.status_code == 500
        assert "Error" in response.json()["detail"]
