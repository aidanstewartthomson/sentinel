from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str
    gcs_bucket: str

    google_cloud_project: str
    vertex_location: str = "global"
    embedding_model: str = "gemini-embedding-2"
    embedding_dimensions: int = 768

    search_max_distance: float = 0.65

    clerk_secret_key: str
    clerk_authorized_party: str = "http://localhost:3000"

    # local-only bypass, leave unset for real auth
    dev_auth_user_id: str | None = None


settings = Settings()
