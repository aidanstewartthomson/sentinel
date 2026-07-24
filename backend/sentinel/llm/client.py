from google import genai
from google.genai import types

from sentinel.core.config import settings

SYSTEM_INSTRUCTION = (
    "You are Sentinel, an AI assistant for an image intelligence platform. "
    "Help the user with concise, practical answers about working with images. "
    "You cannot search or view their image library in this chat mode — "
    "suggest they use the Search tool when they need to find images."
)


class ChatClient:
    def __init__(self) -> None:
        self.model = settings.chat_model
        self._client = genai.Client(
            vertexai=True,
            project=settings.google_cloud_project,
            location=settings.vertex_location,
        )

    def generate(
        self, message: str, history: list[tuple[str, str]] | None = None
    ) -> str:
        contents: list[types.Content] = []

        for role, text in history or []:
            contents.append(
                types.Content(
                    role="user" if role == "user" else "model",
                    parts=[types.Part.from_text(text=text)],
                )
            )

        contents.append(
            types.Content(role="user", parts=[types.Part.from_text(text=message)])
        )

        response = self._client.models.generate_content(
            model=self.model,
            contents=contents,
            config=types.GenerateContentConfig(system_instruction=SYSTEM_INSTRUCTION),
        )

        text = response.text
        if not text:
            raise RuntimeError("Chat model returned an empty response")

        return text
