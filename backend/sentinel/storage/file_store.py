from fastapi import UploadFile
from google.cloud import storage


class FileStore:
    def __init__(self, bucket_name: str) -> None:
        self.bucket = storage.Client().bucket(bucket_name)

    def save(self, file: UploadFile, filename: str) -> bytes:
        contents = file.file.read()
        content_type = file.content_type or "application/octet-stream"

        blob = self.bucket.blob(filename)
        blob.upload_from_string(contents, content_type=content_type)

        return contents

    def read(self, filename: str) -> bytes | None:
        blob = self.bucket.blob(filename)

        if not blob.exists():
            return None

        return blob.download_as_bytes()

    def delete(self, filename: str) -> None:
        blob = self.bucket.blob(filename)

        if blob.exists():
            blob.delete()
