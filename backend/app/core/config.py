"""
Centralized application configuration.

All environment-dependent values are read here, once, via pydantic-settings.
Nothing else in the codebase should call os.environ directly - import
`settings` from this module instead.
"""
from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- App ---
    APP_NAME: str = "ELMS"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

        # --- Database ---
    DATABASE_URL: str

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        # Render (and some other hosts) provide "postgres://" or plain
        # "postgresql://" - SQLAlchemy + psycopg2 needs the explicit driver.
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+psycopg2://", 1)
        if v.startswith("postgresql://") and "+psycopg2" not in v:
            return v.replace("postgresql://", "postgresql+psycopg2://", 1)
        return v

    # --- Security ---
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # --- CORS ---
    # Kept as a plain comma-separated string, NOT List[str] - pydantic-settings
    # tries to JSON-parse env vars typed as List[...] before any validator
    # runs, which breaks on a plain "a,b,c" value. Parse it ourselves instead.
    CORS_ORIGINS_RAW: str = ""

        # --- Messaging ---
    MAX_STUDENT_MESSAGES_PER_DAY: int = 20

    # --- File uploads ---
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 20
    ALLOWED_UPLOAD_EXTENSIONS: str = "pdf,doc,docx,ppt,pptx,xls,xlsx,txt,zip,png,jpg,jpeg"

    # --- Logging ---
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def CORS_ORIGINS(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS_RAW.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def ALLOWED_EXTENSIONS_SET(self) -> set:
        return {ext.strip().lower() for ext in self.ALLOWED_UPLOAD_EXTENSIONS.split(",") if ext.strip()}

@lru_cache
def get_settings() -> Settings:
    """
    Cached settings accessor. Using lru_cache means the .env file is parsed
    only once per process, and the same Settings instance is reused
    everywhere (including as a FastAPI dependency override point in tests).
    """
    return Settings()


settings = get_settings()