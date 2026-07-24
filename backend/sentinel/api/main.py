from fastapi import FastAPI
from sentinel.api.routes import chat, health, images

app = FastAPI()

app.include_router(health.router)
app.include_router(images.router)
app.include_router(chat.router)
