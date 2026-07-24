from fastapi import HTTPException

from sentinel.llm.client import ChatClient
from sentinel.models.chat import ChatMessage, ChatResponse


class ChatService:
    def __init__(self, chat_client: ChatClient) -> None:
        self.chat_client = chat_client

    def reply(self, message: str, history: list[ChatMessage]) -> ChatResponse:
        try:
            text = self.chat_client.generate(
                message=message, history=[(item.role, item.text) for item in history]
            )
        except:
            raise HTTPException(status_code=502, detail="Chat model unavailable")

        return ChatResponse(reply=text)
