"""Settings loaded from the environment (or a local .env file) via pydantic-settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # LLM providers
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    # GitHub — optional for public repos (raw.githubusercontent.com is unmetered)
    GITHUB_TOKEN: str = ""

    # Supabase (server-side use; service role bypasses RLS)
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Cloudflare Workers deployment target
    CLOUDFLARE_ACCOUNT_ID: str = ""
    CLOUDFLARE_API_TOKEN: str = ""
    CLOUDFLARE_WORKERS_SUBDOMAIN: str = ""

    # CORS: comma-separated list of allowed origins
    FRONTEND_ORIGIN: str = "http://localhost:3000"


settings = Settings()
