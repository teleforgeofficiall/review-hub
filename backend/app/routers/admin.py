from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.task import Task
from app.models.submission import Submission
from app.models.withdrawal import Withdrawal
from app.models.channel import Channel
from app.utils.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    users_count = (await db.execute(select(func.count(User.id)))).scalar() or 0
    active_users = (await db.execute(
        select(func.count(User.id)).where(User.is_banned == False)
    )).scalar() or 0
    tasks_count = (await db.execute(select(func.count(Task.id)).where(Task.is_active == True))).scalar() or 0
    channels_count = (await db.execute(select(func.count(Channel.id)).where(Channel.is_active == True))).scalar() or 0

    pending_submissions = (await db.execute(
        select(func.count(Submission.id)).where(Submission.status == "pending")
    )).scalar() or 0
    total_submissions = (await db.execute(select(func.count(Submission.id)))).scalar() or 0

    pending_withdrawals = (await db.execute(
        select(func.count(Withdrawal.id)).where(Withdrawal.status == "pending")
    )).scalar() or 0
    total_payout = (await db.execute(
        select(func.coalesce(func.sum(Withdrawal.amount), 0)).where(Withdrawal.status == "completed")
    )).scalar() or 0

    total_balance = (await db.execute(
        select(func.coalesce(func.sum(User.balance), 0))
    )).scalar() or 0

    return {
        "users": {"total": users_count, "active": active_users},
        "tasks": {"total": tasks_count},
        "channels": {"total": channels_count},
        "submissions": {"pending": pending_submissions, "total": total_submissions},
        "withdrawals": {"pending": pending_withdrawals, "total_payout": float(total_payout)},
        "total_balance": float(total_balance),
    }


@router.get("/user-completed-singles/{user_id}/{task_type}")
async def get_user_completed_singles(user_id: int, task_type: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(func.count(Submission.id))
        .join(Task, Submission.task_id == Task.id)
        .where(
            Submission.user_id == user_id,
            Submission.status == "approved",
            Task.task_type == task_type,
            Task.task_variant == "single",
        )
    )
    count = result.scalar() or 0
    return {"completed_singles": count}
