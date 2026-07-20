import os

DATABASE_URL = os.environ["DATABASE_URL"]
GCS_BUCKET = os.environ["GCS_BUCKET"]
MODEL_NAME = "Qwen/Qwen3-VL-2B-Instruct"

CLERK_SECRET_KEY = os.environ["CLERK_SECRET_KEY"]
CLERK_AUTHORIZED_PARTIES = [
    party.strip()
    for party in os.environ.get(
        "CLERK_AUTHORIZED_PARTIES", "http://localhost:3000"
    ).split(",")
    if party.strip()
]
