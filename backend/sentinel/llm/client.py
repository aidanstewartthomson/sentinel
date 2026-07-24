from google import genai
from google.genai import types

from sentinel.core.config import settings

SYSTEM_INSTRUCTION = (
    "You are Sentinel, an AI assistant in an image intelligence product. "
    "Be helpful and concise. Answer general questions normally. "
    "When the user wants to find, look up, or show images from their library, "
    "call the search_images tool. After searching, reply in one or two short "
    "sentences that reflect the query and what turned up. If nothing matched, "
    "say so clearly. Do not invent images that were not returned by the tool. "
    "The UI will show the matching images."
)

SEARCH_IMAGES_TOOL = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="search_images",
            description=(
                "Search the user's image library with a natural-language query. "
                "Use when the user wants to find or show images."
            ),
            parameters_json_schema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": (
                            "Natural language description of the images to find."
                        ),
                    },
                },
                "required": ["query"],
            },
        )
    ]
)


class ChatClient:
    def __init__(self) -> None:
        self.model = settings.chat_model
        self._client = genai.Client(
            vertexai=True,
            project=settings.google_cloud_project,
            location=settings.vertex_location,
        )
        self._config = types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            tools=[SEARCH_IMAGES_TOOL],
            automatic_function_calling=types.AutomaticFunctionCallingConfig(
                disable=True,
            ),
        )

    def complete(self, contents: list[types.Content]) -> types.GenerateContentResponse:
        return self._client.models.generate_content(
            model=self.model,
            contents=contents,
            config=self._config,
        )

    @staticmethod
    def build_contents(
        message: str,
        history: list[tuple[str, str]] | None = None,
    ) -> list[types.Content]:
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

        return contents
