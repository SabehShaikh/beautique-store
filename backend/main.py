"""
Beautique Store Backend API - Main Application

FastAPI application with CORS, lifespan events, and route registration.
"""

from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from database import engine
from routes import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.

    Manages startup and shutdown events.
    """
    # Startup
    print("Starting Beautique Store API...")
    yield
    # Shutdown
    print("Shutting down Beautique Store API...")
    await engine.dispose()


# Create FastAPI application
app = FastAPI(
    title="Beautique Store Backend API",
    description="""
    RESTful API for Beautique Store e-commerce platform.

    ## Authentication
    - Public endpoints: No authentication required
    - Admin endpoints (/api/admin/*): JWT Bearer token required

    ## Payment Workflow
    Phase 1 uses manual payment verification via WhatsApp.
    No payment gateway integration.
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    description="Returns API health status",
)
async def health_check() -> dict:
    """Return health status of the API."""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# Include API routes
app.include_router(api_router, prefix="/api")


# Custom exception handlers
@app.exception_handler(401)
async def unauthorized_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle 401 Unauthorized errors."""
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": "Invalid or expired token"},
        headers={"WWW-Authenticate": "Bearer"},
    )


@app.exception_handler(404)
async def not_found_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle 404 Not Found errors."""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": "Resource not found"},
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle 500 Internal Server errors."""
    detail = "Internal server error"
    if settings.is_development:
        detail = str(exc)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": detail},
    )
