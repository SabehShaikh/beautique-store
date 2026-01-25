# Implementation Plan: Beautique Store Backend API

**Branch**: `001-backend-api` | **Date**: 2026-01-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-backend-api/spec.md`

## Summary

Build a RESTful API for the Beautique Store e-commerce platform using FastAPI with SQLAlchemy 2.0 async ORM. The API provides product browsing (4 endpoints), order management (2 public endpoints), and admin functionality (10 protected endpoints) with JWT authentication. Images are stored via Cloudinary, and the database is Neon PostgreSQL. No customer authentication - orders tracked via Order ID + phone verification.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI 0.109.0, SQLAlchemy 2.0.25, Pydantic 2.5.3, asyncpg 0.29.0
**Storage**: Neon PostgreSQL (serverless), Cloudinary (images)
**Testing**: Manual API testing with Postman/Thunder Client
**Target Platform**: Hugging Face Spaces (Docker)
**Project Type**: Web application (backend only for Phase 1)
**Performance Goals**: <500ms p95 response time, 100 concurrent users
**Constraints**: Neon free tier (max 10 connections), Cloudinary free tier (25GB)
**Scale/Scope**: ~1000 products, ~100 orders/day initial

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Compliance Notes |
|-----------|--------|------------------|
| I. Backend-First Development | PASS | Backend built and tested before frontend |
| II. Manual Payment Workflow | PASS | No payment gateway; status update endpoints for manual verification |
| III. No Customer Authentication | PASS | JWT for admin only; orders tracked via Order ID + phone |
| IV. International-Ready Design | PASS | Phone validation accepts international format (10-15 digits) |
| V. Professional UI Standards | N/A | Backend only - no UI in this feature |
| VI. MCP Context 7 Compliance | PASS | SQLAlchemy 2.0 async, Pydantic v2, Python 3.11+ |
| VII. Minimal Viable Scope | PASS | 16 endpoints only; no reviews, ratings, inventory, discounts |

**Gate Result**: PASS - All applicable principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/001-backend-api/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Technology decisions
├── data-model.md        # Entity definitions
├── quickstart.md        # Setup guide
├── contracts/
│   └── openapi.yaml     # API contract (OpenAPI 3.1)
└── tasks.md             # Implementation tasks (created by /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── main.py                     # FastAPI app, CORS, lifespan events
├── config.py                   # Pydantic settings from environment
├── database.py                 # SQLAlchemy async engine and session
├── models/
│   ├── __init__.py
│   ├── base.py                 # Base model class
│   ├── product.py              # Product SQLAlchemy model
│   ├── order.py                # Order SQLAlchemy model
│   └── admin.py                # AdminUser SQLAlchemy model
├── schemas/
│   ├── __init__.py
│   ├── product.py              # Product Pydantic schemas
│   ├── order.py                # Order Pydantic schemas
│   └── admin.py                # Admin Pydantic schemas
├── routes/
│   ├── __init__.py
│   ├── products.py             # GET /api/products, /api/products/{id}, /api/categories, /api/products/bestsellers
│   ├── orders.py               # POST /api/orders, GET /api/orders/track
│   └── admin/
│       ├── __init__.py
│       ├── auth.py             # POST /api/admin/login
│       ├── products.py         # Admin product CRUD + image upload
│       ├── orders.py           # Admin order management + export
│       └── analytics.py        # GET /api/admin/analytics/dashboard
├── services/
│   ├── __init__.py
│   ├── cloudinary.py           # Image upload service
│   ├── order_id.py             # Order ID generation (BQ-YYYYMMDD-XXX)
│   └── auth.py                 # JWT token creation/verification
├── middleware/
│   ├── __init__.py
│   └── auth.py                 # JWT verification dependency
├── alembic/
│   ├── versions/               # Migration files
│   ├── env.py                  # Async Alembic config
│   └── script.py.mako          # Migration template
├── scripts/
│   └── seed_admin.py           # Admin user seed script
├── alembic.ini
├── requirements.txt
├── .env.example
├── Dockerfile                  # For Hugging Face Spaces
└── README.md
```

**Structure Decision**: Backend-only structure since Phase 1 is backend development. Frontend will be a separate Next.js project in `/frontend` when Phase 2 begins.

