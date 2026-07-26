from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

from sentinel.models.image import ImageResponse

ToolId = Literal["search"]
MAX_SELECTED_IMAGES = 8


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    text: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    history: list[ChatMessage] = Field(default_factory=list)
    tool: ToolId | None = None
    image_ids: list[UUID] = Field(
        default_factory=list,
        max_length=MAX_SELECTED_IMAGES,
    )


class ChatResponse(BaseModel):
    reply: str
    results: list[ImageResponse] = Field(default_factory=list)
    tool_label: str | None = None
