# Backend

FastAPI service for Sentinel. It was previously deployed on Cloud Run, but the hosted deployment is currently offline to avoid ongoing cloud costs.

```bash
cp .env.example .env
uv sync
uv run --env-file .env uvicorn sentinel.api.main:app --reload
```

Requires Cloud SQL (or the Auth Proxy), GCS, Vertex credentials, and Clerk. See `.env.example`.
