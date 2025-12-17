"""
Unit tests for encryption service
"""

from pathlib import Path

import pytest

from app.services.encryption_service import decrypt_file, encrypt_file


def create_test_file(path: Path, content: bytes = b"test content"):
    """Create a test file with given content"""
    with open(path, "wb") as f:
        f.write(content)
    return path


def test_encrypt_file_success(tmp_path: Path):
    """Test encrypting a file successfully"""
    input_path = tmp_path / "input.txt"
    output_path = tmp_path / "output.encrypted"
    create_test_file(input_path, b"Hello, World!")

    result = encrypt_file(input_path, output_path, "test_password")

    assert result.success is True
    assert result.filename == "output.encrypted"
    assert result.download_url.endswith(".encrypted")
    assert result.original_size is not None
    assert result.processed_size is not None
    assert output_path.exists()

    # Encrypted file should be different from original
    with open(input_path, "rb") as f:
        original_data = f.read()
    with open(output_path, "rb") as f:
        encrypted_data = f.read()

    assert encrypted_data != original_data
    assert len(encrypted_data) > len(original_data)  # Should include salt


def test_decrypt_file_success(tmp_path: Path):
    """Test decrypting a file successfully"""
    input_path = tmp_path / "input.txt"
    encrypted_path = tmp_path / "encrypted.encrypted"
    output_path = tmp_path / "output.txt"

    original_content = b"Hello, World!"
    create_test_file(input_path, original_content)

    # First encrypt
    encrypt_result = encrypt_file(input_path, encrypted_path, "test_password")
    assert encrypt_result.success is True

    # Then decrypt
    result = decrypt_file(encrypted_path, output_path, "test_password")

    assert result.success is True
    assert result.filename == "output.txt"
    assert output_path.exists()

    # Decrypted content should match original
    with open(output_path, "rb") as f:
        decrypted_data = f.read()

    assert decrypted_data == original_content


def test_encrypt_file_empty_password(tmp_path: Path):
    """Test encrypting with empty password"""
    input_path = tmp_path / "input.txt"
    output_path = tmp_path / "output.encrypted"
    create_test_file(input_path)

    result = encrypt_file(input_path, output_path, "")

    assert result.success is False
    assert "Password cannot be empty" in result.message


def test_decrypt_file_wrong_password(tmp_path: Path):
    """Test decrypting with wrong password"""
    input_path = tmp_path / "input.txt"
    encrypted_path = tmp_path / "encrypted.encrypted"
    output_path = tmp_path / "output.txt"

    create_test_file(input_path, b"test content")

    # Encrypt with one password
    encrypt_result = encrypt_file(input_path, encrypted_path, "correct_password")
    assert encrypt_result.success is True

    # Try to decrypt with wrong password
    result = decrypt_file(encrypted_path, output_path, "wrong_password")

    assert result.success is False
    assert "Incorrect password" in result.message or "Decryption failed" in result.message


def test_decrypt_file_empty_password(tmp_path: Path):
    """Test decrypting with empty password"""
    input_path = tmp_path / "input.txt"
    encrypted_path = tmp_path / "encrypted.encrypted"
    output_path = tmp_path / "output.txt"

    create_test_file(input_path)

    # Encrypt first
    encrypt_result = encrypt_file(input_path, encrypted_path, "test_password")
    assert encrypt_result.success is True

    # Try to decrypt with empty password
    result = decrypt_file(encrypted_path, output_path, "")

    assert result.success is False
    assert "Password cannot be empty" in result.message


def test_decrypt_file_invalid_format(tmp_path: Path):
    """Test decrypting a file that's not properly encrypted"""
    input_path = tmp_path / "input.txt"
    output_path = tmp_path / "output.txt"

    # Create a file that's too small (less than 16 bytes for salt)
    create_test_file(input_path, b"short")

    result = decrypt_file(input_path, output_path, "test_password")

    assert result.success is False
    assert "Invalid encrypted file format" in result.message


def test_encrypt_decrypt_roundtrip(tmp_path: Path):
    """Test encrypting and decrypting preserves original content"""
    input_path = tmp_path / "input.txt"
    encrypted_path = tmp_path / "encrypted.encrypted"
    output_path = tmp_path / "output.txt"

    original_content = b"This is a test file with some content!\nLine 2\nLine 3"
    create_test_file(input_path, original_content)

    password = "my_secure_password_123"

    # Encrypt
    encrypt_result = encrypt_file(input_path, encrypted_path, password)
    assert encrypt_result.success is True

    # Decrypt
    decrypt_result = decrypt_file(encrypted_path, output_path, password)
    assert decrypt_result.success is True

    # Verify content matches
    with open(output_path, "rb") as f:
        decrypted_content = f.read()

    assert decrypted_content == original_content


def test_encrypt_different_passwords_produce_different_outputs(tmp_path: Path):
    """Test that encrypting with different passwords produces different encrypted files"""
    input_path = tmp_path / "input.txt"
    encrypted1_path = tmp_path / "encrypted1.encrypted"
    encrypted2_path = tmp_path / "encrypted2.encrypted"

    create_test_file(input_path, b"test content")

    # Encrypt with password 1
    result1 = encrypt_file(input_path, encrypted1_path, "password1")
    assert result1.success is True

    # Encrypt with password 2
    result2 = encrypt_file(input_path, encrypted2_path, "password2")
    assert result2.success is True

    # Encrypted files should be different
    with open(encrypted1_path, "rb") as f:
        encrypted1 = f.read()
    with open(encrypted2_path, "rb") as f:
        encrypted2 = f.read()

    assert encrypted1 != encrypted2
