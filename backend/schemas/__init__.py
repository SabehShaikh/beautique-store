"""
Pydantic schemas for request/response validation.

Exports all schemas for easy importing.
"""

from schemas.admin import (
    AdminLogin,
    AdminLoginResponse,
    AdminUser,
    DashboardAnalytics,
)
from schemas.order import (
    OrderCreate,
    OrderDetail,
    OrderItem,
    OrderListResponse,
    OrderResponse,
    OrderStatusUpdate,
    OrderTrackingResponse,
)
from schemas.product import (
    Product,
    ProductCreate,
    ProductListResponse,
    ProductUpdate,
)

__all__ = [
    # Admin
    "AdminLogin",
    "AdminLoginResponse",
    "AdminUser",
    "DashboardAnalytics",
    # Order
    "OrderItem",
    "OrderCreate",
    "OrderResponse",
    "OrderTrackingResponse",
    "OrderDetail",
    "OrderStatusUpdate",
    "OrderListResponse",
    # Product
    "Product",
    "ProductCreate",
    "ProductUpdate",
    "ProductListResponse",
]
