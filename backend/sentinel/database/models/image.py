from datetime import datetime
from uuid import UUID

from sqlalchemy import Index, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from sentinel.core.config import settings
from sentinel.database.models.base import Base
from sentinel.database.types import Vector


class ImageRecord(Base):
    __tablename__ = "images"
    __table_args__ = (Index("ix_images_user_id", "user_id"),)

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(128))
    user_filename: Mapped[str] = mapped_column(String(512))
    stored_filename: Mapped[str] = mapped_column(String(512))
    content_type: Mapped[str] = mapped_column(String(128))
    created_at: Mapped[datetime]
    size_bytes: Mapped[int]
    embedding: Mapped[list[float] | None] = mapped_column(
        Vector(settings.embedding_dimensions),
        nullable=True,
    )
