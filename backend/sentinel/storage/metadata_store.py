from uuid import UUID

from sqlalchemy import select
from sentinel.database.models.image_record import ImageRecord
from sentinel.database.session import SessionFactory
from sentinel.models.image import ImageMetadata


class MetadataStore:
    def save(self, metadata: ImageMetadata) -> None:
        record = self._to_record(metadata)

        with SessionFactory() as session:
            session.add(record)
            session.commit()

    def get(self, image_id: UUID) -> ImageMetadata | None:
        with SessionFactory() as session:
            record = session.get(ImageRecord, ident=image_id)

            if record is None:
                return None

            return self._to_metadata(record)

    def list(self) -> list[ImageMetadata]:
        with SessionFactory() as session:
            records = session.scalars(select(ImageRecord)).all()
            return [self._to_metadata(record) for record in records]

    def rename(self, image_id: UUID, filename: str) -> ImageMetadata | None:
        with SessionFactory() as session:
            record = session.get(ImageRecord, ident=image_id)

            if record is None:
                return None

            record.user_filename = filename
            session.commit()

            return self._to_metadata(record)

    def delete(self, image_id: UUID) -> ImageMetadata | None:
        with SessionFactory() as session:
            record = session.get(ImageRecord, ident=image_id)

            if record is None:
                return None

            session.delete(record)
            session.commit()

            return self._to_metadata(record)

    def _to_record(self, metadata: ImageMetadata) -> ImageRecord:
        return ImageRecord(
            id=metadata.id,
            user_filename=metadata.user_filename,
            stored_filename=metadata.stored_filename,
            content_type=metadata.content_type,
            caption=metadata.caption,
            created_at=metadata.created_at,
            size_bytes=metadata.size_bytes,
        )

    def _to_metadata(self, record: ImageRecord) -> ImageMetadata:
        return ImageMetadata(
            id=record.id,
            user_filename=record.user_filename,
            stored_filename=record.stored_filename,
            content_type=record.content_type,
            caption=record.caption,
            created_at=record.created_at,
            size_bytes=record.size_bytes,
        )
