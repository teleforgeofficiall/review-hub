from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ChannelCreate(BaseModel):
    name: str
    channel_type: str = "public"
    username: Optional[str] = None
    chat_id: Optional[str] = None
    invite_link: Optional[str] = None


class ChannelUpdate(BaseModel):
    name: Optional[str] = None
    channel_type: Optional[str] = None
    username: Optional[str] = None
    chat_id: Optional[str] = None
    invite_link: Optional[str] = None
    is_active: Optional[bool] = None
    member_count: Optional[int] = None


class ChannelResponse(BaseModel):
    id: int
    name: str
    channel_type: str
    username: Optional[str] = None
    chat_id: Optional[str] = None
    invite_link: Optional[str] = None
    is_active: bool
    member_count: int
    created_at: datetime

    class Config:
        from_attributes = True
