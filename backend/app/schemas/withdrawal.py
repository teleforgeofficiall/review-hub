from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class WithdrawalCreate(BaseModel):
    amount: float
    method: str = "upi"
    upi_id: Optional[str] = None
    bank_details: Optional[str] = None


class WithdrawalUpdate(BaseModel):
    status: Optional[str] = None
    admin_note: Optional[str] = None


class WithdrawalResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    method: str
    upi_id: Optional[str] = None
    bank_details: Optional[str] = None
    status: str
    admin_note: Optional[str] = None
    processed_by: Optional[int] = None
    processed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
