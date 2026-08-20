from datetime import datetime
import uuid
from sqlalchemy import Column, BigInteger, String, Boolean, DateTime, Integer, Numeric
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    telegram_id = Column(BigInteger, unique=True, nullable=False, index=True)
    username = Column(String(255), nullable=True)
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)
    language_code = Column(String(10), nullable=True)
    is_premium = Column(Boolean, default=False)
    balance = Column(Numeric(10, 2), default=0.00)
    is_admin = Column(Boolean, default=False)
    is_banned = Column(Boolean, default=False)
    total_earned = Column(Numeric(10, 2), default=0.00)
    tasks_completed = Column(Integer, default=0)
    referral_code = Column(String(20), unique=True, nullable=True)
    referred_by = Column(String(20), nullable=True)
    referral_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_active = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<User {self.telegram_id}: {self.username}>"
