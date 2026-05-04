import asyncio
import sys
import os

# Add the project root to the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db.database import engine, Base
from backend.db.models import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select

async def setup():
    print("🚀 Initializing database...")
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    # Create a session
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        # Check if default user exists
        result = await session.execute(select(User).where(User.id == 1))
        user = result.scalars().first()
        
        if not user:
            print("👤 Creating default test user (ID: 1)...")
            new_user = User(
                id=1,
                email="test@startupbuilder.ai",
                hashed_password="hashed_placeholder_password" # In real app, use passlib
            )
            session.add(new_user)
            await session.commit()
            print("✅ Default user created.")
        else:
            print("ℹ️ Default user already exists.")

    print("✨ Database setup complete!")

if __name__ == "__main__":
    asyncio.run(setup())
