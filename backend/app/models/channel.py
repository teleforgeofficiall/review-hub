from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Channel(Base):
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    channel_type = Column(String(20), nullable=False, default="public")  # public / private
    username = Column(String(255), nullable=True)  # @username for public
    chat_id = Column(String(50), nullable=True)  # -100xxxxxxxxxx for private
    invite_link = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    member_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tasks = relationship("Task", back_populates="channel")

    def __repr__(self):
        return f"<Channel {self.name}>"
