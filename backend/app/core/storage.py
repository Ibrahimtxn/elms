"""
Local filesystem storage for uploaded files.

Sprint scope only needs local disk - swapping this for S3/cloud storage
later just means replacing this module, nothing else changes.
"""
import os
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.core.config import settings
from app.core.errors import AppError
from starlette import status


class UploadRejectedError(AppError):
    status_code = status.HTTP_400_BAD_REQUEST
    code = "UPLOAD_REJECTED"


def _ensure_upload_dir() -> Path:
    upload_path = Path(settings.UPLOAD_DIR)
    upload_path.mkdir(parents=True, exist_ok=True)
    return upload_path


def save_upload(file: UploadFile, subfolder: str) -> str:
    """
    Validates and saves an uploaded file. Returns the relative file path
    to store in the database (e.g. "materials/ab12cd34.pdf").
    """
    extension = Path(file.filename or "").suffix.lower().lstrip(".")
    if extension not in settings.ALLOWED_EXTENSIONS_SET:
        raise UploadRejectedError(
            f"File type '.{extension}' is not allowed. "
            f"Allowed types: {', '.join(sorted(settings.ALLOWED_EXTENSIONS_SET))}"
        )

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    contents = file.file.read()
    if len(contents) > max_bytes:
        raise UploadRejectedError(f"File exceeds the {settings.MAX_UPLOAD_SIZE_MB}MB limit.")

    base_dir = _ensure_upload_dir() / subfolder
    base_dir.mkdir(parents=True, exist_ok=True)

    unique_name = f"{uuid.uuid4().hex}.{extension}"
    destination = base_dir / unique_name

    with open(destination, "wb") as f:
        f.write(contents)

    return str(Path(subfolder) / unique_name)


def delete_upload(relative_path: str) -> None:
    full_path = Path(settings.UPLOAD_DIR) / relative_path
    if full_path.exists():
        os.remove(full_path)