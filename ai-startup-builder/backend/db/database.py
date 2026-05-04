from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import create_engine
from backend.core.config import settings

# =========================
# ASYNC ENGINE (FASTAPI APP)
# =========================
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True
)

SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# =========================
# SYNC ENGINE (ALEMBIC ONLY)
# =========================
SYNC_DATABASE_URL = settings.DATABASE_URL.replace(
    "postgresql+asyncpg", "postgresql"
)

sync_engine = create_engine(
    SYNC_DATABASE_URL,
    echo=True
)

# =========================
# BASE MODEL
# =========================
class Base(DeclarativeBase):
    pass

# =========================
# DB SESSION DEPENDENCY
# =========================
async def get_db():
    async with SessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise