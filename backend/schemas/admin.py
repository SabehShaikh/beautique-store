"""
Pydantic schemas for admin authentication and analytics.
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class AdminLogin(BaseModel):
    """Schema for admin login request."""

    username: str
    password: str


class AdminUserResponse(BaseModel):
    """Schema for admin user in login response (excludes password)."""

    id: UUID
    username: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime
    last_login: datetime | None = None

    model_config = {"from_attributes": True}


class AdminLoginResponse(BaseModel):
    """Schema for admin login response with JWT token."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int = 86400  # 24 hours in seconds
    admin: AdminUserResponse


class AdminUser(BaseModel):
    """Schema for admin user response (excludes password)."""

    id: UUID
    username: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime
    last_login: datetime | None = None

    model_config = {"from_attributes": True}


class DashboardAnalytics(BaseModel):
    """Schema for admin dashboard analytics."""

    total_orders: int
    pending_payment: int
    total_revenue: float
    orders_by_status: dict[str, int]
