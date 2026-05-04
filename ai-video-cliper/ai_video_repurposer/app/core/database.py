"""
Async SQLAlchemy database setup.
"""
import ssl
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

# 🔥 aiomysql/pymysql handling
# Strip PostgreSQL specific params if they exist (clean up transition)
if "sslmode=" in DATABASE_URL:
    import re
    DATABASE_URL = re.sub(r"[?&]sslmode=[^&]+", "", DATABASE_URL)

# SSL context for Cloud DBs (AWS RDS / DigitalOcean / PlanetScale)
connect_args = {}

# MySQL SSL configuration for aiomysql
# If you are using a managed service that requires SSL:
if "mysql" in DATABASE_URL and ("rds.amazonaws.com" in DATABASE_URL or "digitalocean" in DATABASE_URL):
    connect_args["ssl"] = True

engine = create_async_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
