"""
Seed script for creating initial admin user.

Run with: python scripts/seed_admin.py
"""

import asyncio
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import AsyncSessionLocal
from models.admin import AdminUser
from services.auth import hash_password


async def seed_admin() -> None:
    """Create or update the admin user."""
    async with AsyncSessionLocal() as session:
        # Check if admin already exists
        result = await session.execute(
            select(AdminUser).where(AdminUser.username == "admin")
        )
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            # Update existing admin password
            existing_admin.password_hash = hash_password(settings.admin_password)
            await session.commit()
            print("Admin user password updated successfully!")
            print(f"  Username: admin")
            print(f"  Email: {existing_admin.email}")
            print(f"  Password: (from ADMIN_PASSWORD environment variable)")
            return

        # Create admin user
        admin = AdminUser(
            username="admin",
            email="admin@beautique.com",
            password_hash=hash_password(settings.admin_password),
            role="admin",
            is_active=True,
        )

        session.add(admin)
        await session.commit()

        print("Admin user created successfully!")
        print(f"  Username: admin")
        print(f"  Email: admin@beautique.com")
        print(f"  Password: (from ADMIN_PASSWORD environment variable)")


if __name__ == "__main__":
    asyncio.run(seed_admin())
