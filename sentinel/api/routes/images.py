from uuid import UUID
from fastapi import APIRouter, UploadFile

from sentinel.core.config import MODEL_NAME, UPLOAD_DIR
from sentinel.models.image import ImageMetadata
from sentinel.services.image_service import ImageService
from sentinel.storage.file_store import FileStore
from sentinel.storage.image_store import ImageStore
from sentinel.vision.vlm_client import VLMClient

router = APIRouter(prefix="/images")

file_store = FileStore(upload_dir=UPLOAD_DIR)
image_store = ImageStore()
vlm = VLMClient(model_name=MODEL_NAME)

image_service = ImageService(file_store=file_store, image_store=image_store, vlm=vlm)


@router.post("")
async def upload_image(image: UploadFile) -> ImageMetadata:
    return await image_service.ingest(image)


@router.get("")
def list_images() -> list[ImageMetadata]:
    return image_service.list()


@router.get("/{image_id}")
def get_image(image_id: UUID) -> ImageMetadata | None:
    return image_service.get(image_id)
