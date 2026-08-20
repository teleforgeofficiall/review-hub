from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.task import Task
from app.models.submission import Submission
from app.schemas.submission import SubmissionCreate, SubmissionUpdate, SubmissionResponse
from app.utils.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/submissions", tags=["submissions"])


@router.post("", response_model=SubmissionResponse)
async def create_submission(
    req: SubmissionCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(Task).where(Task.id == req.task_id, Task.is_active == True))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Active task not found")

    if task.max_submissions and task.current_submissions >= task.max_submissions:
        raise HTTPException(status_code=400, detail="Task submission limit reached")

    existing = await db.execute(
        select(Submission).where(
            Submission.user_id == user.id,
            Submission.task_id == req.task_id,
            Submission.status.in_(["pending", "approved"]),
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already submitted this task")

    submission = Submission(
        user_id=user.id,
        task_id=req.task_id,
        proof_url=req.proof_url,
        proof_text=req.proof_text,
    )
    db.add(submission)
    task.current_submissions += 1
    await db.flush()
    return submission


@router.get("", response_model=list[SubmissionResponse])
async def list_my_submissions(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Submission)
        .where(Submission.user_id == user.id)
        .order_by(Submission.created_at.desc())
    )
    return result.scalars().all()


@router.get("/admin/all", response_model=list[SubmissionResponse])
async def list_all_submissions(
    task_id: Optional[int] = None,
    submission_status: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    query = select(Submission)
    if task_id:
        query = query.where(Submission.task_id == task_id)
    if submission_status:
        query = query.where(Submission.status == submission_status)
    query = query.order_by(Submission.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/{submission_id}/review", response_model=SubmissionResponse)
async def review_submission(
    submission_id: int,
    req: SubmissionUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    result = await db.execute(select(Submission).where(Submission.id == submission_id))
    submission = result.scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    if req.status:
        old_status = submission.status
        submission.status = req.status
        submission.reviewed_by = admin.telegram_id
        submission.reviewed_at = datetime.utcnow()

        if req.status == "approved" and old_status != "approved":
            user_result = await db.execute(select(User).where(User.id == submission.user_id))
            user = user_result.scalar_one_or_none()
            if user:
                task_result = await db.execute(select(Task).where(Task.id == submission.task_id))
                task = task_result.scalar_one_or_none()
                if task:
                    user.balance += task.reward
                    user.total_earned += task.reward
                    user.tasks_completed += 1

    if req.admin_note:
        submission.admin_note = req.admin_note

    await db.flush()
    return submission
