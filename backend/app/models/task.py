from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    task_type = Column(String(50), nullable=False)  # map_review / app_rating / gmail_work
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=True)
    reward = Column(Numeric(10, 2), nullable=False, default=0.00)
    proof_required = Column(Boolean, default=True)
    instructions = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    max_submissions = Column(Integer, nullable=True)  # null = unlimited
    current_submissions = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    channel = relationship("Channel", back_populates="tasks")
    submissions = relationship("Submission", back_populates="task")

    def __repr__(self):
        return f"<Task {self.title}>"
