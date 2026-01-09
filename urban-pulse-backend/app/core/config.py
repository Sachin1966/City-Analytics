import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Urban Pulse Analytics Backend"
    API_V1_STR: str = "/api"
    
    # Data Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    
    CITY_DATA_FILE: str = "cost_of_living.csv"
    TREND_DATA_FILE: str = "global_trends.csv"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["*"]

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
