from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import HTTPException, UploadFile
from fastapi.responses import FileResponse

from sentinel.models.image import ImageMetadata
from sentinel.storage.file_store import FileStore
from sentinel.storage.metadata_store import MetadataStore
from sentinel.vision.vlm_client import VLMClient


class ImageService:
    def __init__(
        self, file_store: FileStore, metadata_store: MetadataStore, vlm: VLMClient
    ):
        self.file_store = file_store
        self.metadata_store = metadata_store
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
            created_at=datetime.now(timezone.utc),
            size_bytes=path.stat().st_size,
        )

        self.metadata_store.save(metadata)

        return metadata

    def get_metadata(self, image_id: UUID) -> ImageMetadata | None:
        return self.metadata_store.get(image_id)

    def get_content(self, image_id: UUID) -> FileResponse:
        metadata = self.metadata_store.get(image_id)

        if metadata is None:
            raise HTTPException(status_code=404, detail="Image not found")

        path = self.file_store.get_path(metadata.stored_filename)

        if not path.is_file():
            raise HTTPException(status_code=404, detail="Image not found")

        return FileResponse(path=path)

    def list(self) -> list[ImageMetadata]:
        return self.metadata_store.list()
