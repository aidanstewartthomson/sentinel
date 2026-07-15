import os
from pathlib import Path

DATA_DIR = Path("data")
DATA_DIR.mkdir(parents=True, exist_ok=True)

DATABASE_URL = f"sqlite:///{DATA_DIR / 'sentinel.db'}"
GCS_BUCKET = os.environ["GCS_BUCKET"]
MODEL_NAME = "Qwen/Qwen3-VL-2B-Instruct"
