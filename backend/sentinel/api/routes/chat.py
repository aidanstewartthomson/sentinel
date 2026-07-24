from fastapi import APIRouter

from sentinel.api.deps import CurrentUserId
from sentinel.api.routes.images import image_service
from sentinel.llm.client import ChatClient
from sentinel.models.chat import ChatRequest, ChatResponse
from sentinel.services.chat_service import ChatService

router = APIRouter(prefix="/chat")

chat_service = ChatService(
    chat_client=ChatClient(),
    image_service=image_service,
)


@router.post("")
def chat(user_id: CurrentUserId, request: ChatRequest) -> ChatResponse:
    return chat_service.reply(
        request.message,
        request.history,
        user_id,
        tool=request.tool,
    )
