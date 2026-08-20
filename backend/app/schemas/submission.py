from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SubmissionCreate(BaseModel):
    task_id: int
    proof_url: Optional[str] = None
    proof_text: Optional[str] = None


class SubmissionUpdate(BaseModel):
    status: Optional[str] = None
    admin_note: Optional[str] = None


class SubmissionResponse(BaseModel):
    id: int
    user_id: int
    task_id: int
    status: str
    proof_url: Optional[str] = None
    proof_text: Optional[str] = None
    admin_note: Optional[str] = None
    reviewed_by: Optional[int] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
