# Backend

FastAPI service for Sentinel. Deployed on Cloud Run.

```bash
cp .env.example .env
uv sync
uv run --env-file .env uvicorn sentinel.api.main:app --reload
```

Requires Cloud SQL (or the Auth Proxy), GCS, Vertex credentials, and Clerk. See `.env.example`.
