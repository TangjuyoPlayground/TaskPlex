"""
Tests for /api/v1/video/to-gif endpoint
"""

from pathlib import Path
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestVideoToGifEndpoint:
    """Tests for GIF conversion endpoint"""

    @patch("app.api.video.video_to_gif")
    @patch("app.api.video.save_upload_file")
    def test_video_to_gif_success(self, mock_save, mock_convert):
        """Convert a valid video to GIF"""
        test_file = Path(__file__).parent / "test_data" / "test_video.mp4"
        test_file.parent.mkdir(exist_ok=True)
        if not test_file.exists():
            test_file.write_bytes(b"fake video content")

        mock_save.return_value = test_file
        mock_convert.return_value = MagicMock(
            success=True,
            message="GIF created successfully",
            filename="gif_test_video.gif",
            download_url="/api/v1/download/gif_test_video.gif",
            original_size=1000,
            processed_size=200,
        )

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/video/to-gif",
                files={"file": ("test_video.mp4", f, "video/mp4")},
                data={"start_time": 0, "duration": 1.5, "width": 320, "fps": 12, "loop": True},
            )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["filename"] == "gif_test_video.gif"

    @patch("app.api.video.save_upload_file")
    def test_video_to_gif_invalid_format(self, mock_save):
        """Reject unsupported video formats"""
        test_file = Path(__file__).parent / "test_data" / "test.txt"
        test_file.parent.mkdir(exist_ok=True)
        test_file.write_text("not a video")
        mock_save.return_value = test_file

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/video/to-gif",
                files={"file": ("test.txt", f, "text/plain")},
                data={"fps": 12},
            )

        assert response.status_code == 400
        assert "unsupported" in response.json()["detail"].lower()

    @patch("app.api.video.save_upload_file")
    def test_video_to_gif_invalid_params(self, mock_save):
        """Reject invalid fps parameter"""
        test_file = Path(__file__).parent / "test_data" / "test_video.mp4"
        test_file.parent.mkdir(exist_ok=True)
        if not test_file.exists():
            test_file.write_bytes(b"fake video content")

        mock_save.return_value = test_file

        with open(test_file, "rb") as f:
            response = client.post(
                "/api/v1/video/to-gif",
                files={"file": ("test_video.mp4", f, "video/mp4")},
                data={"fps": 0},
            )

        assert response.status_code == 400
        assert "fps" in response.json()["detail"].lower()
