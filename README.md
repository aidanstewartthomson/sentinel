# Sentinel

Personal image library with semantic search and Gemini chat.

> **Deployment status:** The hosted demo is offline to avoid ongoing cloud costs. The project can still be run locally with the required cloud service credentials.

Upload photos, browse your library, and ask questions. Gemini can analyse images you attach and search your collection by meaning, not just by filename.

Signed in with Clerk. Each user's images stay private to them.

The frontend is Next.js, and the backend is FastAPI. The original deployment used Vercel, Cloud Run, Cloud Storage, Cloud SQL for vector search, and Vertex AI.

## License

[MIT](LICENSE)
