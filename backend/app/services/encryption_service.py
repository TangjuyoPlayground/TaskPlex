"""
File encryption/decryption service using cryptography library
"""

import base64
import os
from pathlib import Path

from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from app.models.encryption import EncryptionResponse
from app.utils.file_handler import get_file_size


def _derive_key_from_password(password: str, salt: bytes) -> bytes:
    """
    Derive a Fernet key from a password using PBKDF2

    Args:
        password: User-provided password
        salt: Salt bytes (should be random and unique)

    Returns:
        Fernet key (32 bytes)
    """
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,  # High iteration count for security
        backend=default_backend(),
    )
    key = kdf.derive(password.encode("utf-8"))
    return base64.urlsafe_b64encode(key)


def encrypt_file(
    input_path: Path,
    output_path: Path,
    password: str,
) -> EncryptionResponse:
    """
    Encrypt a file using AES-256 with Fernet (symmetric encryption)

    Args:
        input_path: Path to input file
        output_path: Path to save encrypted file
        password: Password for encryption

    Returns:
        EncryptionResponse with encryption results
    """
    try:
        if not password or len(password) < 1:
            return EncryptionResponse(
                success=False,
                message="Password cannot be empty",
                filename=output_path.name if output_path else None,
            )

        # Get original file size
        original_size = get_file_size(input_path)

        # Generate a random salt for this encryption
        salt = os.urandom(16)

        # Derive key from password
        key = _derive_key_from_password(password, salt)

        # Create Fernet cipher
        fernet = Fernet(key)

        # Read input file
        with open(input_path, "rb") as f:
            file_data = f.read()

        # Encrypt the data
        encrypted_data = fernet.encrypt(file_data)

        # Write encrypted file: salt (16 bytes) + encrypted data
        with open(output_path, "wb") as f:
            f.write(salt)
            f.write(encrypted_data)

        # Get encrypted file size
        encrypted_size = get_file_size(output_path)

        return EncryptionResponse(
            success=True,
            message="File encrypted successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=original_size,
            processed_size=encrypted_size,
        )

    except Exception as e:
        return EncryptionResponse(
            success=False,
            message=f"Error encrypting file: {str(e)}",
            filename=output_path.name if output_path else None,
        )


def decrypt_file(
    input_path: Path,
    output_path: Path,
    password: str,
) -> EncryptionResponse:
    """
    Decrypt a file that was encrypted with encrypt_file

    Args:
        input_path: Path to encrypted file
        output_path: Path to save decrypted file
        password: Password used for encryption

    Returns:
        EncryptionResponse with decryption results
    """
    try:
        if not password or len(password) < 1:
            return EncryptionResponse(
                success=False,
                message="Password cannot be empty",
                filename=output_path.name if output_path else None,
            )

        # Get encrypted file size
        encrypted_size = get_file_size(input_path)

        # Read encrypted file
        with open(input_path, "rb") as f:
            file_data = f.read()

        # Extract salt (first 16 bytes) and encrypted data
        if len(file_data) < 16:
            return EncryptionResponse(
                success=False,
                message="Invalid encrypted file format",
                filename=output_path.name if output_path else None,
            )

        salt = file_data[:16]
        encrypted_data = file_data[16:]

        # Derive key from password using the same salt
        key = _derive_key_from_password(password, salt)

        # Create Fernet cipher
        fernet = Fernet(key)

        # Decrypt the data
        try:
            decrypted_data = fernet.decrypt(encrypted_data)
        except InvalidToken:
            # Password is incorrect
            return EncryptionResponse(
                success=False,
                message="Incorrect password. Please verify the password and try again.",
                filename=output_path.name if output_path else None,
            )
        except Exception as e:
            # For other exceptions (corrupted file, etc.)
            return EncryptionResponse(
                success=False,
                message="Decryption failed. The file may be corrupted or encrypted with a different method.",
                filename=output_path.name if output_path else None,
            )

        # Write decrypted file
        with open(output_path, "wb") as f:
            f.write(decrypted_data)

        # Get decrypted file size
        decrypted_size = get_file_size(output_path)

        return EncryptionResponse(
            success=True,
            message="File decrypted successfully",
            filename=output_path.name,
            download_url=f"/api/v1/download/{output_path.name}",
            original_size=encrypted_size,
            processed_size=decrypted_size,
        )

    except Exception as e:
        return EncryptionResponse(
            success=False,
            message=f"Error decrypting file: {str(e)}",
            filename=output_path.name if output_path else None,
        )
