from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from sentinel.database.models.image import ImageRecord


class ImageResponse(BaseModel):
    id: UUID
    user_filename: str
    created_at: datetime
    size_bytes: int

    @classmethod
    def from_record(cls, record: ImageRecord) -> "ImageResponse":
        return cls(
            id=record.id,
            user_filename=record.user_filename,
            created_at=record.created_at,
            size_bytes=record.size_bytes,
        )


class RenameImageRequest(BaseModel):
    filename: str
