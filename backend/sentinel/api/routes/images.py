from uuid import UUID

from fastapi import APIRouter, UploadFile
from fastapi.responses import Response

from sentinel.api.deps import CurrentUserId
from sentinel.core.config import settings
from sentinel.embeddings.client import EmbeddingClient
from sentinel.models.image import ImageResponse, RenameImageRequest
from sentinel.services.image_service import ImageService
from sentinel.storage.file_store import FileStore
from sentinel.storage.metadata_store import MetadataStore

router = APIRouter(prefix="/images")

file_store = FileStore(bucket_name=settings.gcs_bucket)
metadata_store = MetadataStore()
embedding_client = EmbeddingClient()

image_service = ImageService(
    file_store=file_store,
    metadata_store=metadata_store,
    embedding_client=embedding_client,
)


@router.post("")
def upload_image(user_id: CurrentUserId, image: UploadFile) -> ImageResponse:
    return image_service.ingest(image, user_id)


@router.get("")
def list_images(user_id: CurrentUserId) -> list[ImageResponse]:
    return image_service.list(user_id)


@router.get("/search")
def search_images(user_id: CurrentUserId, q: str) -> list[ImageResponse]:
    return image_service.search(q, user_id)


@router.get("/{image_id}")
def get_image_metadata(user_id: CurrentUserId, image_id: UUID) -> ImageResponse:
    return image_service.get_metadata(image_id, user_id)


@router.patch("/{image_id}")
def rename_image(
    user_id: CurrentUserId,
    image_id: UUID,
    request: RenameImageRequest,
) -> ImageResponse:
    return image_service.rename(image_id, user_id, request.filename)


@router.delete("/{image_id}")
def delete_image(user_id: CurrentUserId, image_id: UUID) -> ImageResponse:
    return image_service.delete(image_id, user_id)


@router.get("/{image_id}/content")
def get_image_content(user_id: CurrentUserId, image_id: UUID) -> Response:
    return image_service.get_content(image_id, user_id)


@router.get("/{image_id}/download")
def download_image(user_id: CurrentUserId, image_id: UUID) -> Response:
    return image_service.download(image_id, user_id)
