from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    task_type: str
    channel_id: Optional[int] = None
    reward: float = 0.0
    proof_required: bool = True
    instructions: Optional[str] = None
    max_submissions: Optional[int] = None
    task_variant: str = "single"
    bulk_reward: Optional[float] = None
    bulk_unlock_threshold: int = 5
    process_video_url: Optional[str] = None
    comment_slots: Optional[str] = None
    app_link: Optional[str] = None
    submit_fields: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    task_type: Optional[str] = None
    channel_id: Optional[int] = None
    reward: Optional[float] = None
    proof_required: Optional[bool] = None
    instructions: Optional[str] = None
    is_active: Optional[bool] = None
    max_submissions: Optional[int] = None
    task_variant: Optional[str] = None
    bulk_reward: Optional[float] = None
    bulk_unlock_threshold: Optional[int] = None
    process_video_url: Optional[str] = None
    comment_slots: Optional[str] = None
    app_link: Optional[str] = None
    submit_fields: Optional[str] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    task_type: str
    channel_id: Optional[int] = None
    reward: float
    proof_required: bool
    instructions: Optional[str] = None
    is_active: bool
    max_submissions: Optional[int] = None
    current_submissions: int
    task_variant: str
    bulk_reward: Optional[float] = None
    bulk_unlock_threshold: int
    process_video_url: Optional[str] = None
    comment_slots: Optional[str] = None
    app_link: Optional[str] = None
    submit_fields: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
