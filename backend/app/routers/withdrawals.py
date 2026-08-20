from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.withdrawal import Withdrawal
from app.schemas.withdrawal import WithdrawalCreate, WithdrawalUpdate, WithdrawalResponse
from app.utils.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/withdrawals", tags=["withdrawals"])


@router.post("", response_model=WithdrawalResponse)
async def create_withdrawal(
    req: WithdrawalCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    if float(user.balance) < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    pending = await db.execute(
        select(Withdrawal).where(
            Withdrawal.user_id == user.id,
            Withdrawal.status.in_(["pending", "processing"]),
        )
    )
    if pending.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You already have a pending withdrawal")

    withdrawal = Withdrawal(
        user_id=user.id,
        amount=req.amount,
        method=req.method,
        upi_id=req.upi_id,
        bank_details=req.bank_details,
    )
    db.add(withdrawal)
    user.balance -= req.amount
    await db.flush()
    return withdrawal


@router.get("", response_model=list[WithdrawalResponse])
async def list_my_withdrawals(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Withdrawal)
        .where(Withdrawal.user_id == user.id)
        .order_by(Withdrawal.created_at.desc())
    )
    return result.scalars().all()


@router.get("/admin/all", response_model=list[WithdrawalResponse])
async def list_all_withdrawals(
    withdrawal_status: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = select(Withdrawal)
    if withdrawal_status:
        query = query.where(Withdrawal.status == withdrawal_status)
    query = query.order_by(Withdrawal.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/{withdrawal_id}/process", response_model=WithdrawalResponse)
async def process_withdrawal(
    withdrawal_id: int,
    req: WithdrawalUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(Withdrawal).where(Withdrawal.id == withdrawal_id))
    withdrawal = result.scalar_one_or_none()
    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")

    if req.status:
        if req.status == "rejected" and withdrawal.status != "rejected":
            user_result = await db.execute(select(User).where(User.id == withdrawal.user_id))
            user = user_result.scalar_one_or_none()
            if user:
                user.balance += withdrawal.amount

        withdrawal.status = req.status
        withdrawal.processed_by = admin.telegram_id
        withdrawal.processed_at = datetime.utcnow()

    if req.admin_note:
        withdrawal.admin_note = req.admin_note

    await db.flush()
    return withdrawal
