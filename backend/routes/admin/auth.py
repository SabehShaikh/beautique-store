"""
Admin authentication routes.

Handles admin login and token generation.
"""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.admin import AdminUser
from schemas.admin import AdminLogin, AdminLoginResponse, AdminUserResponse
from services.auth import create_access_token, verify_password

router = APIRouter()


@router.post(
    "/login",
    response_model=AdminLoginResponse,
    summary="Admin login",
    description="Authenticates admin and returns JWT token",
)
async def admin_login(
    credentials: AdminLogin,
    db: AsyncSession = Depends(get_db),
) -> AdminLoginResponse:
    """
    Authenticate admin user and return JWT token.

    Args:
        credentials: Username and password.
        db: Database session.

    Returns:
        AdminLoginResponse: JWT token and metadata.

    Raises:
        HTTPException: 401 if credentials are invalid.
    """
    # Find admin by username
    result = await db.execute(
        select(AdminUser).where(
            AdminUser.username == credentials.username,
            AdminUser.is_active == True,
        )
    )
    admin = result.scalar_one_or_none()

    # Verify credentials
    if admin is None or not verify_password(credentials.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Update last_login timestamp
    await db.execute(
        update(AdminUser)
        .where(AdminUser.id == admin.id)
        .values(last_login=datetime.now(timezone.utc))
    )
    await db.commit()

    # Create JWT token
    access_token = create_access_token(data={"sub": str(admin.id)})

    # Build admin response
    admin_data = AdminUserResponse.model_validate(admin)

    return AdminLoginResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=86400,  # 24 hours
        admin=admin_data,
    )
