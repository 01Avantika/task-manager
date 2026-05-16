from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings


BASE_DIR = Path(__file__).resolve().parent


class Settings(BaseSettings):
    mongo_uri: str = Field(default="mongodb://localhost:27017/team_task_manager", alias="MONGO_URI")
    secret_key: str = Field(default="dev-secret-change-me", alias="SECRET_KEY")
    cors_origins: str = Field(default="http://localhost:5173", alias="CORS_ORIGINS")
    access_token_expire_minutes: int = Field(default=30, alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=7, alias="REFRESH_TOKEN_EXPIRE_DAYS")

    @property
    def allowed_origins(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    class Config:
        env_file = BASE_DIR / ".env"
        populate_by_name = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
