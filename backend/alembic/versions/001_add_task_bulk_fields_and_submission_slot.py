"""add task bulk fields and submission slot_index

Revision ID: 001_add_bulk_fields
Revises: None
Create Date: 2026-08-20

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001_add_bulk_fields"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("tasks", sa.Column("task_variant", sa.String(20), nullable=False, server_default="single"))
    op.add_column("tasks", sa.Column("bulk_reward", sa.Numeric(10, 2), nullable=True))
    op.add_column("tasks", sa.Column("bulk_unlock_threshold", sa.Integer(), server_default="5"))
    op.add_column("tasks", sa.Column("process_video_url", sa.Text(), nullable=True))
    op.add_column("tasks", sa.Column("comment_slots", sa.Text(), nullable=True))
    op.add_column("tasks", sa.Column("app_link", sa.Text(), nullable=True))
    op.add_column("tasks", sa.Column("submit_fields", sa.Text(), nullable=True))
    op.add_column("submissions", sa.Column("slot_index", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("submissions", "slot_index")
    op.drop_column("tasks", "submit_fields")
    op.drop_column("tasks", "app_link")
    op.drop_column("tasks", "comment_slots")
    op.drop_column("tasks", "process_video_url")
    op.drop_column("tasks", "bulk_unlock_threshold")
    op.drop_column("tasks", "bulk_reward")
    op.drop_column("tasks", "task_variant")
