"""
Public order routes.

Handles order creation and tracking.
"""

import re

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.order import Order, PaymentMethod, PaymentStatus, OrderStatus, DeliveryStatus
from schemas.order import (
    OrderCreate,
    OrderItem,
    OrderResponse,
    OrderTrackingResponse,
)
from services.order_id import generate_order_id

router = APIRouter()


@router.post(
    "",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new order",
    description="Creates a new order with customer details and cart items. Returns generated Order ID.",
)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    """
    Create a new order.

    Generates a unique Order ID in the format BQ-YYYYMMDD-XXX.
    Stores cart items as a snapshot at time of purchase.

    Args:
        order_data: Order creation data including customer details and items.
        db: Database session.

    Returns:
        OrderResponse: Created order with generated Order ID.

    Raises:
        HTTPException: 422 if validation fails.
    """
    # Generate unique order ID
    order_id = await generate_order_id(db)

    # Calculate total amount from items
    total_amount = sum(item.price * item.quantity for item in order_data.items)

    # Convert items to JSON-serializable format
    items_json = [
        {
            "product_id": str(item.product_id),
            "name": item.name,
            "size": item.size,
            "color": item.color,
            "quantity": item.quantity,
            "price": item.price,
        }
        for item in order_data.items
    ]

    # Create order
    order = Order(
        order_id=order_id,
        customer_name=order_data.customer_name,
        phone=order_data.phone,
        whatsapp=order_data.whatsapp,
        email=order_data.email,
        address=order_data.address,
        city=order_data.city,
        country=order_data.country,
        notes=order_data.notes,
        items=items_json,
        total_amount=total_amount,
        payment_method=PaymentMethod(order_data.payment_method.value),
        payment_status=PaymentStatus.Pending,
        order_status=OrderStatus.Received,
        delivery_status=DeliveryStatus.Not_Started,
    )

    db.add(order)
    await db.commit()
    await db.refresh(order)

    return OrderResponse.model_validate(order)


@router.get(
    "/track",
    response_model=OrderTrackingResponse,
    summary="Track order",
    description="Returns order details when Order ID and phone number match.",
)
async def track_order(
    order_id: str = Query(..., description="Order ID (e.g., BQ-20260118-001)"),
    phone: str = Query(..., description="Phone number used when ordering"),
    db: AsyncSession = Depends(get_db),
) -> OrderTrackingResponse:
    """
    Track an order by Order ID and phone number.

    Returns "Order not found" if either doesn't match (for security).

    Args:
        order_id: Customer-facing Order ID.
        phone: Phone number used during checkout.
        db: Database session.

    Returns:
        OrderTrackingResponse: Order tracking information.

    Raises:
        HTTPException: 404 if order not found or phone doesn't match.
    """
    # Normalize phone number for comparison (remove non-digits)
    phone_digits = re.sub(r"[^\d]", "", phone)

    # Find order by order_id
    result = await db.execute(
        select(Order).where(Order.order_id == order_id)
    )
    order = result.scalar_one_or_none()

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    # Verify phone number (compare digits only)
    order_phone_digits = re.sub(r"[^\d]", "", order.phone)
    if phone_digits != order_phone_digits:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    # Convert items from JSON to schema
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

    return OrderTrackingResponse(
        order_id=order.order_id,
        customer_name=order.customer_name,
        items=items,
        total_amount=float(order.total_amount),
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        order_status=order.order_status,
        delivery_status=order.delivery_status,
        estimated_delivery=order.estimated_delivery,
        tracking_notes=order.tracking_notes,
        order_date=order.order_date,
    )
