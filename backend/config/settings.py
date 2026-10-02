import os
from typing import Optional, List

try:
    from pydantic_settings import BaseSettings  # type: ignore
except ImportError:
    from pydantic import BaseModel as BaseSettings  # type: ignore


class Settings(BaseSettings):
    PROJECT_NAME: str = "Currency Analysis Institutional FX API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Security & JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", "currencyanalysis-super-secret-jwt-key-fx-intelligence-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Supabase Configuration
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL", None)
    SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_KEY", None)
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY", None)

    # Exchange rate sync interval (seconds)
    RATE_SYNC_INTERVAL: int = 60
    ALERT_CHECK_INTERVAL: int = 30

    # Self-ping URL to prevent Render free tier sleep (set to your Render backend URL)
    SELF_PING_URL: Optional[str] = os.getenv("SELF_PING_URL", None)

    # CORS — allow localhost dev + any Vercel deployment + custom domains
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "https://*.vercel.app",
        "https://currency-analysis.vercel.app",
        "https://currencyanalysis.vercel.app",
    ]

    class Config:
        env_file = "backend/.env"
        case_sensitive = True


settings = Settings()
