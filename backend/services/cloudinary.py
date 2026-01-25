"""
Cloudinary image upload service.

Handles image uploads to Cloudinary and returns secure URLs.
"""

import cloudinary
import cloudinary.uploader
from fastapi import UploadFile

from config import settings


# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret,
    secure=True,
)


async def upload_image(file: UploadFile) -> str:
    """
    Upload an image to Cloudinary.

    Args:
        file: FastAPI UploadFile object.

    Returns:
        str: Cloudinary secure URL for the uploaded image.

    Raises:
        Exception: If upload fails.
    """
    # Read file content
    content = await file.read()

    # Upload to Cloudinary
    # Note: Cloudinary SDK is synchronous, but the operation is I/O bound
    result = cloudinary.uploader.upload(
        content,
        folder="beautique-products",
        resource_type="image",
        allowed_formats=["jpg", "jpeg", "png", "webp"],
        transformation=[
            {"quality": "auto:good"},
            {"fetch_format": "auto"},
        ],
    )

    return result["secure_url"]


async def upload_multiple_images(files: list[UploadFile]) -> list[str]:
    """
    Upload multiple images to Cloudinary.

    Args:
        files: List of FastAPI UploadFile objects.

    Returns:
        list[str]: List of Cloudinary secure URLs.
    """
    urls = []
    for file in files:
        url = await upload_image(file)
        urls.append(url)
    return urls


def delete_image(public_id: str) -> bool:
    """
    Delete an image from Cloudinary.

    Args:
        public_id: Cloudinary public ID of the image.

    Returns:
        bool: True if deletion was successful.
    """
    result = cloudinary.uploader.destroy(public_id)
    return result.get("result") == "ok"
