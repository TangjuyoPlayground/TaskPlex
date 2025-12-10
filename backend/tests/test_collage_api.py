"""
Tests for collage API endpoint
"""

import io
from pathlib import Path

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app

client = TestClient(app)


def create_test_image_bytes(size=(100, 100), color="red"):
    """Create a test image as bytes"""
    img = Image.new("RGB", size, color=color)
    img_bytes = io.BytesIO()
    img.save(img_bytes, format="PNG")
    img_bytes.seek(0)
    return img_bytes.read()


def test_create_collage_success():
    """Test successful collage creation"""
    # Create 4 test images
    images = []
    for i in range(4):
        img_bytes = create_test_image_bytes(size=(100, 100), color="red")
        images.append(("files", (f"image_{i}.png", img_bytes, "image/png")))

    response = client.post(
        "/api/v1/image/collage",
        files=images,
        data={
            "rows": "2",
            "cols": "2",
            "image_order": "0,1,2,3",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "collage" in data["filename"].lower()
    assert data["download_url"] is not None
    assert data["dimensions"] is not None
    assert data["dimensions"]["width"] == 1600
    assert data["dimensions"]["height"] == 1600


def test_create_collage_invalid_rows():
    """Test collage creation with invalid rows"""
    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/v1/image/collage",
        files=[("files", ("image.png", img_bytes, "image/png"))],
        data={
            "rows": "0",
            "cols": "2",
            "image_order": "0,0",
        },
    )

    assert response.status_code == 400
    assert "rows" in response.json()["detail"].lower()


def test_create_collage_invalid_cols():
    """Test collage creation with invalid columns"""
    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/v1/image/collage",
        files=[("files", ("image.png", img_bytes, "image/png"))],
        data={
            "rows": "2",
            "cols": "11",
            "image_order": "0,0",
        },
    )

    assert response.status_code == 400
    assert "columns" in response.json()["detail"].lower()


def test_create_collage_no_images():
    """Test collage creation with no images"""
    response = client.post(
        "/api/v1/image/collage",
        files=[],
        data={
            "rows": "2",
            "cols": "2",
            "image_order": "0,1,2,3",
        },
    )

    # FastAPI returns 422 for validation errors (empty file list)
    assert response.status_code in [400, 422]


def test_create_collage_invalid_order_format():
    """Test collage creation with invalid order format"""
    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/v1/image/collage",
        files=[("files", ("image.png", img_bytes, "image/png"))],
        data={
            "rows": "1",
            "cols": "1",
            "image_order": "invalid",
        },
    )

    assert response.status_code == 400
    assert "invalid" in response.json()["detail"].lower()


def test_create_collage_wrong_order_length():
    """Test collage creation with wrong order length"""
    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/v1/image/collage",
        files=[("files", ("image.png", img_bytes, "image/png"))],
        data={
            "rows": "2",
            "cols": "2",
            "image_order": "0,1",  # Should be 4 elements
        },
    )

    assert response.status_code == 400
    assert "4 elements" in response.json()["detail"]


def test_create_collage_invalid_image_index():
    """Test collage creation with invalid image index"""
    img_bytes = create_test_image_bytes()
    response = client.post(
        "/api/v1/image/collage",
        files=[("files", ("image.png", img_bytes, "image/png"))],
        data={
            "rows": "1",
            "cols": "1",
            "image_order": "5",  # Only 1 image (index 0)
        },
    )

    assert response.status_code == 400
    assert "invalid image index" in response.json()["detail"].lower()


def test_create_collage_3x3_grid():
    """Test creating a 3x3 collage"""
    # Create 9 test images
    images = []
    for i in range(9):
        img_bytes = create_test_image_bytes(size=(100, 100), color="blue")
        images.append(("files", (f"image_{i}.png", img_bytes, "image/png")))

    response = client.post(
        "/api/v1/image/collage",
        files=images,
        data={
            "rows": "3",
            "cols": "3",
            "image_order": ",".join(map(str, range(9))),
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["dimensions"]["width"] == 2400
    assert data["dimensions"]["height"] == 2400
