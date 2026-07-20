from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import HTTPException, UploadFile
from fastapi.responses import Response

from sentinel.models.image import ImageMetadata
from sentinel.storage.file_store import FileStore
from sentinel.storage.metadata_store import MetadataStore
from sentinel.vision.vlm_client import StubVLMClient, VLMClient


class ImageService:
    def __init__(
        self,
        file_store: FileStore,
        metadata_store: MetadataStore,
        vlm: StubVLMClient | VLMClient,
    ):
        self.file_store = file_store
        self.metadata_store = metadata_store
        self.vlm = vlm

    def ingest(self, image: UploadFile, user_id: str) -> ImageMetadata:
        image_id = uuid4()

        suffix = Path(image.filename).suffix
        stored_filename = f"{image_id}{suffix}"

        contents = self.file_store.save(image, filename=stored_filename)
        caption = self.vlm.caption_image(contents)

        metadata = ImageMetadata(
            id=image_id,
            user_id=user_id,
            user_filename=image.filename,
            stored_filename=stored_filename,
            content_type=image.content_type,
            caption=caption,
            created_at=datetime.now(timezone.utc),
            size_bytes=len(contents),
        )

        self.metadata_store.save(metadata)

        return metadata

    def get_metadata(self, image_id: UUID, user_id: str) -> ImageMetadata:
        metadata = self.metadata_store.get(image_id, user_id)

        if metadata is None:
            raise HTTPException(status_code=404, detail="Image not found")

        return metadata

    def get_content(self, image_id: UUID, user_id: str) -> Response:
        metadata = self.metadata_store.get(image_id, user_id)

        if metadata is None:
            raise HTTPException(status_code=404, detail="Image not found")

        contents = self.file_store.read(metadata.stored_filename)

        if contents is None:
            raise HTTPException(status_code=404, detail="Image not found")

        return Response(content=contents, media_type=metadata.content_type)

    def list(self, user_id: str) -> list[ImageMetadata]:
        return self.metadata_store.list(user_id)

    def rename(self, image_id: UUID, user_id: str, filename: str) -> ImageMetadata:
        metadata = self.metadata_store.rename(image_id, user_id, filename=filename)

        if metadata is None:
            raise HTTPException(status_code=404, detail="Image not found")

        return metadata

    def delete(self, image_id: UUID, user_id: str) -> ImageMetadata:
        metadata = self.metadata_store.delete(image_id, user_id)

        if metadata is None:
            raise HTTPException(status_code=404, detail="Image not found")

        self.file_store.delete(metadata.stored_filename)

        return metadata

    def download(self, image_id: UUID, user_id: str) -> Response:
        metadata = self.metadata_store.get(image_id, user_id)

        if metadata is None:
            raise HTTPException(status_code=404, detail="Image not found")

        contents = self.file_store.read(metadata.stored_filename)

        if contents is None:
            raise HTTPException(status_code=404, detail="Image not found")

        return Response(
            content=contents,
            media_type=metadata.content_type,
            headers={
                "Content-Disposition": (
                    f'attachment; filename="{metadata.user_filename}"'
                )
            },
        )
