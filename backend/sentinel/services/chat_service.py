from fastapi import HTTPException
from google.genai import types

from sentinel.llm.client import ChatClient
from sentinel.models.chat import ChatMessage, ChatResponse, ToolId
from sentinel.models.image import ImageResponse
from sentinel.services.image_service import ImageService

MAX_AGENT_STEPS = 3
SEARCH_TOOL_LABEL = "Searched image library"


class ChatService:
    def __init__(self, chat_client: ChatClient, image_service: ImageService) -> None:
        self.chat_client = chat_client
        self.image_service = image_service

    def reply(
        self,
        message: str,
        history: list[ChatMessage],
        user_id: str,
        tool: ToolId | None = None,
    ) -> ChatResponse:
        contents = self.chat_client.build_contents(
            message,
            history=[(item.role, item.text) for item in history],
        )

        if tool == "search":
            return self._search_and_summarize(
                contents,
                query=message.strip(),
                user_id=user_id,
            )

        results: list[ImageResponse] = []
        used_search = False

        for _ in range(MAX_AGENT_STEPS):
            response = self.chat_client.complete(contents)
            function_calls = list(response.function_calls or [])

            if not function_calls:
                text = response.text
                if not text:
                    raise HTTPException(
                        status_code=502, detail="Chat model unavailable"
                    )

                return ChatResponse(
                    reply=text,
                    results=results,
                    tool_label=SEARCH_TOOL_LABEL if used_search else None,
                )

            model_content = response.candidates[0].content
            if model_content is None:
                raise HTTPException(
                    status_code=502, detail="Chat model unavailable"
                )
            contents.append(model_content)

            tool_parts: list[types.Part] = []
            for call in function_calls:
                name = call.name or ""
                args = dict(call.args or {})

                if name == "search_images":
                    query = str(args.get("query", "")).strip()
                    images = self._run_search(query, user_id)
                    results = images
                    used_search = True
                    tool_parts.append(self._search_tool_response(name, images))
                else:
                    tool_parts.append(
                        types.Part.from_function_response(
                            name=name,
                            response={"error": f"Unknown tool: {name}"},
                        )
                    )

            contents.append(types.Content(role="user", parts=tool_parts))

        raise HTTPException(status_code=502, detail="Chat model unavailable")

    def _search_and_summarize(
        self, contents: list[types.Content], query: str, user_id: str
    ) -> ChatResponse:
        images = self._run_search(query, user_id)

        contents.append(
            types.Content(
                role="model",
                parts=[
                    types.Part.from_function_call(
                        name="search_images",
                        args={"query": query},
                    )
                ],
            )
        )
        contents.append(
            types.Content(
                role="user",
                parts=[self._search_tool_response("search_images", images)],
            )
        )

        response = self.chat_client.complete(contents)
        text = response.text
        if not text:
            raise HTTPException(status_code=502, detail="Chat model unavailable")

        return ChatResponse(
            reply=text,
            results=images,
            tool_label=SEARCH_TOOL_LABEL,
        )

    def _run_search(self, query: str, user_id: str) -> list[ImageResponse]:
        if not query:
            return []

        return self.image_service.search(query, user_id)

    @staticmethod
    def _search_tool_response(name: str, images: list[ImageResponse]) -> types.Part:
        return types.Part.from_function_response(
            name=name,
            response={
                "count": len(images),
                "images": [
                    {
                        "id": str(image.id),
                        "filename": image.user_filename,
                    }
                    for image in images
                ],
            },
        )
