from pathlib import Path

DATA_DIR = Path("data")
DATA_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR = DATA_DIR / "uploads"

DATABASE_URL = f"sqlite:///{DATA_DIR / 'sentinel.db'}"
MODEL_NAME = "Qwen/Qwen3-VL-2B-Instruct"