## Complexity Tracking

> No Constitution violations requiring justification.

| Decision | Rationale | Simpler Alternative Rejected |
|----------|-----------|------------------------------|
| JSONB for arrays | Simpler queries, no joins | Normalized tables: overkill for MVP scale |
| Soft delete | Preserves order history | Hard delete: loses historical data |
| Async SQLAlchemy | FastAPI is async-native | Sync: blocks event loop |

## Implementation Phases

### Phase 0: Research (Complete)

See [research.md](./research.md) for technology decisions:
- SQLAlchemy 2.0 async patterns
- Cloudinary SDK integration
- JWT authentication approach
- Order ID generation logic
- Phone number validation regex
- Database connection pooling

### Phase 1: Foundation (Blocking)

**Must complete before any feature work begins.**

1. **Project Setup**
   - Create `backend/` directory structure
   - Initialize `requirements.txt` with all dependencies
   - Create `.env.example` with all required variables
   - Create `config.py` with Pydantic settings

2. **Database Connection**
   - Create `database.py` with async engine
   - Configure connection pooling (max 5 connections)
   - Add health check endpoint

3. **SQLAlchemy Models**
   - Create base model with UUID and timestamps
   - Create Product model with JSONB fields
   - Create Order model with all status enums
   - Create AdminUser model

4. **Alembic Setup**
   - Initialize Alembic with async support
   - Create initial migration for all 3 tables
   - Create seed script for admin user

### Phase 2: Authentication (Blocking)

**Must complete before admin endpoints.**

1. **Auth Service**
   - Implement password hashing (bcrypt, 12 rounds)
   - Implement JWT token creation (24h expiry)
   - Implement JWT token verification

2. **Auth Middleware**
   - Create `get_current_admin` dependency
   - Handle token extraction from Authorization header
   - Return 401 for invalid/expired tokens

3. **Login Endpoint**
   - POST /api/admin/login
   - Validate credentials
   - Return JWT token

### Phase 3: Public Product Endpoints (US1)

1. **Product Schemas**
   - ProductResponse schema
   - ProductListResponse with pagination

2. **Product Routes**
   - GET /api/products (with filters: category, search, price range)
   - GET /api/products/{id}
   - GET /api/categories
   - GET /api/products/bestsellers

### Phase 4: Public Order Endpoints (US2, US3)

1. **Order Schemas**
   - OrderCreate with validation
   - OrderResponse schemas
   - OrderTrackingResponse schema

2. **Order ID Service**
   - Generate BQ-YYYYMMDD-XXX format
   - Handle daily counter reset

3. **Order Routes**
   - POST /api/orders (create with validation)
   - GET /api/orders/track (Order ID + phone verification)

### Phase 5: Admin Product Management (US5)

1. **Cloudinary Service**
   - Image upload function
   - Return Cloudinary URLs

2. **Admin Product Schemas**
   - ProductCreate schema
   - ProductUpdate schema

3. **Admin Product Routes**
   - POST /api/admin/products
   - PUT /api/admin/products/{id}
   - DELETE /api/admin/products/{id} (soft delete)
   - POST /api/admin/products/{id}/images

### Phase 6: Admin Order Management (US6)

1. **Admin Order Schemas**
   - OrderDetail schema
   - OrderStatusUpdate schema
   - OrderListResponse with pagination

2. **Admin Order Routes**
   - GET /api/admin/orders (pagination, filters)
   - GET /api/admin/orders/{id}
   - PATCH /api/admin/orders/{id}/status
   - GET /api/admin/orders/export (CSV)

### Phase 7: Admin Analytics (US7)

1. **Analytics Service**
   - Calculate total orders
   - Calculate pending payments
   - Calculate total revenue
   - Orders by status breakdown

2. **Analytics Routes**
   - GET /api/admin/analytics/dashboard

### Phase 8: Testing & Polish

1. **Error Handling**
   - Custom exception handlers
   - Consistent error response format
   - Environment-based detail level

2. **CORS Configuration**
   - Configure allowed origins from environment
   - Enable credentials for admin panel

3. **Documentation**
   - Verify Swagger/OpenAPI generation
   - Update README.md
   - Test all 16 endpoints with Postman

4. **Deployment Prep**
   - Create Dockerfile
   - Test on Hugging Face Spaces

