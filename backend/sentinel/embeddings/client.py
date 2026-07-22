from google import genai
from google.genai import types

from sentinel.core.config import settings


class EmbeddingClient:
    def __init__(self) -> None:
        self.model = settings.embedding_model
        self.dimensions = settings.embedding_dimensions
        self._client = genai.Client(
            vertexai=True,
            project=settings.google_cloud_project,
            location=settings.vertex_location,
        )

    def embed_image(self, image: bytes, mime_type: str) -> list[float]:
        result = self._client.models.embed_content(
            model=self.model,
            contents=[
                types.Part.from_bytes(data=image, mime_type=mime_type),
            ],
            config=types.EmbedContentConfig(
                output_dimensionality=self.dimensions,
            ),
        )

        return list(result.embeddings[0].values)
