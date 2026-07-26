from io import BytesIO
from uuid import UUID

from PIL import Image, ImageOps, UnidentifiedImageError

THUMBNAIL_CONTENT_TYPE = "image/webp"
THUMBNAIL_MAX_SIZE = 320
THUMBNAIL_QUALITY = 72


def thumbnail_filename(image_id: UUID) -> str:
    return f"{image_id}_thumb.webp"


def make_thumbnail(
    contents: bytes,
    *,
    max_size: int = THUMBNAIL_MAX_SIZE,
    quality: int = THUMBNAIL_QUALITY,
) -> tuple[bytes, str] | None:
    try:
        with Image.open(BytesIO(contents)) as image:
            image = ImageOps.exif_transpose(image)
            image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

            if image.mode not in ("RGB", "RGBA"):
                image = image.convert("RGBA" if "A" in image.getbands() else "RGB")

            buffer = BytesIO()
            image.save(buffer, format="WEBP", quality=quality, method=4)
            return buffer.getvalue(), THUMBNAIL_CONTENT_TYPE
    except (UnidentifiedImageError, OSError):
        return None
