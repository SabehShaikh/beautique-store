"""
Admin order management routes.

Handles order listing, status updates, and CSV export.
All endpoints require JWT authentication.
"""

import csv
import io
from datetime import date
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth import get_current_admin
from models.admin import AdminUser
from models.order import (
    DeliveryStatus,
    Order,
    OrderStatus,
    PaymentStatus,
)
from schemas.order import (
    OrderDetail,
    OrderItem,
    OrderListItem,
    OrderListResponse,
    OrderStatusUpdate,
)

router = APIRouter()


@router.get(
    "",
    response_model=OrderListResponse,
    summary="List all orders",
    description="Returns paginated list of orders with filters",
)
async def list_orders(
    payment_status: PaymentStatus | None = None,
    order_status: OrderStatus | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> OrderListResponse:
    """
    List all orders with optional filters.

    Args:
        payment_status: Filter by payment status.
        order_status: Filter by order status.
        page: Page number (1-indexed).
        limit: Items per page (1-50).
        db: Database session.
        current_admin: Authenticated admin user.

    Returns:
        OrderListResponse: Paginated list of orders.
    """
    # Build base query
    query = select(Order)

    # Apply filters
    if payment_status:
        query = query.where(Order.payment_status == payment_status)

    if order_status:
        query = query.where(Order.order_status == order_status)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Calculate pagination
    pages = (total + limit - 1) // limit if total > 0 else 1
    offset = (page - 1) * limit

    # Fetch orders with pagination
    query = query.order_by(Order.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    orders = result.scalars().all()

    return OrderListResponse(
        items=[OrderListItem.model_validate(o) for o in orders],
        total=total,
        page=page,
        limit=limit,
        total_pages=pages,
    )


@router.get(
    "/export",
    summary="Export orders",
    description="Returns orders as CSV file",
)
async def export_orders(
    start_date: date | None = None,
    end_date: date | None = None,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> StreamingResponse:
    """
    Export orders as CSV file.

    Args:
        start_date: Filter orders from this date.
        end_date: Filter orders until this date.
        db: Database session.
        current_admin: Authenticated admin user.

    Returns:
        StreamingResponse: CSV file download.
    """
    # Build query
    query = select(Order)

    if start_date:
        query = query.where(Order.order_date >= start_date)

    if end_date:
        query = query.where(Order.order_date <= end_date)

    query = query.order_by(Order.created_at.desc())

    result = await db.execute(query)
    orders = result.scalars().all()

    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow([
        "Order ID",
        "Customer Name",
        "Phone",
        "WhatsApp",
        "Email",
        "City",
        "Address",
        "Total Amount",
        "Payment Method",
        "Payment Status",
        "Order Status",
        "Delivery Status",
        "Order Date",
        "Items",
    ])

    # Write data rows
    for order in orders:
        items_str = "; ".join([
            f"{item['name']} ({item['size']}/{item['color']}) x{item['quantity']}"
            for item in order.items
        ])

        writer.writerow([
            order.order_id,
            order.customer_name,
            order.phone,
            order.whatsapp,
            order.email or "",
            order.city,
            order.address,
            float(order.total_amount),
            order.payment_method.value,
            order.payment_status.value,
            order.order_status.value,
            order.delivery_status.value,
            order.order_date.isoformat(),
            items_str,
        ])

    output.seek(0)

    # Generate filename with date range
    filename = "orders"
    if start_date:
        filename += f"_from_{start_date.isoformat()}"
    if end_date:
        filename += f"_to_{end_date.isoformat()}"
    filename += ".csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get(
    "/{id}",
    response_model=OrderDetail,
    summary="Get order details",
    description="Returns complete order information",
)
async def get_order(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> OrderDetail:
    """
    Get full order details.

    Args:
        id: Order UUID.
        db: Database session.
        current_admin: Authenticated admin user.

    Returns:
        OrderDetail: Complete order information.

    Raises:
        HTTPException: 404 if order not found.
    """
    result = await db.execute(select(Order).where(Order.id == id))
    order = result.scalar_one_or_none()

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    # Convert items to schema
    items = [
        OrderItem(
            product_id=item["product_id"],
            name=item["name"],
            size=item["size"],
            color=item["color"],
            quantity=item["quantity"],
            price=item["price"],
        )
        for item in order.items
    ]

    return OrderDetail(
        id=order.id,
        order_id=order.order_id,
        customer_name=order.customer_name,
        phone=order.phone,
        whatsapp=order.whatsapp,
        email=order.email,
        address=order.address,
        city=order.city,
        country=order.country,
        notes=order.notes,
        items=items,
        total_amount=float(order.total_amount),
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        order_status=order.order_status,
        delivery_status=order.delivery_status,
        estimated_delivery=order.estimated_delivery,
        tracking_notes=order.tracking_notes,
        order_date=order.order_date,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


@router.patch(
    "/{id}/status",
    response_model=OrderDetail,
    summary="Update order status",
    description="Updates payment, order, or delivery status and tracking notes",
)
async def update_order_status(
    id: UUID,
    status_update: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> OrderDetail:
    """
    Update order status fields.

    Args:
        id: Order UUID.
        status_update: Status update data.
        db: Database session.
        current_admin: Authenticated admin user.

    Returns:
        OrderDetail: Updated order.

    Raises:
        HTTPException: 404 if order not found.
    """
    result = await db.execute(select(Order).where(Order.id == id))
    order = result.scalar_one_or_none()

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    # Update provided fields
    if status_update.payment_status is not None:
        order.payment_status = PaymentStatus(status_update.payment_status.value)

    if status_update.order_status is not None:
        order.order_status = OrderStatus(status_update.order_status.value)

    if status_update.delivery_status is not None:
        order.delivery_status = DeliveryStatus(status_update.delivery_status.value)

    if status_update.estimated_delivery is not None:
        order.estimated_delivery = status_update.estimated_delivery

    if status_update.tracking_notes is not None:
        order.tracking_notes = status_update.tracking_notes

    await db.commit()
    await db.refresh(order)

    # Convert items to schema
    items = [
        OrderItem(
            product_id=item["product_id"],
            name=item["name"],
            size=item["size"],
            color=item["color"],
            quantity=item["quantity"],
            price=item["price"],
        )
        for item in order.items
    ]

    return OrderDetail(
        id=order.id,
        order_id=order.order_id,
        customer_name=order.customer_name,
        phone=order.phone,
        whatsapp=order.whatsapp,
        email=order.email,
        address=order.address,
        city=order.city,
        country=order.country,
        notes=order.notes,
        items=items,
        total_amount=float(order.total_amount),
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        order_status=order.order_status,
        delivery_status=order.delivery_status,
        estimated_delivery=order.estimated_delivery,
        tracking_notes=order.tracking_notes,
        order_date=order.order_date,
        created_at=order.created_at,
        updated_at=order.updated_at,
    )
