from fastapi import APIRouter

from sentinel.api.deps import CurrentUserId
from sentinel.llm.client import ChatClient
from sentinel.models.chat import ChatRequest, ChatResponse
from sentinel.services.chat_service import ChatService

router = APIRouter(prefix="/chat")

chat_service = ChatService(chat_client=ChatClient())


@router.post("")
def chat(_user_id: CurrentUserId, request: ChatRequest) -> ChatResponse:
    return chat_service.reply(request.message, request.history)
