"""
Admin analytics routes.

Provides dashboard metrics and analytics.
All endpoints require JWT authentication.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth import get_current_admin
from models.admin import AdminUser
from models.order import Order, OrderStatus, PaymentStatus
from schemas.admin import DashboardAnalytics

router = APIRouter()


@router.get(
    "/dashboard",
    response_model=DashboardAnalytics,
    summary="Dashboard analytics",
    description="Returns key business metrics",
)
async def get_dashboard_analytics(
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> DashboardAnalytics:
    """
    Get dashboard analytics.

    Returns:
        - Total orders count
        - Pending payment count
        - Total revenue (from verified payments)
        - Orders by status breakdown

    Args:
        db: Database session.
        current_admin: Authenticated admin user.

    Returns:
        DashboardAnalytics: Dashboard metrics.
    """
    # Total orders
    total_result = await db.execute(select(func.count()).select_from(Order))
    total_orders = total_result.scalar() or 0

    # Pending payments (payment_status = Pending)
    pending_result = await db.execute(
        select(func.count())
        .select_from(Order)
        .where(Order.payment_status == PaymentStatus.Pending)
    )
    pending_payment = pending_result.scalar() or 0

    # Total revenue (only from verified payments)
    revenue_result = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0))
        .where(Order.payment_status == PaymentStatus.Verified)
    )
    total_revenue = float(revenue_result.scalar() or 0)

    # Orders by status
    status_result = await db.execute(
        select(Order.order_status, func.count())
        .group_by(Order.order_status)
    )
    orders_by_status = {
        status.value: count for status, count in status_result.all()
    }

    # Ensure all statuses are present (even if 0)
    for status in OrderStatus:
        if status.value not in orders_by_status:
            orders_by_status[status.value] = 0

    return DashboardAnalytics(
        total_orders=total_orders,
        pending_payment=pending_payment,
        total_revenue=total_revenue,
        orders_by_status=orders_by_status,
    )
