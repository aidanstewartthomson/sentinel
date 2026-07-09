from sentinel.database.models.image_record import ImageRecord
from sentinel.database.session import SessionFactory
from sentinel.models.image import ImageMetadata


class ImageStore:
    def save(self, metadata: ImageMetadata) -> None:
        record = ImageRecord(
            id=metadata.id,
            original_filename=metadata.original_filename,
            stored_filename=metadata.stored_filename,
            caption=metadata.caption,
        )

        with SessionFactory() as session:
            session.add(record)
            session.commit()
