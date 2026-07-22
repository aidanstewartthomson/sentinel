from uuid import UUID

from sqlalchemy import select

from sentinel.database.models.image import ImageRecord
from sentinel.database.session import SessionFactory


class MetadataStore:
    def save(self, record: ImageRecord) -> None:
        with SessionFactory() as session:
            session.add(record)
            session.commit()

    def get(self, image_id: UUID, user_id: str) -> ImageRecord | None:
        with SessionFactory() as session:
            return session.scalar(
                select(ImageRecord).where(
                    ImageRecord.id == image_id,
                    ImageRecord.user_id == user_id,
                )
            )

    def list(self, user_id: str) -> list[ImageRecord]:
        with SessionFactory() as session:
            return list(
                session.scalars(
                    select(ImageRecord).where(ImageRecord.user_id == user_id)
                ).all()
            )

    def rename(
        self, image_id: UUID, user_id: str, filename: str
    ) -> ImageRecord | None:
        with SessionFactory() as session:
            record = session.scalar(
                select(ImageRecord).where(
                    ImageRecord.id == image_id,
                    ImageRecord.user_id == user_id,
                )
            )

            if record is None:
                return None

            record.user_filename = filename
            session.commit()

            return record

    def delete(self, image_id: UUID, user_id: str) -> ImageRecord | None:
        with SessionFactory() as session:
            record = session.scalar(
                select(ImageRecord).where(
                    ImageRecord.id == image_id,
                    ImageRecord.user_id == user_id,
                )
            )

            if record is None:
                return None

            session.delete(record)
            session.commit()

            return record
