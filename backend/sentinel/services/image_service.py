from datetime import datetime, timezone
from pathlib import Path
from uuid import UUID, uuid4

from fastapi import HTTPException, UploadFile
from fastapi.responses import Response

from sentinel.core.config import settings
from sentinel.database.models.image import ImageRecord
from sentinel.embeddings.client import EmbeddingClient
from sentinel.models.image import ImageResponse
from sentinel.storage.file_store import FileStore
from sentinel.storage.metadata_store import MetadataStore

DEFAULT_IMAGE_CONTENT_TYPE = "application/octet-stream"


class ImageService:
    def __init__(
        self,
        file_store: FileStore,
        metadata_store: MetadataStore,
        embedding_client: EmbeddingClient,
    ):
        self.file_store = file_store
        self.metadata_store = metadata_store
        self.embedding_client = embedding_client

    def ingest(self, image: UploadFile, user_id: str) -> ImageResponse:
        image_id = uuid4()

        suffix = Path(image.filename).suffix
        stored_filename = f"{image_id}{suffix}"
        content_type = image.content_type or DEFAULT_IMAGE_CONTENT_TYPE

        contents = self.file_store.save(image, filename=stored_filename)
        embedding = self.embedding_client.embed_image(contents, content_type)

        record = ImageRecord(
            id=image_id,
            user_id=user_id,
            user_filename=image.filename,
            stored_filename=stored_filename,
            content_type=content_type,
            created_at=datetime.now(timezone.utc),
            size_bytes=len(contents),
            embedding=embedding,
        )

        self.metadata_store.save(record)

        return ImageResponse.from_record(record)

    def get_metadata(self, image_id: UUID, user_id: str) -> ImageResponse:
        record = self.metadata_store.get(image_id, user_id)

        if record is None:
            raise HTTPException(status_code=404, detail="Image not found")

        return ImageResponse.from_record(record)

    def get_content(self, image_id: UUID, user_id: str) -> Response:
        contents, content_type = self.read_content(image_id, user_id)

        return Response(content=contents, media_type=content_type)

    def read_content(self, image_id: UUID, user_id: str) -> tuple[bytes, str]:
        record = self.metadata_store.get(image_id, user_id)

        if record is None:
            raise HTTPException(status_code=404, detail="Image not found")

        contents = self.file_store.read(record.stored_filename)

        if contents is None:
            raise HTTPException(status_code=404, detail="Image not found")

        return contents, record.content_type

    def list(self, user_id: str) -> list[ImageResponse]:
        return [
            ImageResponse.from_record(record)
            for record in self.metadata_store.list(user_id)
        ]

    def rename(self, image_id: UUID, user_id: str, filename: str) -> ImageResponse:
        record = self.metadata_store.rename(image_id, user_id, filename=filename)

        if record is None:
            raise HTTPException(status_code=404, detail="Image not found")

        return ImageResponse.from_record(record)

    def delete(self, image_id: UUID, user_id: str) -> ImageResponse:
        record = self.metadata_store.delete(image_id, user_id)

        if record is None:
            raise HTTPException(status_code=404, detail="Image not found")

        self.file_store.delete(record.stored_filename)

        return ImageResponse.from_record(record)

    def download(self, image_id: UUID, user_id: str) -> Response:
        record = self.metadata_store.get(image_id, user_id)

        if record is None:
            raise HTTPException(status_code=404, detail="Image not found")

        contents = self.file_store.read(record.stored_filename)

        if contents is None:
            raise HTTPException(status_code=404, detail="Image not found")

        return Response(
            content=contents,
            media_type=record.content_type,
            headers={
                "Content-Disposition": (
                    f'attachment; filename="{record.user_filename}"'
                )
            },
        )

    def search(self, q: str, user_id: str) -> list[ImageResponse]:
        embedding = self.embedding_client.embed_text(q)
        records = self.metadata_store.search(
            embedding,
            user_id,
            max_distance=settings.search_max_distance,
        )

        return [ImageResponse.from_record(record) for record in records]
