"""
Tests for image filter endpoint
"""

from pathlib import Path
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient
import pytest

from app.main import app

client = TestClient(app)


class TestFilterImageEndpoint:
    """Tests for /api/v1/image/filters endpoint"""

    @patch("app.api.image.apply_filter")
    @patch("app.api.image.save_upload_file")
    def test_filter_image_success(self, mock_save, mock_filter, tmp_path):
        """Test successful filter application"""
        from PIL import Image

        test_file = tmp_path / "test_image.png"
        img = Image.new("RGB", (32, 32), color="blue")
        img.save(test_file)

        mock_save.return_value = test_file
        mock_filter.return_value = MagicMock(
            success=True,
            message="Filter applied successfully",
            filename="filtered_test_image.png",
            download_url="/api/v1/download/filtered_test_image.png",
            original_size=50,
            processed_size=60,
            dimensions={"width": 32, "height": 32},
        )

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/filters",
                files={"file": ("test_image.png", f, "image/png")},
                data={"filter_name": "sepia"},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["filename"] == "filtered_test_image.png"

    def test_filter_image_invalid_filter(self, tmp_path):
        """Test filter with invalid filter name"""
        from PIL import Image

        test_file = tmp_path / "test_image.png"
        img = Image.new("RGB", (32, 32), color="blue")
        img.save(test_file)

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/filters",
                files={"file": ("test_image.png", f, "image/png")},
                data={"filter_name": "unknown"},
            )

        assert response.status_code == 400
        assert "Unsupported filter" in response.json()["detail"]

    def test_filter_image_invalid_format(self, tmp_path):
        """Test filter with invalid file format"""
        test_file = tmp_path / "test.txt"
        test_file.write_text("not an image")

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/filters",
                files={"file": ("test.txt", f, "text/plain")},
                data={"filter_name": "sepia"},
            )

        assert response.status_code == 400
        assert "Unsupported" in response.json()["detail"]

    @patch("app.api.image.apply_filter")
    @patch("app.api.image.save_upload_file")
    def test_filter_image_failure(self, mock_save, mock_filter, tmp_path):
        """Test filter failure handling"""
        from PIL import Image

        test_file = tmp_path / "test_image.png"
        img = Image.new("RGB", (32, 32), color="blue")
        img.save(test_file)

        mock_save.return_value = test_file
        mock_filter.return_value = MagicMock(
            success=False,
            message="Error applying filter",
            filename="filtered_test_image.png",
        )

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/image/filters",
                files={"file": ("test_image.png", f, "image/png")},
                data={"filter_name": "sepia"},
            )

        assert response.status_code == 500
        assert "Error" in response.json()["detail"]
