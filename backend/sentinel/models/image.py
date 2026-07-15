from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class ImageMetadata(BaseModel):
    id: UUID
    user_filename: str
    stored_filename: str
    content_type: str
    caption: str
    created_at: datetime
    size_bytes: int


class RenameImageRequest(BaseModel):
    filename: str
