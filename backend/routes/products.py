"""
Public product routes.

Handles product browsing, filtering, and searching.

IMPORTANT: Static routes (bestsellers, categories) must be defined BEFORE
the dynamic /{id} route to prevent route conflicts.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.product import Product, ProductCategory
from schemas.product import (
    Product as ProductSchema,
    ProductListResponse,
)

router = APIRouter()


@router.get(
    "",
    response_model=ProductListResponse,
    summary="List all products",
    description="Returns paginated list of active products with optional filters",
)
async def list_products(
    category: ProductCategory | None = None,
    search: str | None = None,
    minPrice: Annotated[float | None, Query(alias="minPrice", ge=0)] = None,
    maxPrice: Annotated[float | None, Query(alias="maxPrice", le=1000000)] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    db: AsyncSession = Depends(get_db),
) -> ProductListResponse:
    """
    List all active products with optional filters.

    Args:
        category: Filter by product category.
        search: Search in name and description.
        minPrice: Minimum price filter.
        maxPrice: Maximum price filter.
        page: Page number (1-indexed).
        limit: Items per page (1-50).
        db: Database session.

    Returns:
        ProductListResponse: Paginated list of products.
    """
    # Build base query for active products
    query = select(Product).where(Product.is_active == True)

    # Apply filters
    if category:
        query = query.where(Product.category == category)

    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
            )
        )

    if minPrice is not None:
        query = query.where(Product.regular_price >= minPrice)

    if maxPrice is not None:
        query = query.where(Product.regular_price <= maxPrice)

    # Count total matching products
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Calculate pagination
    pages = (total + limit - 1) // limit if total > 0 else 1
    offset = (page - 1) * limit

    # Fetch products with pagination
    query = query.order_by(Product.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(query)
    products = result.scalars().all()

    return ProductListResponse(
        items=[ProductSchema.model_validate(p) for p in products],
        total=total,
        page=page,
        limit=limit,
        total_pages=pages,
    )


# Static routes MUST be defined before the dynamic /{id} route


@router.get(
    "/bestsellers",
    response_model=dict,
    summary="Get bestseller products",
    description="Returns products marked as bestsellers",
)
async def get_bestsellers(
    limit: Annotated[int, Query(ge=1, le=20)] = 10,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Get products marked as bestsellers.

    Args:
        limit: Maximum number of products to return (1-20).
        db: Database session.

    Returns:
        dict: List of bestseller products.
    """
    query = (
        select(Product)
        .where(Product.is_active == True, Product.is_bestseller == True)
        .order_by(Product.created_at.desc())
        .limit(limit)
    )

    result = await db.execute(query)
    products = result.scalars().all()

    return {
        "products": [ProductSchema.model_validate(p) for p in products]
    }


# Dynamic route MUST be last


@router.get(
    "/{id}",
    response_model=ProductSchema,
    summary="Get product details",
    description="Returns complete product information by ID",
)
async def get_product(
    id: UUID,
    db: AsyncSession = Depends(get_db),
) -> ProductSchema:
    """
    Get product details by ID.

    Args:
        id: Product UUID.
        db: Database session.

    Returns:
        Product: Product details.

    Raises:
        HTTPException: 404 if product not found.
    """
    result = await db.execute(
        select(Product).where(Product.id == id, Product.is_active == True)
    )
    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return ProductSchema.model_validate(product)
