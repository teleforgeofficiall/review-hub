from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import get_settings
from app.database import init_db, close_db
from app.middleware.security import RateLimitMiddleware
from app.routers.auth import router as auth_router
from app.routers.tasks import router as tasks_router
from app.routers.submissions import router as submissions_router
from app.routers.withdrawals import router as withdrawals_router
from app.routers.channels import router as channels_router
from app.routers.admin import router as admin_router
from app.routers.upload import router as upload_router
from app.routers.notifications import router as notifications_router
from app.routers.wallet import router as wallet_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="Review Hub API",
    description="Telegram Mini App Backend API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RateLimitMiddleware)


app.include_router(auth_router)
app.include_router(tasks_router)
app.include_router(submissions_router)
app.include_router(withdrawals_router)
app.include_router(channels_router)
app.include_router(admin_router)
app.include_router(upload_router)
app.include_router(notifications_router)
app.include_router(wallet_router)

uploads_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "..", "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Review Hub API is running"}


@app.get("/")
async def root():
    return {"message": "Review Hub API", "docs": "/docs"}
