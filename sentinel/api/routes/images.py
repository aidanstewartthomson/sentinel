from fastapi import APIRouter, UploadFile

from sentinel.core.config import MODEL_NAME, UPLOAD_DIR
from sentinel.models.image import ImageMetadata
from sentinel.services.image_service import ImageService
from sentinel.storage.file_storage import FileStorage
from sentinel.vision.vlm_client import VLMClient

router = APIRouter()

storage = FileStorage(upload_dir=UPLOAD_DIR)
vlm = VLMClient(model_name=MODEL_NAME)

image_service = ImageService(storage=storage, vlm=vlm)


@router.post("/images")
async def upload_image(image: UploadFile) -> ImageMetadata:
    return await image_service.ingest_image(image)
