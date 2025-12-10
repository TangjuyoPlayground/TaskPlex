"""
Tests for barcode generation service
"""

from pathlib import Path

import pytest

from app.services.barcode_service import generate_barcode


def test_generate_barcode_code128_success(tmp_path: Path):
    """Test successful Code128 barcode generation"""
    output_path = tmp_path / "barcode.png"

    result = generate_barcode(
        data="123456789012",
        barcode_type="code128",
        width=2.0,
        height=50.0,
        add_checksum=True,
    )

    assert result.success is True
    assert result.barcode_url is not None
    assert result.filename is not None
    assert "barcode" in result.filename.lower()
    assert result.message is not None


def test_generate_barcode_code39_success(tmp_path: Path):
    """Test successful Code39 barcode generation"""
    result = generate_barcode(
        data="TEST123",
        barcode_type="code39",
        width=2.0,
        height=50.0,
        add_checksum=True,
    )

    assert result.success is True
    assert result.barcode_url is not None
    assert result.filename is not None


def test_generate_barcode_ean13_success(tmp_path: Path):
    """Test successful EAN-13 barcode generation"""
    result = generate_barcode(
        data="1234567890128",  # Valid EAN-13 with checksum
        barcode_type="ean13",
        width=2.0,
        height=50.0,
        add_checksum=True,
    )

    assert result.success is True
    assert result.barcode_url is not None


def test_generate_barcode_ean8_success(tmp_path: Path):
    """Test successful EAN-8 barcode generation"""
    result = generate_barcode(
        data="12345670",  # Valid EAN-8 with checksum
        barcode_type="ean8",
        width=2.0,
        height=50.0,
        add_checksum=True,
    )

    assert result.success is True
    assert result.barcode_url is not None


def test_generate_barcode_upca_success(tmp_path: Path):
    """Test successful UPC-A barcode generation"""
    result = generate_barcode(
        data="012345678905",  # Valid UPC-A with checksum
        barcode_type="upca",
        width=2.0,
        height=50.0,
        add_checksum=True,
    )

    assert result.success is True
    assert result.barcode_url is not None


def test_generate_barcode_unsupported_type():
    """Test barcode generation with unsupported type"""
    result = generate_barcode(
        data="123456",
        barcode_type="invalid_type",
        width=2.0,
        height=50.0,
        add_checksum=True,
    )

    assert result.success is False
    assert "unsupported" in result.message.lower()


def test_generate_barcode_invalid_data():
    """Test barcode generation with invalid data for EAN-13"""
    result = generate_barcode(
        data="123",  # Too short for EAN-13
        barcode_type="ean13",
        width=2.0,
        height=50.0,
        add_checksum=True,
    )

    assert result.success is False
    assert "invalid" in result.message.lower()


def test_generate_barcode_custom_dimensions():
    """Test barcode generation with custom dimensions"""
    result = generate_barcode(
        data="123456789012",
        barcode_type="code128",
        width=3.0,
        height=75.0,
        add_checksum=False,
    )

    assert result.success is True
    assert result.barcode_url is not None


def test_generate_barcode_isbn13_success():
    """Test successful ISBN-13 barcode generation"""
    result = generate_barcode(
        data="9780123456789",  # Valid ISBN-13
        barcode_type="isbn13",
        width=2.0,
        height=50.0,
        add_checksum=True,
    )

    assert result.success is True
    assert result.barcode_url is not None


def test_generate_barcode_isbn10_success():
    """Test successful ISBN-10 barcode generation"""
    result = generate_barcode(
        data="0123456789",  # Valid ISBN-10
        barcode_type="isbn10",
        width=2.0,
        height=50.0,
        add_checksum=True,
    )

    assert result.success is True
    assert result.barcode_url is not None
