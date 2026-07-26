from fastapi import UploadFile
from google.api_core.exceptions import NotFound
from google.cloud import storage


class FileStore:
    def __init__(self, bucket_name: str) -> None:
        self.bucket = storage.Client().bucket(bucket_name)

    def save(self, file: UploadFile, filename: str) -> bytes:
        contents = file.file.read()
        content_type = file.content_type or "application/octet-stream"
        self.write(filename, contents, content_type)
        return contents

    def write(self, filename: str, contents: bytes, content_type: str) -> None:
        blob = self.bucket.blob(filename)
        blob.upload_from_string(contents, content_type=content_type)

    def read(self, filename: str) -> bytes | None:
        blob = self.bucket.blob(filename)

        try:
            return blob.download_as_bytes()
        except NotFound:
            return None

    def delete(self, filename: str) -> None:
        blob = self.bucket.blob(filename)

        try:
            blob.delete()
        except NotFound:
            pass
