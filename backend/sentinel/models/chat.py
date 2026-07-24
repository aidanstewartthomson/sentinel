from typing import Literal

from pydantic import BaseModel, Field

from sentinel.models.image import ImageResponse

ToolId = Literal["search"]


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    text: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    history: list[ChatMessage] = Field(default_factory=list)
    tool: ToolId | None = None


class ChatResponse(BaseModel):
    reply: str
    results: list[ImageResponse] = Field(default_factory=list)
    tool_label: str | None = None
