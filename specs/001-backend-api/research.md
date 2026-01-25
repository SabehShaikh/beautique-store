# Research: Beautique Store Backend API

**Feature Branch**: `001-backend-api`
**Date**: 2026-01-18
**Purpose**: Document technology decisions and best practices for implementation

## Technology Decisions

### 1. SQLAlchemy 2.0 Async vs Sync

**Decision**: Use SQLAlchemy 2.0 with **async** patterns

**Rationale**:
- Neon PostgreSQL is serverless and benefits from non-blocking I/O
- FastAPI is async-native; mixing sync ORM creates performance bottlenecks
- SQLAlchemy 2.0 has mature async support with `AsyncSession`
- Modern Python 3.11+ has excellent async/await performance

**Alternatives Considered**:
- Sync SQLAlchemy: Simpler but blocks event loop, defeats FastAPI's async advantage
- Raw asyncpg: Too low-level, loses ORM benefits

**Implementation Pattern**:
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

engine = create_async_engine(DATABASE_URL, echo=False, pool_size=5)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

---

### 2. Image Storage Strategy

**Decision**: Use **Cloudinary** for image storage

**Rationale**:
- Free tier sufficient for MVP (25GB storage, 25GB bandwidth/month)
- Built-in image optimization and transformations
- CDN delivery for fast loading
- Simple SDK integration with Python
- Admin can upload directly; URLs stored in database

**Alternatives Considered**:
- AWS S3: More complex setup, requires CloudFront for CDN, higher cost for small scale
- Local file storage: Not viable for serverless deployment (Hugging Face Spaces)
- Firebase Storage: Good alternative but Cloudinary has better image-specific features

**Implementation Pattern**:
```python
import cloudinary.uploader

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

async def upload_image(file: UploadFile) -> str:
    result = cloudinary.uploader.upload(file.file, folder="beautique-products")
    return result["secure_url"]
```

---

### 3. Order ID Generation Format

**Decision**: Use format **BQ-YYYYMMDD-XXX** (e.g., BQ-20260118-001)

**Rationale**:
- Customer-friendly and easy to communicate via WhatsApp
- Date prefix helps with manual order management
- Sequential suffix provides uniqueness within a day
- Easy to track and sort chronologically

**Alternatives Considered**:
- UUID: Too long for customers to communicate
- Auto-increment integer: Reveals order volume, less professional
- Nanoid: Modern but not human-readable

**Implementation Pattern**:
```python
from datetime import date
from sqlalchemy import func

async def generate_order_id(db: AsyncSession) -> str:
    today = date.today()
    date_str = today.strftime("%Y%m%d")
    prefix = f"BQ-{date_str}-"

    # Count today's orders
    result = await db.execute(
        select(func.count()).where(Order.order_id.like(f"{prefix}%"))
    )
    count = result.scalar() or 0

    return f"{prefix}{count + 1:03d}"
```

---

### 4. Product Deletion Strategy

**Decision**: Use **soft delete** (set `is_active=false`)

**Rationale**:
- Preserves order history integrity (orders reference products)
- Allows recovery of accidentally deleted products
- Simple to implement with query filters
- Aligns with e-commerce best practices

**Alternatives Considered**:
- Hard delete with cascade: Loses historical data
- Hard delete with orphan handling: Complex, data integrity risks

**Implementation Pattern**:
```python
# All public queries filter by is_active
products = await db.execute(
    select(Product).where(Product.is_active == True)
)

# Soft delete
async def delete_product(db: AsyncSession, product_id: UUID):
    product = await db.get(Product, product_id)
    product.is_active = False
    await db.commit()
```

---

### 5. JWT Token Storage

**Decision**: Use **Authorization header with Bearer token** (primary) and **httpOnly cookie** (optional)

**Rationale**:
- Authorization header is standard for REST APIs
- httpOnly cookie provides CSRF protection for admin panel
- Flexible: frontend can choose based on security needs
- Both methods supported by FastAPI

**Alternatives Considered**:
- localStorage only: Vulnerable to XSS
- Cookie only: Requires CSRF protection setup

**Implementation Pattern**:
```python
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> AdminUser:
    token = credentials.credentials
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    # ... verify and return admin
```

---

### 6. Phone Number Validation

**Decision**: Use **flexible international format** validation (10-15 digits)

**Rationale**:
- Constitution Principle IV requires international support
- Pakistani numbers: 03XX-XXXXXXX (11 digits)
- International: +1-XXX-XXX-XXXX (varies by country)
- Real verification happens via WhatsApp, not technical validation

**Alternatives Considered**:
- Strict Pakistani format: Excludes overseas customers
- No validation: Allows garbage data
- Phone number library: Overkill for MVP, adds dependency

