from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import jwt
import uuid
import logging

from app.config import get_settings
from app.database import get_db
from app.models.user import User
from app.schemas.auth import TelegramAuthRequest, AuthResponse, UserResponse
from app.utils.telegram import validate_telegram_init_data, check_auth_date
from app.utils.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])
settings = get_settings()


def create_access_token(telegram_id: int, is_admin: bool = False) -> str:
    expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRY_HOURS)
    payload = {
        "sub": str(telegram_id),
        "is_admin": is_admin,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


@router.post("/telegram", response_model=AuthResponse)
async def auth_telegram(
    req: TelegramAuthRequest,
    db: AsyncSession = Depends(get_db),
    start_param: str = Query(None, alias="start"),
):
    logger.info(f"[AUTH] initData length={len(req.initData)}, first100={req.initData[:100]}")
    user_data = validate_telegram_init_data(req.initData, settings.BOT_TOKEN)
    if not user_data:
        logger.error(f"[AUTH] Validation failed for initData length={len(req.initData)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Telegram data",
        )

    auth_date = user_data.get("auth_date", 0)
    if not check_auth_date(auth_date):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Telegram data expired",
        )

    tg_user = user_data.get("user")
    if not tg_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing user data",
        )

    telegram_id = tg_user["id"]
    referral_code_from_url = user_data.get("start_param")

    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    user = result.scalar_one_or_none()

    if user is None:
        admin_ids = [int(x.strip()) for x in settings.ADMIN_IDS.split(",") if x.strip()]
        new_ref_code = f"ref_{uuid.uuid4().hex[:8]}"
        referred_by = None
        if referral_code_from_url and referral_code_from_url.startswith("ref_"):
            ref_result = await db.execute(
                select(User).where(User.referral_code == referral_code_from_url)
            )
            referrer = ref_result.scalar_one_or_none()
            if referrer:
                referred_by = referral_code_from_url

        user = User(
            telegram_id=telegram_id,
            username=tg_user.get("username"),
            first_name=tg_user.get("first_name"),
            last_name=tg_user.get("last_name"),
            language_code=tg_user.get("language_code"),
            is_premium=tg_user.get("is_premium", False),
            is_admin=telegram_id in admin_ids,
            referral_code=new_ref_code,
            referred_by=referred_by,
        )
        db.add(user)
        await db.flush()

        if referred_by and referrer:
            from app.models.transaction import Transaction
            referrer.balance += 10
            referrer.total_earned += 10
            referrer.referral_count += 1
            tx = Transaction(
                user_id=referrer.id,
                type="referral_bonus",
                amount=10,
                balance_after=float(referrer.balance),
                description=f"Referral bonus for inviting {user.first_name}",
                reference_id=user.id,
            )
            db.add(tx)
    else:
        user.username = tg_user.get("username") or user.username
        user.first_name = tg_user.get("first_name") or user.first_name
        user.last_name = tg_user.get("last_name") or user.last_name
        user.language_code = tg_user.get("language_code") or user.language_code
        user.is_premium = tg_user.get("is_premium", False)
        user.last_active = datetime.utcnow()

    token = create_access_token(telegram_id, user.is_admin)

    return AuthResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            telegram_id=user.telegram_id,
            username=user.username,
            first_name=user.first_name,
            last_name=user.last_name,
            language_code=user.language_code,
            is_premium=user.is_premium,
            balance=float(user.balance),
            is_admin=user.is_admin,
            total_earned=float(user.total_earned),
            tasks_completed=user.tasks_completed,
            referral_code=user.referral_code,
            referral_count=user.referral_count,
            created_at=user.created_at,
            last_active=user.last_active,
        ),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return UserResponse(
        id=user.id,
        telegram_id=user.telegram_id,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        language_code=user.language_code,
        is_premium=user.is_premium,
        balance=float(user.balance),
        is_admin=user.is_admin,
        total_earned=float(user.total_earned),
        tasks_completed=user.tasks_completed,
        referral_code=user.referral_code,
        referral_count=user.referral_count,
        created_at=user.created_at,
        last_active=user.last_active,
    )
