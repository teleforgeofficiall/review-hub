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
    task_variant = Column(String(20), nullable=False, default="single")  # single / bulk
    bulk_reward = Column(Numeric(10, 2), nullable=True)
    bulk_unlock_threshold = Column(Integer, default=5)
    process_video_url = Column(Text, nullable=True)
    comment_slots = Column(Text, nullable=True)  # JSON string: 10 comment slots
    app_link = Column(Text, nullable=True)
    submit_fields = Column(Text, nullable=True)  # JSON string: custom fields for gmail work
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    channel = relationship("Channel", back_populates="tasks")
    submissions = relationship("Submission", back_populates="task")

    def __repr__(self):
        return f"<Task {self.title}>"
