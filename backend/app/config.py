from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "SmartPort"
    debug: bool = True

settings = Settings()
