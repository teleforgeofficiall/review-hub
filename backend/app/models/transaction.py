from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Numeric, Text, ForeignKey
from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String(50), nullable=False)  # task_earned / referral_bonus / withdrawal / admin_adjustment
    amount = Column(Numeric(10, 2), nullable=False)
    balance_after = Column(Numeric(10, 2), nullable=False)
    description = Column(Text, nullable=True)
    reference_id = Column(Integer, nullable=True)  # task_id, withdrawal_id, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
