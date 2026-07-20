from typing import Annotated

from clerk_backend_api import AuthenticateRequestOptions, authenticate_request
from fastapi import Depends, HTTPException, Request

from sentinel.core.config import CLERK_AUTHORIZED_PARTIES, CLERK_SECRET_KEY


def get_current_user_id(request: Request) -> str:
    state = authenticate_request(
        request,
        AuthenticateRequestOptions(
            secret_key=CLERK_SECRET_KEY,
            authorized_parties=CLERK_AUTHORIZED_PARTIES,
            accepts_token=["session_token"],
        ),
    )

    if not state.is_signed_in or state.payload is None:
        detail = state.reason.name if state.reason else "unauthorized"
        raise HTTPException(status_code=401, detail=detail)

    return state.payload["sub"]


CurrentUserId = Annotated[str, Depends(get_current_user_id)]
