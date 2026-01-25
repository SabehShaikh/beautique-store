"""
AdminUser model for administrator accounts.

Stores admin credentials and account information.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, TimestampMixin, UUIDMixin


class AdminUser(Base, UUIDMixin, TimestampMixin):
    """
    AdminUser model representing administrator accounts.

    Attributes:
        id: UUID primary key
        username: Unique login username
        email: Unique admin email
        password_hash: Bcrypt hashed password
        role: Role (admin, super_admin future)
        is_active: Account active flag
        created_at: Creation timestamp
        last_login: Last successful login timestamp
    """

    __tablename__ = "admin_users"

    # Credentials
    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    # Role and status
    role: Mapped[str] = mapped_column(
        String(50),
        default="admin",
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # Last login tracking
    last_login: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    def __repr__(self) -> str:
        return f"<AdminUser(id={self.id}, username='{self.username}', role='{self.role}')>"
