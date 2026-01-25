"""
Database configuration with async SQLAlchemy 2.0.

Provides async engine, session factory, and FastAPI dependency.
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from config import settings


# Create async engine with connection pooling
# Pool settings optimized for Neon serverless (max 10 connections)
engine = create_async_engine(
    settings.database_url,
    echo=settings.is_development,  # SQL logging in dev only
    pool_size=5,
    max_overflow=0,
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,  # Recycle connections every 5 minutes
)

# Session factory with recommended settings
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Prevent lazy loading issues after commit
    autocommit=False,
    autoflush=False,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""

    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides an async database session.

    Yields:
        AsyncSession: Database session for the request.

    Usage:
        @app.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
