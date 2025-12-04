"""
Tests for resize_image endpoint
"""

from pathlib import Path
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
import pytest

from app.main import app

client = TestClient(app)


class TestResizeImageEndpoint:
    """Tests for /api/v1/image/resize endpoint"""

    @patch("app.api.image.resize_image")
    @patch("app.api.image.save_upload_file")
    def test_resize_image_success_width_only(self, mock_save, mock_resize):
        """Test successful image resizing with width only"""
        # Create a temporary test image file
        test_file = Path(__file__).parent / "test_data" / "test_image.png"
        test_file.parent.mkdir(exist_ok=True)

        # Create a simple test image if it doesn't exist
        if not test_file.exists():
            from PIL import Image

            img = Image.new("RGB", (100, 100), color="red")
            img.save(test_file)

        mock_save.return_value = test_file
        mock_resize.return_value = MagicMock(
            success=True,
            message="Image resized to 200x200 successfully",
            filename="resized_test_image.png",
            download_url="/api/v1/download/resized_test_image.png",
            original_size=1000,
            processed_size=1200,
            dimensions={"width": 200, "height": 200},
        )

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/resize",
                files={"file": ("test_image.png", f, "image/png")},
                data={"width": 200, "maintain_aspect_ratio": True},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "resized" in data["message"].lower()
        assert data["filename"] == "resized_test_image.png"

    @patch("app.api.image.resize_image")
    @patch("app.api.image.save_upload_file")
    def test_resize_image_success_both_dimensions(self, mock_save, mock_resize):
        """Test successful image resizing with both width and height"""
        test_file = Path(__file__).parent / "test_data" / "test_image.png"
        test_file.parent.mkdir(exist_ok=True)

        if not test_file.exists():
            from PIL import Image

            img = Image.new("RGB", (100, 100), color="red")
            img.save(test_file)

        mock_save.return_value = test_file
        mock_resize.return_value = MagicMock(
            success=True,
            message="Image resized to 300x400 successfully",
            filename="resized_test_image.png",
            download_url="/api/v1/download/resized_test_image.png",
            original_size=1000,
            processed_size=1500,
            dimensions={"width": 300, "height": 400},
        )

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/resize",
                files={"file": ("test_image.png", f, "image/png")},
                data={"width": 300, "height": 400, "maintain_aspect_ratio": True},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @patch("app.api.image.save_upload_file")
    def test_resize_image_no_dimensions(self, mock_save):
        """Test resize with no dimensions specified"""
        test_file = Path(__file__).parent / "test_data" / "test_image.png"
        test_file.parent.mkdir(exist_ok=True)

        if not test_file.exists():
            from PIL import Image

            img = Image.new("RGB", (100, 100), color="red")
            img.save(test_file)

        mock_save.return_value = test_file

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/resize",
                files={"file": ("test_image.png", f, "image/png")},
                data={},  # No dimensions
            )

        assert response.status_code == 400
        assert "dimension" in response.json()["detail"].lower()

    @patch("app.api.image.save_upload_file")
    def test_resize_image_invalid_width(self, mock_save):
        """Test resize with invalid width"""
        test_file = Path(__file__).parent / "test_data" / "test_image.png"
        test_file.parent.mkdir(exist_ok=True)

        if not test_file.exists():
            from PIL import Image

            img = Image.new("RGB", (100, 100), color="red")
            img.save(test_file)

        mock_save.return_value = test_file

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/resize",
                files={"file": ("test_image.png", f, "image/png")},
                data={"width": -100},
            )

        assert response.status_code == 400
        assert "positive" in response.json()["detail"].lower()

    @patch("app.api.image.save_upload_file")
    def test_resize_image_invalid_resample(self, mock_save):
        """Test resize with invalid resample algorithm"""
        test_file = Path(__file__).parent / "test_data" / "test_image.png"
        test_file.parent.mkdir(exist_ok=True)

        if not test_file.exists():
            from PIL import Image

            img = Image.new("RGB", (100, 100), color="red")
            img.save(test_file)

        mock_save.return_value = test_file

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/resize",
                files={"file": ("test_image.png", f, "image/png")},
                data={"width": 200, "resample": "invalid"},
            )

        assert response.status_code == 400
        assert (
            "resample" in response.json()["detail"].lower()
            or "algorithm" in response.json()["detail"].lower()
        )

    @patch("app.api.image.save_upload_file")
    def test_resize_image_invalid_format(self, mock_save):
        """Test resize with invalid file format"""
        test_file = Path(__file__).parent / "test_data" / "test.txt"
        test_file.parent.mkdir(exist_ok=True)
        test_file.write_text("not an image")
        mock_save.return_value = test_file

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/resize",
                files={"file": ("test.txt", f, "text/plain")},
                data={"width": 200},
            )

        assert response.status_code == 400
        assert "Unsupported" in response.json()["detail"]
