"""
Order model for the Beautique Store.

Stores customer orders with contact details, cart items snapshot, and status tracking.
"""

import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, Enum, Index, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, TimestampMixin, UUIDMixin


class PaymentMethod(str, enum.Enum):
    """Available payment methods."""

    Easypaisa = "Easypaisa"
    Meezan_Bank = "Meezan Bank"
    International_Bank = "International Bank"


class PaymentStatus(str, enum.Enum):
    """Payment verification status."""

    Pending = "Pending"
    Paid = "Paid"
    Verified = "Verified"


class OrderStatus(str, enum.Enum):
    """Order processing status."""

    Received = "Received"
    Processing = "Processing"
    Ready = "Ready"
    Delivered = "Delivered"
    Cancelled = "Cancelled"


class DeliveryStatus(str, enum.Enum):
    """Delivery progress status."""

    Not_Started = "Not Started"
    In_Progress = "In Progress"
    Out_for_Delivery = "Out for Delivery"
    Delivered = "Delivered"


class Order(Base, UUIDMixin, TimestampMixin):
    """
    Order model representing customer purchases.

    Attributes:
        id: UUID internal identifier
        order_id: Customer-facing ID (BQ-YYYYMMDD-XXX)
        customer_name: Customer full name
        phone: Contact phone number
        whatsapp: WhatsApp number for payment verification
        email: Optional email address
        address: Delivery address
        city: Delivery city
        country: Optional country (defaults to Pakistan)
        notes: Optional order notes
        items: Cart items snapshot (JSONB)
        total_amount: Order total in PKR
        payment_method: Selected payment method
        payment_status: Payment verification state
        order_status: Order processing state
        delivery_status: Delivery progress state
        estimated_delivery: Optional delivery estimate date
        tracking_notes: Admin notes for customer
        order_date: Order placement date
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """

    __tablename__ = "orders"

    # Customer-facing order ID
    order_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )

    # Customer details
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    whatsapp: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Order items snapshot (preserves product details at time of purchase)
    items: Mapped[list[dict]] = mapped_column(JSONB, nullable=False)
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    # Payment
    payment_method: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod, name="payment_method"),
        nullable=False,
    )
    payment_status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="payment_status"),
        default=PaymentStatus.Pending,
        nullable=False,
        index=True,
    )

    # Order status
    order_status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, name="order_status"),
        default=OrderStatus.Received,
        nullable=False,
        index=True,
    )

    # Delivery status
    delivery_status: Mapped[DeliveryStatus] = mapped_column(
        Enum(DeliveryStatus, name="delivery_status"),
        default=DeliveryStatus.Not_Started,
        nullable=False,
    )
    estimated_delivery: Mapped[date | None] = mapped_column(Date, nullable=True)
    tracking_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Dates
    order_date: Mapped[date] = mapped_column(
        Date,
        default=date.today,
        nullable=False,
    )

    # Indexes for common queries
    __table_args__ = (
        Index("idx_order_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<Order(id={self.id}, order_id='{self.order_id}', status='{self.order_status.value}')>"