## API Endpoints Summary

| # | Method | Endpoint | Auth | User Story |
|---|--------|----------|------|------------|
| 1 | GET | /api/products | No | US1 |
| 2 | GET | /api/products/{id} | No | US1 |
| 3 | GET | /api/categories | No | US1 |
| 4 | GET | /api/products/bestsellers | No | US1 |
| 5 | POST | /api/orders | No | US2 |
| 6 | GET | /api/orders/track | No | US3 |
| 7 | POST | /api/admin/login | No | US4 |
| 8 | POST | /api/admin/products | JWT | US5 |
| 9 | PUT | /api/admin/products/{id} | JWT | US5 |
| 10 | DELETE | /api/admin/products/{id} | JWT | US5 |
| 11 | POST | /api/admin/products/{id}/images | JWT | US5 |
| 12 | GET | /api/admin/orders | JWT | US6 |
| 13 | GET | /api/admin/orders/{id} | JWT | US6 |
| 14 | PATCH | /api/admin/orders/{id}/status | JWT | US6 |
| 15 | GET | /api/admin/orders/export | JWT | US6 |
| 16 | GET | /api/admin/analytics/dashboard | JWT | US7 |

## Key Files to Create

| File | Purpose | Depends On |
|------|---------|------------|
| `backend/config.py` | Environment settings | - |
| `backend/database.py` | Async SQLAlchemy | config.py |
| `backend/models/base.py` | Base model class | database.py |
| `backend/models/product.py` | Product model | base.py |
| `backend/models/order.py` | Order model | base.py |
| `backend/models/admin.py` | AdminUser model | base.py |
| `backend/services/auth.py` | JWT + bcrypt | config.py |
| `backend/middleware/auth.py` | Auth dependency | services/auth.py |
| `backend/services/cloudinary.py` | Image upload | config.py |
| `backend/services/order_id.py` | Order ID generation | database.py |
| `backend/schemas/product.py` | Product schemas | - |
| `backend/schemas/order.py` | Order schemas | - |
| `backend/schemas/admin.py` | Admin schemas | - |
| `backend/routes/products.py` | Product endpoints | schemas, models |
| `backend/routes/orders.py` | Order endpoints | schemas, models, services |
| `backend/routes/admin/auth.py` | Login endpoint | schemas, services |
| `backend/routes/admin/products.py` | Admin product CRUD | schemas, models, middleware |
| `backend/routes/admin/orders.py` | Admin order management | schemas, models, middleware |
| `backend/routes/admin/analytics.py` | Dashboard | models, middleware |
| `backend/main.py` | FastAPI app | routes, middleware |

## Architectural Decisions

Documented decisions requiring ADR consideration:

1. **Async SQLAlchemy over Sync** - Better performance with Neon serverless
2. **Cloudinary for Images** - CDN + optimization + free tier
3. **Order ID Format (BQ-YYYYMMDD-XXX)** - Customer-friendly tracking
4. **Soft Delete for Products** - Preserves order history
5. **JWT in Authorization Header** - Standard REST API approach
6. **JSONB for Arrays** - Simpler queries, appropriate for MVP scale

📋 **ADR Suggestion**: Document "Image Storage Strategy" comparing Cloudinary vs S3 vs local files. Run `/sp.adr image-storage-strategy` to create.

## Validation Checklist

Before marking backend complete:

- [ ] All 16 endpoints respond correctly
- [ ] Product filters work (category, search, price range)
- [ ] Order ID generates unique values (BQ-YYYYMMDD-XXX)
- [ ] Order tracking verifies phone number
- [ ] Admin login returns valid JWT
- [ ] JWT protects all admin endpoints
- [ ] Images upload to Cloudinary successfully
- [ ] Validation errors return 422 with details
- [ ] CORS allows frontend origin
- [ ] Swagger docs auto-generated at /docs
- [ ] Health check returns 200
- [ ] No secrets in code (all in environment)
- [ ] Database migrations applied
- [ ] Admin user seeded

## Next Steps

1. Run `/sp.tasks` to generate implementation tasks
2. Implement Phase 1 (Foundation) first
3. Test each phase before moving to next
4. Use Postman collection for endpoint testing
5. Deploy to Hugging Face Spaces when complete
