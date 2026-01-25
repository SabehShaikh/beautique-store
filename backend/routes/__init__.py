"""
API route aggregation.

Combines all routers for inclusion in main app.
"""

from fastapi import APIRouter

from routes.orders import router as orders_router
from routes.products import router as products_router
from routes.admin import router as admin_router
from models.product import ProductCategory

# Main API router
api_router = APIRouter()

# Include public routes
api_router.include_router(products_router, prefix="/products", tags=["Products"])
api_router.include_router(orders_router, prefix="/orders", tags=["Orders"])

# Include admin routes
api_router.include_router(admin_router, prefix="/admin", tags=["Admin"])


# Standalone categories endpoint (per OpenAPI spec: /api/categories)
@api_router.get(
    "/categories",
    tags=["Products"],
    summary="List all categories",
    description="Returns the 5 product categories",
)
async def list_categories() -> dict:
    """
    List all product categories.

    Returns:
        dict: List of category values.
    """
    return {
        "categories": [category.value for category in ProductCategory]
    }


__all__ = ["api_router"]
