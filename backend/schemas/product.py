"""
Pydantic schemas for product operations.
"""

import re
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Annotated, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, computed_field


class ProductCategory(str, Enum):
    """Product category enumeration."""

    MAXI = "Maxi"
    LEHANGA_CHOLI = "Lehanga Choli"
    LONG_SHIRT = "Long Shirt"
    SHALWAR_KAMEEZ = "Shalwar Kameez"
    GHARARA = "Gharara"


class ProductSize(str, Enum):
    """Available product sizes."""

    S = "S"
    M = "M"
    L = "L"
    XL = "XL"
    XXL = "XXL"


class Product(BaseModel):
    """Schema for product response."""

    id: UUID
    name: str
    category: ProductCategory
    regular_price: float
    sale_price: Optional[float] = None
    description: str
    images: list[str]
    sizes: list[str]
    colors: list[str]
    is_bestseller: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @computed_field
    @property
    def discount_percentage(self) -> Optional[int]:
        """Calculate discount percentage if sale_price is set."""
        if self.sale_price is not None and self.regular_price > 0:
            discount = ((self.regular_price - self.sale_price) / self.regular_price) * 100
            return round(discount)
        return None

    @computed_field
    @property
    def effective_price(self) -> float:
        """Return the effective price (sale_price if available, else regular_price)."""
        return self.sale_price if self.sale_price is not None else self.regular_price


class ProductCreate(BaseModel):
    """Schema for creating a new product."""

    name: Annotated[str, Field(min_length=3, max_length=255)]
    category: ProductCategory
    regular_price: Annotated[float, Field(ge=0, le=1000000)]
    sale_price: Annotated[float | None, Field(ge=0, le=1000000)] = None
    description: Annotated[str, Field(min_length=10, max_length=2000)]
    images: Annotated[list[str], Field(min_length=1, max_length=10)]
    sizes: Annotated[list[str], Field(min_length=1)]
    colors: Annotated[list[str], Field(min_length=1)]
    is_bestseller: bool = False

    @field_validator("images")
    @classmethod
    def validate_images(cls, v: list[str]) -> list[str]:
        """Validate that all images are valid URLs."""
        url_pattern = re.compile(
            r"^https?://[^\s/$.?#].[^\s]*$", re.IGNORECASE
        )
        for url in v:
            if not url_pattern.match(url):
                raise ValueError(f"Invalid image URL: {url}")
        return v

    @field_validator("sizes")
    @classmethod
    def validate_sizes(cls, v: list[str]) -> list[str]:
        """Validate that all sizes are valid."""
        valid_sizes = {"S", "M", "L", "XL", "XXL"}
        for size in v:
            if size not in valid_sizes:
                raise ValueError(f"Invalid size: {size}. Must be one of {valid_sizes}")
        return v

    @field_validator("sale_price")
    @classmethod
    def validate_sale_price(cls, v: float | None, info) -> float | None:
        """Validate that sale_price is less than regular_price."""
        if v is not None:
            regular_price = info.data.get("regular_price")
            if regular_price is not None and v >= regular_price:
                raise ValueError("Sale price must be less than regular price")
        return v


class ProductUpdate(BaseModel):
    """Schema for updating an existing product."""

    name: Annotated[str | None, Field(min_length=3, max_length=255)] = None
    category: ProductCategory | None = None
    regular_price: Annotated[float | None, Field(ge=0, le=1000000)] = None
    sale_price: Annotated[float | None, Field(ge=0, le=1000000)] = None
    description: Annotated[str | None, Field(min_length=10, max_length=2000)] = None
    images: Annotated[list[str] | None, Field(min_length=1, max_length=10)] = None
    sizes: Annotated[list[str] | None, Field(min_length=1)] = None
    colors: Annotated[list[str] | None, Field(min_length=1)] = None
    is_bestseller: bool | None = None

    @field_validator("images")
    @classmethod
    def validate_images(cls, v: list[str] | None) -> list[str] | None:
        """Validate that all images are valid URLs."""
        if v is None:
            return v
        url_pattern = re.compile(
            r"^https?://[^\s/$.?#].[^\s]*$", re.IGNORECASE
        )
        for url in v:
            if not url_pattern.match(url):
                raise ValueError(f"Invalid image URL: {url}")
        return v

    @field_validator("sizes")
    @classmethod
    def validate_sizes(cls, v: list[str] | None) -> list[str] | None:
        """Validate that all sizes are valid."""
        if v is None:
            return v
        valid_sizes = {"S", "M", "L", "XL", "XXL"}
        for size in v:
            if size not in valid_sizes:
                raise ValueError(f"Invalid size: {size}. Must be one of {valid_sizes}")
        return v


class ProductListResponse(BaseModel):
    """Schema for paginated product list response."""

    items: list[Product]
    total: int
    page: int
    limit: int
    total_pages: int
