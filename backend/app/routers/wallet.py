from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/wallet", tags=["wallet"])


@router.get("/transactions")
async def list_transactions(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == user.id)
        .order_by(Transaction.created_at.desc())
        .limit(50)
    )
    return result.scalars().all()


@router.get("/balance")
async def get_balance(user: User = Depends(get_current_user)):
    return {
        "balance": float(user.balance),
        "total_earned": float(user.total_earned),
        "tasks_completed": user.tasks_completed,
    }
