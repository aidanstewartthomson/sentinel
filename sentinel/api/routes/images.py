from fastapi import APIRouter, UploadFile

router = APIRouter()


@router.post("/images")
def upload_image(file: UploadFile) -> dict[str, str]:
    return {"filename": file.filename}
