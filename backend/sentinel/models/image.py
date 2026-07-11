from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class ImageMetadata(BaseModel):
    id: UUID
    original_filename: str
    stored_filename: str
    caption: str
    created_at: datetime
    size_bytes: int
