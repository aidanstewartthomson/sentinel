from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from sentinel.models.image import ImageMetadata
from sentinel.storage.file_storage import FileStorage
from sentinel.vision.vlm_client import VLMClient


class ImageService:
    def __init__(self, storage: FileStorage, vlm: VLMClient):
        self.storage = storage
        self.vlm = vlm

    async def ingest_image(self, image: UploadFile) -> ImageMetadata:
        image_id = uuid4()

        suffix = Path(image.filename).suffix
        stored_filename = f"{image_id}{suffix}"

        path = await self.storage.save(file=image, filename=stored_filename)

        caption = self.vlm.caption_image(path)

        return ImageMetadata(
            id=image_id,
            original_filename=image.filename,
            stored_filename=stored_filename,
            caption=caption,
        )
