from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sentinel.database.models.base import Base


class ImageRecord(Base):
    __tablename__ = "images"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    original_filename: Mapped[str]
    stored_filename: Mapped[str]
    caption: Mapped[str]
    created_at: Mapped[datetime]
    size_bytes: Mapped[int]
