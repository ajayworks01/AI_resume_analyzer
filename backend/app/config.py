from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    DATABASE_URL: str = "sqlite+aiosqlite:///./resume_analyzer.db"
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 10

    class Config:
        env_file = ".env"


settings = Settings()