**Implementation Pattern**:
```python
import re
from pydantic import field_validator

PHONE_REGEX = r"^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$"

class OrderCreate(BaseModel):
    phone: str

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        # Remove spaces and dashes for digit count
        digits = re.sub(r"[^\d]", "", v)
        if not (10 <= len(digits) <= 15):
            raise ValueError("Phone must be 10-15 digits")
        if not re.match(PHONE_REGEX, v):
            raise ValueError("Invalid phone format")
        return v
```

---

### 7. Database Connection Pooling

**Decision**: Use **limited connection pool** (5 connections max)

**Rationale**:
- Neon free tier has connection limits
- Serverless deployment benefits from fewer persistent connections
- SQLAlchemy async handles pooling automatically
- 5 connections sufficient for expected load

**Alternatives Considered**:
- No pooling: Connection overhead for each request
- Large pool (20+): Exceeds Neon limits, wastes resources

**Implementation Pattern**:
```python
engine = create_async_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=0,
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=300,    # Recycle connections every 5 minutes
)
```

---

### 8. Alembic Migration Strategy

**Decision**: Use **Alembic with async support** and manual seed scripts

**Rationale**:
- Alembic is the standard for SQLAlchemy migrations
- Async engine support available since Alembic 1.8
- Seed scripts separate from migrations for flexibility
- Version control for schema changes

**Alternatives Considered**:
- Manual SQL scripts: No version tracking, error-prone
- Django-style auto-migrations: Not available for SQLAlchemy

**Implementation Pattern**:
```python
# alembic/env.py
from sqlalchemy.ext.asyncio import create_async_engine

async def run_migrations_online():
    connectable = create_async_engine(config.get_main_option("sqlalchemy.url"))
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
```

---

### 9. Error Response Format

**Decision**: Use **consistent JSON error format** with status codes

**Rationale**:
- Predictable structure for frontend error handling
- HTTP status codes for machine parsing
- Detail messages for debugging
- FastAPI's built-in validation errors already follow this pattern

**Format**:
```json
{
    "detail": "Error message here",
    "errors": [
        {"field": "phone", "message": "Phone must be 10-15 digits"}
    ]
}
```

**HTTP Status Codes**:
- 200: Success
- 201: Created
- 400: Bad Request (invalid input format)
- 401: Unauthorized (missing/invalid token)
- 404: Not Found
- 422: Unprocessable Entity (validation errors)
- 500: Internal Server Error

---

### 10. CORS Configuration

**Decision**: Use **environment-based origin whitelist**

**Rationale**:
- Development needs localhost:3000
- Production needs Vercel domain
- Environment variables allow flexible deployment
- No wildcard (*) for security

**Implementation Pattern**:
```python
from fastapi.middleware.cors import CORSMiddleware

origins = settings.ALLOWED_ORIGINS.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Dependencies Research

### Core Dependencies (requirements.txt)

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | 0.109.0 | Web framework |
| uvicorn[standard] | 0.27.0 | ASGI server |
| sqlalchemy[asyncio] | 2.0.25 | ORM with async |
| asyncpg | 0.29.0 | Async PostgreSQL driver |
| alembic | 1.13.1 | Database migrations |
| pydantic | 2.5.3 | Data validation |
| pydantic-settings | 2.1.0 | Settings management |
| python-jose[cryptography] | 3.3.0 | JWT handling |
| passlib[bcrypt] | 1.7.4 | Password hashing |
| cloudinary | 1.38.0 | Image upload |
| python-multipart | 0.0.6 | File upload support |
| python-dotenv | 1.0.0 | Environment variables |

### Compatibility Notes

- SQLAlchemy 2.0 requires asyncpg for async PostgreSQL (not psycopg2)
- Pydantic v2 has breaking changes from v1; use `pydantic.v1` import if needed
- FastAPI 0.109+ requires Python 3.8+; we use 3.11+
- Cloudinary SDK works synchronously; wrap in `run_in_executor` if needed

---

## Best Practices Applied

### From Constitution

| Principle | Application |
|-----------|-------------|
| I. Backend-First | All endpoints tested via Postman before frontend |
| II. Manual Payment | No payment gateway; status updates manual |
| III. No Customer Auth | JWT for admin only; orders tracked by ID+phone |
| IV. International-Ready | Phone validation accepts international format |
| VI. MCP Context 7 | SQLAlchemy 2.0 async, Pydantic v2, Python 3.11+ |
| VII. Minimal Scope | 16 endpoints only; no extra features |

### FastAPI Best Practices

1. Use dependency injection for database sessions
2. Separate routers by domain (products, orders, admin)
3. Use Pydantic models for request/response validation
4. Document endpoints with OpenAPI metadata
5. Use async/await consistently throughout

### Security Best Practices

1. Never store plaintext passwords (bcrypt with 12 rounds)
2. JWT tokens expire after 24 hours
3. CORS restricted to known origins
4. No secrets in code (environment variables)
5. Input validation on all endpoints
6. Order tracking requires phone verification

---

## Unresolved Questions

None. All technical decisions have been made based on constitution requirements and industry best practices.
