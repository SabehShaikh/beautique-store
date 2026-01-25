"""
Pydantic schemas for order operations.
"""

import re
from datetime import date, datetime
from enum import Enum
from typing import Annotated
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


class PaymentMethod(str, Enum):
    """Available payment methods."""

    EASYPAISA = "Easypaisa"
    MEEZAN_BANK = "Meezan Bank"
    INTERNATIONAL_BANK = "International Bank"


class PaymentStatus(str, Enum):
    """Payment verification status."""

    PENDING = "Pending"
    PAID = "Paid"
    VERIFIED = "Verified"


class OrderStatus(str, Enum):
    """Order processing status."""

    RECEIVED = "Received"
    PROCESSING = "Processing"
    READY = "Ready"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"


class DeliveryStatus(str, Enum):
    """Delivery progress status."""

    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    OUT_FOR_DELIVERY = "Out for Delivery"
    DELIVERED = "Delivered"


class OrderItem(BaseModel):
    """Schema for order item (cart item snapshot)."""

    product_id: UUID
    name: str
    size: str
    color: str
    quantity: Annotated[int, Field(ge=1)]
    price: Annotated[float, Field(ge=0)]


class OrderCreate(BaseModel):
    """Schema for creating a new order."""

    customer_name: Annotated[str, Field(min_length=3)]
    phone: str
    whatsapp: str
    email: EmailStr | None = None
    address: Annotated[str, Field(min_length=10)]
    city: Annotated[str, Field(min_length=2)]
    country: str | None = None
    notes: Annotated[str | None, Field(max_length=500)] = None
    items: Annotated[list[OrderItem], Field(min_length=1)]
    payment_method: PaymentMethod

    @field_validator("phone", "whatsapp")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """
        Validate phone number format.

        Accepts international formats with 10-15 digits.
        Examples: 03001234567, +923001234567, +1-555-123-4567
        """
        # Remove spaces, dashes, parentheses for digit count
        digits = re.sub(r"[^\d]", "", v)
        if not (10 <= len(digits) <= 15):
            raise ValueError("Phone must be 10-15 digits")

        # Validate format pattern
        pattern = r"^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$"
        if not re.match(pattern, v):
            raise ValueError("Invalid phone format")

        return v


class OrderResponse(BaseModel):
    """Schema for order creation response."""

    id: UUID
    order_id: str
    customer_name: str
    total_amount: float
    payment_status: PaymentStatus
    order_status: OrderStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderTrackingResponse(BaseModel):
    """Schema for order tracking response (customer view)."""

    order_id: str
    customer_name: str
    items: list[OrderItem]
    total_amount: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    order_status: OrderStatus
    delivery_status: DeliveryStatus
    estimated_delivery: date | None = None
    tracking_notes: str | None = None
    order_date: date


class OrderDetail(BaseModel):
    """Schema for full order details (admin view)."""

    id: UUID
    order_id: str
    customer_name: str
    phone: str
    whatsapp: str
    email: str | None = None
    address: str
    city: str
    country: str | None = None
    notes: str | None = None
    items: list[OrderItem]
    total_amount: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    order_status: OrderStatus
    delivery_status: DeliveryStatus
    estimated_delivery: date | None = None
    tracking_notes: str | None = None
    order_date: date
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OrderStatusUpdate(BaseModel):
    """Schema for updating order status."""

    payment_status: PaymentStatus | None = None
    order_status: OrderStatus | None = None
    delivery_status: DeliveryStatus | None = None
    estimated_delivery: date | None = None
    tracking_notes: str | None = None


class OrderListItem(BaseModel):
    """Schema for order list item (summary view)."""

    id: UUID
    order_id: str
    customer_name: str
    total_amount: float
    payment_status: PaymentStatus
    order_status: OrderStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    """Schema for paginated order list response."""

    orders: list[OrderListItem]
    total: int
    page: int
    limit: int
    pages: int
