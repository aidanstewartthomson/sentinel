# Sentinel

Personal image library with semantic search and Gemini chat.

Upload photos, manage a private library, and ask questions in natural language. Sentinel finds images by meaning, not only by filename. Gemini can also analyze images you attach. Clerk signs in each user. Each user sees only their own images.

**Deployment status:** The hosted demo is offline to avoid cloud costs. You can still run it locally with Google Cloud and Clerk credentials.

## How to run

You need Python 3.14, [uv](https://docs.astral.sh/uv/), Node.js, a GCP project (Cloud Storage, Cloud SQL with vectors, Vertex AI), and Clerk keys.

**Backend**

```bash
cd backend
cp .env.example .env   # set DATABASE_URL, GCS_BUCKET, GOOGLE_CLOUD_PROJECT, CLERK_SECRET_KEY
uv sync
uv run --env-file .env uvicorn sentinel.api.main:app --reload
```

**Frontend**

```bash
cd frontend
cp .env.example .env.local   # set BACKEND_URL, Clerk keys
npm install
npm run dev
```

See `backend/.env.example` and `frontend/.env.example` for optional settings.

## Limitations

- Needs paid cloud services (not a fully offline stack).
- No automated tests or database migrations in the repo.
- Chat is not persisted.
- Library UI filter is filename-only as semantic search is only via chat or the search API.

## License

[MIT](LICENSE)
