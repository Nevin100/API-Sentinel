from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    redis_url: str = "redis://localhost:6379/0"
    check_interval_seconds: int = 300
    alert_webhook_url: str = ""   # Discord webhook URL for downtime alerts
    alert_threshold: int = 2      # consecutive failures before alerting

    class Config:
        env_file = ".env"


settings = Settings()
