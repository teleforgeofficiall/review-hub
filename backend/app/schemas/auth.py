from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TelegramAuthRequest(BaseModel):
    initData: str


class UserResponse(BaseModel):
    id: int
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    language_code: Optional[str] = None
    is_premium: bool = False
    balance: float = 0.0
    is_admin: bool = False
    total_earned: float = 0.0
    tasks_completed: int = 0
    referral_code: Optional[str] = None
    referral_count: int = 0
    created_at: datetime
    last_active: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
