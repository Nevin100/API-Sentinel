from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    redis_url: str = "redis://localhost:6379/0"
    check_interval_seconds: int = 300
    alert_webhook_url: str = ""   # Discord webhook URL for downtime alerts
    alert_threshold: int = 2      # consecutive failures before alerting
    jwt_secret: str = "dev-secret-change-me"
    jwt_expire_days: int = 7
    class Config:
        env_file = ".env"
    


settings = Settings()
