from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    redis_url: str = "redis://localhost:6379/0"
    check_interval_seconds: int = 300
    alert_webhook_url: str = ""   # Discord webhook URL for downtime alerts
    alert_threshold: int = 2      # consecutive failures before alerting
    jwt_secret: str = "dev-secret-change-me"  # set JWT_SECRET in .env for prod
    jwt_expire_days: int = 7

    # Auth cookie (httpOnly — JS cannot read the token)
    cookie_name: str = "sentinel_token"
    cookie_secure: bool = False   # True in prod (needs HTTPS)
    cookie_samesite: str = "lax"  # "lax" for same-site frontend/backend

    # Comma-separated list, e.g. "https://sentinel.nevinbali.me"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    class Config:
        env_file = ".env"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
