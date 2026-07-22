from typing import Annotated

from clerk_backend_api import AuthenticateRequestOptions, authenticate_request
from fastapi import Depends, HTTPException, Request

from sentinel.core.config import settings


def get_current_user_id(request: Request) -> str:
    state = authenticate_request(
        request,
        AuthenticateRequestOptions(
            secret_key=settings.clerk_secret_key,
            authorized_parties=[settings.clerk_authorized_party],
            accepts_token=["session_token"],
        ),
    )

    if not state.is_signed_in or state.payload is None:
        detail = state.reason.name if state.reason else "unauthorized"
        raise HTTPException(status_code=401, detail=detail)

    return state.payload["sub"]


CurrentUserId = Annotated[str, Depends(get_current_user_id)]
