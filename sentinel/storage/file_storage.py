from pathlib import Path

from fastapi import UploadFile


class FileStorage:
    def __init__(self, upload_dir: Path) -> None:
        self.upload_dir = upload_dir
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def save(self, file: UploadFile) -> Path:
        save_path = self.upload_dir / file.filename

        contents = await file.read()
        save_path.write_bytes(contents)

        return save_path
