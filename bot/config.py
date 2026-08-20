import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    BOT_TOKEN = os.getenv("BOT_TOKEN", "")
    WEBHOOK_URL = os.getenv("WEBHOOK_URL", "")
    ADMIN_IDS = [
        int(x.strip()) for x in os.getenv("ADMIN_IDS", "").split(",") if x.strip()
    ]
    FRONTEND_URL = os.getenv("FRONTEND_URL", "https://your-frontend-url.vercel.app")
    BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
