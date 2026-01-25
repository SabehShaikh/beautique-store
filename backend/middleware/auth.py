"""
Authentication middleware for protected endpoints.

Provides FastAPI dependency for JWT token verification.
"""

from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.admin import AdminUser
from services.auth import verify_token


# HTTP Bearer security scheme
security = HTTPBearer()


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> AdminUser:
    """
    FastAPI dependency to get the current authenticated admin user.

    Extracts JWT from Authorization header, verifies it, and returns
    the associated AdminUser.

    Args:
        credentials: HTTP Bearer token from Authorization header.
        db: Database session.

    Returns:
        AdminUser: The authenticated admin user.

    Raises:
        HTTPException: 401 if token is invalid, expired, or user not found.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Verify the token
    token = credentials.credentials
    payload = verify_token(token)

    if payload is None:
        raise credentials_exception

    # Extract user ID from token
    user_id_str: str | None = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception

    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise credentials_exception

    # Fetch admin user from database
    result = await db.execute(
        select(AdminUser).where(
            AdminUser.id == user_id,
            AdminUser.is_active == True,
        )
    )
    admin = result.scalar_one_or_none()

    if admin is None:
        raise credentials_exception

    return admin
