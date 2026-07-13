from uuid import UUID
from fastapi import APIRouter, UploadFile
from fastapi.responses import FileResponse

from sentinel.core.config import UPLOAD_DIR
from sentinel.models.image import ImageMetadata, RenameImageRequest
from sentinel.services.image_service import ImageService
from sentinel.storage.file_store import FileStore
from sentinel.storage.metadata_store import MetadataStore
from sentinel.vision.vlm_client import StubVLMClient

router = APIRouter(prefix="/images")

file_store = FileStore(upload_dir=UPLOAD_DIR)
metadata_store = MetadataStore()
vlm = StubVLMClient()

image_service = ImageService(
    file_store=file_store, metadata_store=metadata_store, vlm=vlm
)


@router.post("")
def upload_image(image: UploadFile) -> ImageMetadata:
    return image_service.ingest(image)


@router.get("")
def list_images() -> list[ImageMetadata]:
    return image_service.list()


@router.get("/{image_id}")
def get_image_metadata(image_id: UUID) -> ImageMetadata:
    return image_service.get_metadata(image_id)


@router.patch("/{image_id}")
def rename_image(image_id: UUID, request: RenameImageRequest) -> ImageMetadata:
    return image_service.rename(image_id, request.filename)


@router.delete("/{image_id}")
def delete_image(image_id: UUID) -> ImageMetadata:
    return image_service.delete(image_id)


@router.get("/{image_id}/content")
def get_image_content(image_id: UUID) -> FileResponse:
    return image_service.get_content(image_id)


@router.get("/{image_id}/download")
def download_image(image_id: UUID) -> FileResponse:
    return image_service.download(image_id)
