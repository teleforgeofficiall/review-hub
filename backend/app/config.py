from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = ""
    BOT_TOKEN: str = ""
    JWT_SECRET: str = "change-this-to-a-random-secret-min-32-chars"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174"
    ADMIN_IDS: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
