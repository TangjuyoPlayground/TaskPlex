"""
Basic tests for unit conversion endpoint
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_length_conversion():
    """Test length unit conversion"""
    payload = {
        "value": 100,
        "from_unit": "meter",
        "to_unit": "feet"
    }
    response = client.post("/api/v1/units/convert", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["original_value"] == 100
    assert data["original_unit"] == "meter"
    assert data["converted_unit"] == "feet"
    assert data["converted_value"] > 0


def test_temperature_conversion():
    """Test temperature unit conversion"""
    payload = {
        "value": 100,
        "from_unit": "celsius",
        "to_unit": "fahrenheit"
    }
    response = client.post("/api/v1/units/convert", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["converted_value"] == 212.0  # 100°C = 212°F


def test_mass_conversion():
    """Test mass unit conversion"""
    payload = {
        "value": 1,
        "from_unit": "kilogram",
        "to_unit": "pound"
    }
    response = client.post("/api/v1/units/convert", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["converted_value"] > 2  # 1 kg ≈ 2.2 lbs


def test_incompatible_units():
    """Test conversion between incompatible units"""
    payload = {
        "value": 100,
        "from_unit": "meter",
        "to_unit": "kilogram"
    }
    response = client.post("/api/v1/units/convert", json=payload)
    assert response.status_code == 400


def test_invalid_unit():
    """Test conversion with invalid unit"""
    payload = {
        "value": 100,
        "from_unit": "invalid_unit",
        "to_unit": "meter"
    }
    response = client.post("/api/v1/units/convert", json=payload)
    assert response.status_code == 400

