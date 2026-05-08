from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database
    MONGODB_URL: str = "mongodb://localhost:27017/taskflow"

    # JWT
    JWT_SECRET: str = "changeme"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # App
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    DEBUG: bool = True
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:5500,http://localhost:5500"

    @property
    def origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = "../.env"
        extra = "ignore"


settings = Settings()
