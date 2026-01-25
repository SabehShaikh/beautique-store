"""
Admin routes aggregation.

Combines all admin routers.
"""

from fastapi import APIRouter

from routes.admin.auth import router as auth_router
from routes.admin.products import router as products_router
from routes.admin.orders import router as orders_router
from routes.admin.analytics import router as analytics_router

# Admin router
router = APIRouter()

# Include admin sub-routes
router.include_router(auth_router, tags=["Admin Auth"])
router.include_router(products_router, prefix="/products", tags=["Admin Products"])
router.include_router(orders_router, prefix="/orders", tags=["Admin Orders"])
router.include_router(analytics_router, prefix="/analytics", tags=["Admin Analytics"])

__all__ = ["router"]
