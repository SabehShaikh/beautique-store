"""
Product model for the Beautique Store catalog.

Stores product information including images, sizes, colors, and pricing.
"""

import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import Boolean, Enum, Index, Numeric, String, Text, TypeDecorator
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, TimestampMixin, UUIDMixin


class ProductCategory(str, enum.Enum):
    """Product category enumeration."""

    MAXI = "Maxi"
    LEHANGA_CHOLI = "Lehanga Choli"
    LONG_SHIRT = "Long Shirt"
    SHALWAR_KAMEEZ = "Shalwar Kameez"
    GHARARA = "Gharara"


class ProductCategoryType(TypeDecorator):
    """
    Custom type for handling PostgreSQL enum with proper value mapping.
    Uses VARCHAR in SQLAlchemy but casts to product_category enum in PostgreSQL.
    """

    impl = String(50)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        """Convert Python value to database value."""
        if value is None:
            return None
        if isinstance(value, ProductCategory):
            return value.value
        return str(value)

    def process_result_value(self, value, dialect):
        """Convert database value to Python value."""
        return value


class Product(Base, UUIDMixin, TimestampMixin):
    """
    Product model representing items in the store catalog.

    Attributes:
        id: UUID primary key
        name: Product name (3-255 chars)
        category: One of 5 product categories
        regular_price: Regular price in PKR (0-1,000,000)
        sale_price: Optional sale price in PKR (must be less than regular_price)
        description: Product description (10-2000 chars)
        images: Array of Cloudinary URLs (JSONB)
        sizes: Available sizes (JSONB array)
        colors: Available colors (JSONB array) - typically single color per product
        is_bestseller: Featured in bestsellers section
        is_active: Soft delete flag (False = deleted)
        created_at: Creation timestamp
        updated_at: Last update timestamp
    """

    __tablename__ = "products"

    # Core fields
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    # Using plain VARCHAR - validation handled by Pydantic schema
    category: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    regular_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    sale_price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2),
        nullable=True,
        default=None,
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)

    # JSONB fields for arrays
    images: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )
    sizes: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )
    colors: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    # Flags
    is_bestseller: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        index=True,
    )

    # Indexes for common queries
    __table_args__ = (
        Index("idx_product_category", "category"),
        Index("idx_product_is_bestseller", "is_bestseller"),
        Index("idx_product_regular_price", "regular_price"),
        Index("idx_product_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<Product(id={self.id}, name='{self.name}', category='{self.category}')>"
