from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.notification import Notification
from app.utils.auth import require_admin

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


class BroadcastRequest(BaseModel):
    title: str
    message: str


@router.post("/broadcast")
async def broadcast_message(
    req: BroadcastRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.is_banned == False))
    users = result.scalars().all()

    notifications = [
        Notification(user_id=user.telegram_id, title=req.title, message=req.message)
        for user in users
    ]
    db.add_all(notifications)
    await db.flush()

    return {"message": f"Broadcast sent to {len(users)} users"}


@router.get("")
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_admin),
):
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == user.telegram_id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    return result.scalars().all()


@router.put("/{notification_id}/read")
async def mark_read(
    notification_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_admin),
):
    result = await db.execute(
        select(Notification).where(Notification.id == notification_id)
    )
    notif = result.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Not found")
    notif.is_read = True
    await db.flush()
    return {"message": "Marked as read"}
