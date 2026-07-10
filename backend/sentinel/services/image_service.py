from pathlib import Path
from uuid import UUID, uuid4

from fastapi import UploadFile

from sentinel.models.image import ImageMetadata
from sentinel.storage.file_store import FileStore
from sentinel.storage.image_store import ImageStore
from sentinel.vision.vlm_client import VLMClient


class ImageService:
    def __init__(self, file_store: FileStore, image_store: ImageStore, vlm: VLMClient):
        self.file_store = file_store
        self.image_store = image_store
        self.vlm = vlm

    async def ingest(self, image: UploadFile) -> ImageMetadata:
        image_id = uuid4()

        suffix = Path(image.filename).suffix
        stored_filename = f"{image_id}{suffix}"

        path = await self.file_store.save(file=image, filename=stored_filename)

        # placeholder caption for development
        # caption = self.vlm.caption_image(path)
        caption = "This is a caption."

        metadata = ImageMetadata(
            id=image_id,
            original_filename=image.filename,
            stored_filename=stored_filename,
            caption=caption,
        )

        self.image_store.save(metadata)

        return metadata

    def get(self, image_id: UUID) -> ImageMetadata:
        return self.image_store.get(image_id)

    def list(self) -> list[ImageMetadata]:
        return self.image_store.list()
