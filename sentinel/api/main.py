from fastapi import FastAPI
from sentinel.api.routes import health, images

app = FastAPI()

app.include_router(health.router)
app.include_router(images.router)
