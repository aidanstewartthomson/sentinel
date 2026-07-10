from uuid import UUID
from sentinel.database.models.image_record import ImageRecord
from sentinel.database.session import SessionFactory
from sentinel.models.image import ImageMetadata


class ImageStore:
    def save(self, metadata: ImageMetadata) -> None:
        record = self._to_record(metadata)

        with SessionFactory() as session:
            session.add(record)
            session.commit()

    def get(self, image_id: UUID) -> ImageMetadata | None:
        with SessionFactory() as session:
            record = session.get(entity=ImageRecord, ident=image_id)

            if record is None:
                return None

            return self._to_metadata(record)

    def _to_record(self, metadata: ImageMetadata) -> ImageRecord:
        return ImageRecord(
            id=metadata.id,
            original_filename=metadata.original_filename,
            stored_filename=metadata.stored_filename,
            caption=metadata.caption,
        )

    def _to_metadata(self, record: ImageRecord) -> ImageMetadata:
        return ImageMetadata(
            id=record.id,
            original_filename=record.original_filename,
            stored_filename=record.stored_filename,
            caption=record.caption,
        )
