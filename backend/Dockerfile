FROM ghcr.io/astral-sh/uv:0.11.26 AS uv

FROM python:3.14-slim

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

COPY --from=uv /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

RUN useradd --create-home --uid 10001 app \
    && chown -R app:app /app

COPY --chown=app:app sentinel ./sentinel

USER app

EXPOSE 8000

CMD ["sh", "-c", "uvicorn sentinel.api.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
