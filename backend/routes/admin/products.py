"""
Admin product management routes.

Handles CRUD operations and image uploads for products.
All endpoints require JWT authentication.
"""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from middleware.auth import get_current_admin
from models.admin import AdminUser
from models.product import Product, ProductCategory
from schemas.product import (
    Product as ProductSchema,
    ProductCreate,
    ProductListResponse,
    ProductUpdate,
)
from services.cloudinary import upload_multiple_images

router = APIRouter()


@router.get(
    "",
    response_model=ProductListResponse,
    summary="List all products (admin)",
    description="Returns paginated list of all products including inactive ones",
)
async def list_products_admin(
    category: ProductCategory | None = None,
    search: str | None = None,
    is_active: bool | None = None,
    page: Annotated[int, Query(ge=1)] = 1,
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProductListResponse:
    """
    List all products for admin management.

    Unlike the public endpoint, this includes inactive products.

    Args:
        category: Filter by product category.
        search: Search in name and description.
        is_active: Filter by active status.
        page: Page number (1-indexed).
        limit: Items per page (1-50).
        db: Database session.
        current_admin: Authenticated admin user.

    Returns:
        ProductListResponse: Paginated list of products.
    """
    # Build base query for all products
    query = select(Product)

    # Apply filters
    if category:
        query = query.where(Product.category == category)

    if is_active is not None:
        query = query.where(Product.is_active == is_active)

    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                Product.name.ilike(search_term),
                Product.description.ilike(search_term),
            )
        )

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


@router.get(
    "/{id}",
    response_model=ProductSchema,
    summary="Get product details (admin)",
    description="Returns product details including inactive products",
)
async def get_product_admin(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProductSchema:
    """
    Get product details for admin.

    Unlike the public endpoint, this returns inactive products too.

    Args:
        id: Product UUID.
        db: Database session.
        current_admin: Authenticated admin user.

    Returns:
        Product: Product details.

    Raises:
        HTTPException: 404 if product not found.
    """
    result = await db.execute(select(Product).where(Product.id == id))
    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return ProductSchema.model_validate(product)


@router.post(
    "",
    response_model=ProductSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create product",
    description="Creates a new product",
)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProductSchema:
    """
    Create a new product.

    Args:
        product_data: Product creation data.
        db: Database session.
        current_admin: Authenticated admin user.

    Returns:
        Product: Created product.
    """
    product = Product(
        name=product_data.name,
        category=product_data.category.value,  # Use enum value (string) directly
        regular_price=product_data.regular_price,
        sale_price=product_data.sale_price,
        description=product_data.description,
        images=product_data.images,
        sizes=product_data.sizes,
        colors=product_data.colors,
        is_bestseller=product_data.is_bestseller,
        is_active=True,
    )

    db.add(product)
    await db.commit()
    await db.refresh(product)

    return ProductSchema.model_validate(product)


@router.put(
    "/{id}",
    response_model=ProductSchema,
    summary="Update product",
    description="Updates an existing product",
)
async def update_product(
    id: UUID,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> ProductSchema:
    """
    Update an existing product.

    Args:
        id: Product UUID.
        product_data: Product update data.
        db: Database session.
        current_admin: Authenticated admin user.

    Returns:
        Product: Updated product.

    Raises:
        HTTPException: 404 if product not found.
    """
    # Fetch product
    result = await db.execute(select(Product).where(Product.id == id))
    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    # Update only provided fields
    update_data = product_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "category" and value is not None:
            # Use enum value (string) directly
            setattr(product, field, value.value if hasattr(value, 'value') else value)
        else:
            setattr(product, field, value)

    await db.commit()
    await db.refresh(product)

    return ProductSchema.model_validate(product)


@router.delete(
    "/{id}",
    summary="Delete product",
    description="Soft-deletes a product (sets is_active=false)",
)
async def delete_product(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> dict:
    """
    Soft-delete a product.

    Sets is_active to False instead of hard deleting.
    This preserves order history integrity.

    Args:
        id: Product UUID.
        db: Database session.
        current_admin: Authenticated admin user.

    Returns:
        dict: Success message.

    Raises:
        HTTPException: 404 if product not found.
    """
    # Fetch product
    result = await db.execute(select(Product).where(Product.id == id))
    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    # Soft delete
    product.is_active = False
    await db.commit()

    return {"message": "Product deleted successfully"}


@router.delete(
    "/{id}/permanent",
    summary="Permanently delete product",
    description="Permanently removes a product from the database (cannot be undone)",
)
async def permanent_delete_product(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> dict:
    """
    Permanently delete a product from the database.

    WARNING: This action cannot be undone. The product and all
    associated data will be permanently removed.

    Args:
        id: Product UUID.
        db: Database session.
        current_admin: Authenticated admin user.

    Returns:
        dict: Success message.

    Raises:
        HTTPException: 404 if product not found.
    """
    # Fetch product
    result = await db.execute(select(Product).where(Product.id == id))
    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    # Permanently delete from database
    await db.delete(product)
    await db.commit()

    return {"message": "Product permanently deleted"}


@router.post(
    "/{id}/images",
    summary="Upload product images",
    description="Uploads images to Cloudinary and adds URLs to product",
)
async def upload_product_images(
    id: UUID,
    images: Annotated[list[UploadFile], File(description="Images to upload (max 10)")],
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
) -> dict:
    """
    Upload images to Cloudinary and add URLs to product.

    Args:
        id: Product UUID.
        images: List of image files to upload.
        db: Database session.
        current_admin: Authenticated admin user.

    Returns:
        dict: List of uploaded image URLs.

    Raises:
        HTTPException: 404 if product not found.
        HTTPException: 422 if too many images.
    """
    # Validate image count
    if len(images) > 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Maximum 10 images allowed per upload",
        )

    # Fetch product
    result = await db.execute(select(Product).where(Product.id == id))
    product = result.scalar_one_or_none()

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    # Upload images to Cloudinary
    uploaded_urls = await upload_multiple_images(images)

    # Append to existing images
    existing_images = product.images or []
    all_images = existing_images + uploaded_urls

    # Ensure total doesn't exceed 10
    if len(all_images) > 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Total images would exceed 10. Product has {len(existing_images)} images, trying to add {len(uploaded_urls)}.",
        )

    product.images = all_images
    await db.commit()

    return {"images": uploaded_urls}
