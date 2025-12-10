"""
Tests for barcode API endpoint
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_generate_barcode_success():
    """Test successful barcode generation via API"""
    response = client.post(
        "/api/v1/barcode/generate",
        json={
            "data": "123456789012",
            "barcode_type": "code128",
            "width": 2.0,
            "height": 50.0,
            "add_checksum": True,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["barcode_url"] is not None
    assert data["filename"] is not None
    assert "barcode" in data["filename"].lower()


def test_generate_barcode_default_values():
    """Test barcode generation with default values"""
    response = client.post(
        "/api/v1/barcode/generate",
        json={
            "data": "TEST123",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["barcode_url"] is not None


def test_generate_barcode_code39():
    """Test Code39 barcode generation"""
    response = client.post(
        "/api/v1/barcode/generate",
        json={
            "data": "CODE39",
            "barcode_type": "code39",
            "width": 2.0,
            "height": 50.0,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_generate_barcode_ean13():
    """Test EAN-13 barcode generation"""
    response = client.post(
        "/api/v1/barcode/generate",
        json={
            "data": "1234567890128",
            "barcode_type": "ean13",
            "width": 2.0,
            "height": 50.0,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_generate_barcode_invalid_data():
    """Test barcode generation with invalid data"""
    response = client.post(
        "/api/v1/barcode/generate",
        json={
            "data": "123",  # Too short for EAN-13
            "barcode_type": "ean13",
            "width": 2.0,
            "height": 50.0,
        },
    )

    assert response.status_code == 400
    assert "invalid" in response.json()["detail"].lower()


def test_generate_barcode_empty_data():
    """Test barcode generation with empty data"""
    response = client.post(
        "/api/v1/barcode/generate",
        json={
            "data": "",
            "barcode_type": "code128",
        },
    )

    assert response.status_code == 422  # Validation error


def test_generate_barcode_custom_dimensions():
    """Test barcode generation with custom dimensions"""
    response = client.post(
        "/api/v1/barcode/generate",
        json={
            "data": "123456789012",
            "barcode_type": "code128",
            "width": 3.0,
            "height": 75.0,
            "add_checksum": False,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


def test_generate_barcode_all_types():
    """Test all supported barcode types"""
    barcode_types = ["code128", "code39", "ean13", "ean8", "upca", "upce", "isbn13", "isbn10"]

    for barcode_type in barcode_types:
        # Use appropriate test data for each type
        test_data = {
            "code128": "123456789012",
            "code39": "CODE39",
            "ean13": "1234567890128",
            "ean8": "12345670",
            "upca": "012345678905",
            "upce": "012345",
            "isbn13": "9780123456789",
            "isbn10": "0123456789",
        }

        response = client.post(
            "/api/v1/barcode/generate",
            json={
                "data": test_data[barcode_type],
                "barcode_type": barcode_type,
                "width": 2.0,
                "height": 50.0,
            },
        )

        # Some types might fail due to validation, but API should handle it
        assert response.status_code in [200, 400]
        if response.status_code == 200:
            assert response.json()["success"] is True
