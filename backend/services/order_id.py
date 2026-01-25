"""
Order ID generation service.

Generates customer-friendly order IDs in the format: BQ-YYYYMMDD-XXX
"""

from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from models.order import Order


async def generate_order_id(db: AsyncSession) -> str:
    """
    Generate a unique order ID in the format BQ-YYYYMMDD-XXX.

    The sequential counter (XXX) resets daily.

    Args:
        db: Database session.

    Returns:
        str: Unique order ID (e.g., "BQ-20260118-001").
    """
    today = date.today()
    date_str = today.strftime("%Y%m%d")
    prefix = f"BQ-{date_str}-"

    # Count today's orders to determine the next sequence number
    result = await db.execute(
        select(func.count()).select_from(Order).where(
            Order.order_id.like(f"{prefix}%")
        )
    )
    count = result.scalar() or 0

    # Generate order ID with zero-padded sequence number
    order_id = f"{prefix}{count + 1:03d}"

    return order_id
