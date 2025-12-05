import io
from pathlib import Path
from unittest.mock import patch

from PIL import Image
import pytest

from app.services.image_service import (
    compress_image,
    convert_image,
    extract_colors,
    resize_image,
    rotate_image,
)


def create_temp_image(path: Path, size=(100, 50), color="red", mode="RGB"):
    img = Image.new(mode, size, color=color)
    img.save(path)
    return path


def test_compress_image_success(tmp_path: Path):
    input_path = tmp_path / "input.png"
    output_path = tmp_path / "output.jpg"
    create_temp_image(input_path, size=(120, 80), color="red")

    result = compress_image(input_path, output_path, quality="low")

    assert result.success is True
    assert result.filename == output_path.name
    assert result.download_url.endswith(output_path.name)
    assert result.processed_size is not None
    assert result.original_size is not None
    assert result.compression_ratio is not None
    assert result.dimensions == {"width": 120, "height": 80}
    assert output_path.exists()


def test_convert_image_success(tmp_path: Path):
    input_path = tmp_path / "input.png"
    output_path = tmp_path / "output.jpg"
    create_temp_image(input_path, size=(64, 64), color="blue")

    result = convert_image(input_path, output_path, output_format="jpg", quality="high")

    assert result.success is True
    assert result.filename.endswith(".jpg")
    assert result.download_url.endswith(".jpg")
    assert result.dimensions == {"width": 64, "height": 64}
    assert output_path.exists()


def test_rotate_image_success(tmp_path: Path):
    input_path = tmp_path / "input.png"
    output_path = tmp_path / "rotated.png"
    create_temp_image(input_path, size=(10, 20), color="green")

    result = rotate_image(input_path, output_path, angle=90)

    assert result.success is True
    assert result.dimensions["width"] == 20
    assert result.dimensions["height"] == 10
    assert output_path.exists()


def test_resize_image_maintain_aspect_ratio(tmp_path: Path):
    input_path = tmp_path / "input.png"
    output_path = tmp_path / "resized.png"
    create_temp_image(input_path, size=(200, 100), color="purple")

    result = resize_image(
        input_path,
        output_path,
        width=100,
        height=None,
        maintain_aspect_ratio=True,
        resample="lanczos",
    )

    assert result.success is True
    assert result.dimensions == {"width": 100, "height": 50}
    assert output_path.exists()


def test_resize_image_no_dimensions(tmp_path: Path):
    input_path = tmp_path / "input.png"
    output_path = tmp_path / "resized.png"
    create_temp_image(input_path)

    result = resize_image(
        input_path,
        output_path,
        width=None,
        height=None,
        maintain_aspect_ratio=True,
        resample="lanczos",
    )

    assert result.success is False
    assert "dimension" in result.message.lower()


def test_resize_image_no_aspect(tmp_path: Path):
    input_path = tmp_path / "input.png"
    output_path = tmp_path / "resized.png"
    create_temp_image(input_path, size=(100, 50), color="orange")

    result = resize_image(
        input_path,
        output_path,
        width=30,
        height=40,
        maintain_aspect_ratio=False,
        resample="nearest",
    )

    assert result.success is True
    assert result.dimensions == {"width": 30, "height": 40}


def test_extract_colors_success(tmp_path: Path):
    input_path = tmp_path / "input.png"
    # Create a simple two-color image (half red, half blue)
    img = Image.new("RGB", (10, 10), color="red")
    for x in range(5, 10):
        for y in range(10):
            img.putpixel((x, y), (0, 0, 255))
    img.save(input_path)

    result = extract_colors(input_path, max_colors=2)

    assert result.success is True
    assert len(result.colors) <= 2
    hex_values = {c.hex for c in result.colors}
    assert "#ff0000" in hex_values or "#0000ff" in hex_values
    assert abs(sum(c.ratio for c in result.colors) - 1) < 0.01


def test_extract_colors_error(monkeypatch, tmp_path: Path):
    input_path = tmp_path / "input.png"
    create_temp_image(input_path)

    class DummyImage:
        def __enter__(self):  # pragma: no cover - used only for the error path
            raise OSError("boom")

        def __exit__(self, exc_type, exc_val, exc_tb):
            return False

    with patch("app.services.image_service.Image.open", return_value=DummyImage()):
        result = extract_colors(input_path, max_colors=3)

    assert result.success is False
    assert "error" in result.message.lower()
