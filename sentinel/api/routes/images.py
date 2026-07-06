from fastapi import APIRouter, UploadFile
from sentinel.core.config import UPLOAD_DIR
from sentinel.storage.file_storage import FileStorage

router = APIRouter()
storage = FileStorage(UPLOAD_DIR)


@router.post("/images")
async def upload_image(file: UploadFile) -> dict[str, str]:
    path = await storage.save(file)
    return {"filename": path.name}
