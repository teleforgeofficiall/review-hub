"""
Seed script - run once to populate initial data.
Usage: python -m app.seed
"""
import asyncio
import app.database as db_module
from app.database import init_db
from app.models.channel import Channel
from app.models.task import Task
from app.models.setting import Setting

# Import all models so Base.metadata knows about them
from app.models.user import User
from app.models.submission import Submission
from app.models.withdrawal import Withdrawal
from app.models.notification import Notification
from app.models.transaction import Transaction


async def seed():
    await init_db()

    # Create all tables if they don't exist
    async with db_module.engine.begin() as conn:
        await conn.run_sync(db_module.Base.metadata.create_all)
    print("Tables ensured.")

    async with db_module.async_session() as db:
        from sqlalchemy import select, func
        result = await db.execute(select(func.count()).select_from(Channel))
        if result.scalar() > 0:
            print("Database already seeded, skipping.")
            return

        channels = [
            Channel(name="Review Hub Official", channel_type="public", username="reviewhub", is_active=True),
            Channel(name="Tech Reviews India", channel_type="public", username="techreviewsin", is_active=True),
            Channel(name="App Feedback Group", channel_type="private", chat_id="-1001234567890", is_active=True),
        ]
        db.add_all(channels)
        await db.flush()

        tasks = [
            Task(title="Map Review - Local Restaurant", task_type="map_review", channel_id=1, reward=5.00, instructions="Search for the restaurant on Google Maps, leave a review with photos.", is_active=True),
            Task(title="Map Review - Coffee Shop", task_type="map_review", channel_id=1, reward=5.00, instructions="Find the coffee shop, write a detailed review.", is_active=True),
            Task(title="App Rating - Food Delivery App", task_type="app_rating", channel_id=1, reward=10.00, instructions="Download the app, use it once, rate 4-5 stars, leave a text review.", is_active=True),
            Task(title="App Rating - Finance App", task_type="app_rating", channel_id=2, reward=15.00, instructions="Install the app, complete signup, rate and review.", is_active=True),
            Task(title="Gmail Work - Sign Up Verification", task_type="gmail_work", channel_id=3, reward=8.00, instructions="Create Gmail account, verify email, submit screenshot.", is_active=True),
        ]
        db.add_all(tasks)

        settings = [
            Setting(key="min_withdrawal", value="50", description="Minimum withdrawal amount in INR"),
            Setting(key="max_withdrawal", value="5000", description="Maximum withdrawal amount in INR"),
            Setting(key="referral_bonus", value="10", description="Referral bonus in INR"),
            Setting(key="maintenance_mode", value="false", description="Enable maintenance mode"),
        ]
        db.add_all(settings)

        await db.commit()
        print("Seed data inserted successfully!")


if __name__ == "__main__":
    asyncio.run(seed())
