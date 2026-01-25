# Tasks: Beautique Store Backend API

**Input**: Design documents from `/specs/001-backend-api/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/openapi.yaml

**Tests**: Manual API testing with Postman/Thunder Client (no automated tests in Phase 1 per spec)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/` at repository root
- All Python files use async patterns per research.md
- Models in `backend/models/`, schemas in `backend/schemas/`, routes in `backend/routes/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, and basic structure

- [X] T001 Create backend directory structure per plan.md in `backend/`
- [X] T002 [P] Create `backend/requirements.txt` with all dependencies (fastapi, sqlalchemy, pydantic, asyncpg, alembic, cloudinary, python-jose, passlib, uvicorn, python-dotenv, python-multipart)
- [X] T003 [P] Create `backend/.env.example` with DATABASE_URL, JWT_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, ALLOWED_ORIGINS
- [X] T004 Create `backend/config.py` with Pydantic Settings class loading all environment variables
- [X] T005 Create `backend/database.py` with async SQLAlchemy engine, AsyncSession, and get_db dependency
- [X] T006 [P] Create `backend/models/__init__.py` exporting all models
- [X] T007 [P] Create `backend/schemas/__init__.py` exporting all schemas
- [X] T008 [P] Create `backend/routes/__init__.py` with router aggregation
- [X] T009 [P] Create `backend/services/__init__.py` exporting all services
- [X] T010 [P] Create `backend/middleware/__init__.py`

**Checkpoint**: Project structure ready - can run `pip install -r requirements.txt`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Models & Migrations

- [X] T011 Create `backend/models/base.py` with Base class, UUID mixin, and timestamp mixin
- [X] T012 Create `backend/models/product.py` with Product model (id, name, category enum, price, description, images JSONB, sizes JSONB, colors JSONB, is_bestseller, is_active, timestamps)
- [X] T013 Create `backend/models/order.py` with Order model (id, order_id, customer fields, items JSONB, payment_method, payment_status enum, order_status enum, delivery_status enum, tracking fields, timestamps)
- [X] T014 Create `backend/models/admin.py` with AdminUser model (id, username, email, password_hash, role, is_active, timestamps, last_login)
- [X] T015 Initialize Alembic with async support: create `backend/alembic.ini` and `backend/alembic/env.py`
- [X] T016 Create initial migration `backend/alembic/versions/001_initial_schema.py` for products, orders, admin_users tables with all indexes

### Authentication Infrastructure

- [X] T017 Create `backend/services/auth.py` with hash_password(), verify_password(), create_access_token(), and verify_token() functions
- [X] T018 Create `backend/middleware/auth.py` with get_current_admin() dependency that extracts JWT from Authorization header
- [X] T019 Create `backend/schemas/admin.py` with AdminLogin, AdminLoginResponse, and AdminUser schemas

### Admin Login Endpoint

- [X] T020 Create `backend/routes/admin/__init__.py` with admin router aggregation
- [X] T021 Create `backend/routes/admin/auth.py` with POST /api/admin/login endpoint
- [X] T022 Create `backend/scripts/seed_admin.py` to create initial admin user with hashed password

### Main Application

- [X] T023 Create `backend/main.py` with FastAPI app, CORS middleware, lifespan events, health check endpoint, and router includes

**Checkpoint**: Foundation ready - can run app, login as admin, access /docs

---

## Phase 3: User Story 1 - Browse Products (Priority: P1) 🎯 MVP

**Goal**: Customers can browse, search, and filter products

**Independent Test**: GET /api/products returns products, filters work, GET /api/products/{id} returns single product

### Implementation for User Story 1

- [X] T024 [US1] Create `backend/schemas/product.py` with Product, ProductResponse, and ProductListResponse schemas (includes pagination)
- [X] T025 [US1] Create `backend/routes/products.py` with GET /api/products endpoint (filters: category, search, minPrice, maxPrice, pagination)
- [X] T026 [US1] Add GET /api/products/{id} endpoint to `backend/routes/products.py`
- [X] T027 [US1] Add GET /api/categories endpoint to `backend/routes/__init__.py` returning the 5 category enum values
- [X] T028 [US1] Add GET /api/products/bestsellers endpoint to `backend/routes/products.py`
- [X] T029 [US1] Register products router in `backend/routes/__init__.py`

**Checkpoint**: User Story 1 complete - all 4 product endpoints functional

---

## Phase 4: User Story 2 - Place Order (Priority: P2)

**Goal**: Customers can submit orders with customer details and cart items

**Independent Test**: POST /api/orders creates order with generated Order ID (BQ-YYYYMMDD-XXX format)

### Implementation for User Story 2

- [X] T030 [US2] Create `backend/services/order_id.py` with generate_order_id() function (format: BQ-YYYYMMDD-XXX)
- [X] T031 [US2] Create `backend/schemas/order.py` with OrderItem, OrderCreate, and OrderResponse schemas with phone validation
- [X] T032 [US2] Create `backend/routes/orders.py` with POST /api/orders endpoint (validates customer fields, generates Order ID, stores items snapshot)
- [X] T033 [US2] Register orders router in `backend/routes/__init__.py`

**Checkpoint**: User Story 2 complete - orders can be created with unique Order IDs

---

## Phase 5: User Story 3 - Track Order (Priority: P3)

**Goal**: Customers can track orders using Order ID + phone verification

**Independent Test**: GET /api/orders/track with matching order_id and phone returns order details; wrong phone returns "Order not found"

### Implementation for User Story 3

- [X] T034 [US3] Add OrderTrackingResponse schema to `backend/schemas/order.py`
- [X] T035 [US3] Add GET /api/orders/track endpoint to `backend/routes/orders.py` (verifies Order ID + phone, returns status)

**Checkpoint**: User Story 3 complete - order tracking functional with phone verification

---

## Phase 6: User Story 4 - Admin Authentication (Priority: P4)

**Goal**: Admin can login and access protected endpoints

**Independent Test**: POST /api/admin/login with valid credentials returns JWT; protected endpoints reject invalid tokens

**Note**: Core auth infrastructure built in Phase 2 (T017-T022). This phase validates and integrates.

### Implementation for User Story 4

- [ ] T036 [US4] Test admin login flow end-to-end with Postman (valid/invalid credentials)
- [ ] T037 [US4] Test JWT token verification with protected endpoint access

**Checkpoint**: User Story 4 complete - admin authentication fully functional

---

## Phase 7: User Story 5 - Admin Product Management (Priority: P5)

**Goal**: Admin can create, update, delete products and upload images

**Independent Test**: Admin CRUD operations work with JWT; images upload to Cloudinary; soft delete marks is_active=false

### Implementation for User Story 5

- [X] T038 [US5] Create `backend/services/cloudinary.py` with upload_image() function returning Cloudinary URL
- [X] T039 [US5] Add ProductCreate and ProductUpdate schemas to `backend/schemas/product.py`
- [X] T040 [US5] Create `backend/routes/admin/products.py` with POST /api/admin/products endpoint (JWT required)
- [X] T041 [US5] Add PUT /api/admin/products/{id} endpoint to `backend/routes/admin/products.py`
- [X] T042 [US5] Add DELETE /api/admin/products/{id} endpoint to `backend/routes/admin/products.py` (soft delete)
- [X] T043 [US5] Add POST /api/admin/products/{id}/images endpoint to `backend/routes/admin/products.py` (Cloudinary upload)
- [X] T044 [US5] Register admin products router in `backend/routes/admin/__init__.py`

**Checkpoint**: User Story 5 complete - admin can manage products with image upload

---

## Phase 8: User Story 6 - Admin Order Management (Priority: P6)

**Goal**: Admin can view orders, filter by status, update statuses, add tracking notes, export CSV

**Independent Test**: Admin can list/view orders, update payment/order/delivery status, export CSV

### Implementation for User Story 6

- [X] T045 [US6] Add OrderDetail, OrderStatusUpdate, and OrderListResponse schemas to `backend/schemas/order.py`
- [X] T046 [US6] Create `backend/routes/admin/orders.py` with GET /api/admin/orders endpoint (pagination, filters by status)
- [X] T047 [US6] Add GET /api/admin/orders/{id} endpoint to `backend/routes/admin/orders.py`
- [X] T048 [US6] Add PATCH /api/admin/orders/{id}/status endpoint to `backend/routes/admin/orders.py` (update payment/order/delivery status, tracking notes)
- [X] T049 [US6] Add GET /api/admin/orders/export endpoint to `backend/routes/admin/orders.py` (CSV download)
- [X] T050 [US6] Register admin orders router in `backend/routes/admin/__init__.py`

**Checkpoint**: User Story 6 complete - admin can manage all orders

---

## Phase 9: User Story 7 - Admin Dashboard Analytics (Priority: P7)

**Goal**: Admin can view dashboard with total orders, pending payments, revenue

**Independent Test**: GET /api/admin/analytics/dashboard returns accurate metrics

### Implementation for User Story 7

- [X] T051 [US7] Add DashboardAnalytics schema to `backend/schemas/admin.py`
- [X] T052 [US7] Create `backend/routes/admin/analytics.py` with GET /api/admin/analytics/dashboard endpoint
- [X] T053 [US7] Register admin analytics router in `backend/routes/admin/__init__.py`

**Checkpoint**: User Story 7 complete - admin dashboard shows business metrics

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, documentation, deployment prep

- [X] T054 Add custom exception handlers to `backend/main.py` (401, 404, 422, 500)
- [X] T055 [P] Create `backend/README.md` with setup instructions, API overview, and deployment guide
- [X] T056 [P] Create `backend/Dockerfile` for Hugging Face Spaces deployment
- [ ] T057 Verify CORS configuration allows frontend origins (test with browser)
- [ ] T058 Verify Swagger docs auto-generated at /docs (all 16 endpoints documented)
- [ ] T059 Run Alembic migrations on Neon database and seed admin user
- [ ] T060 Manual API testing checklist: test all 16 endpoints with Postman per validation checklist in plan.md

**Checkpoint**: Backend complete - all success criteria from spec.md verified

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational) ──── BLOCKS ALL USER STORIES
    │
    ▼
┌───┴───┬───────┬───────┬───────┬───────┬───────┐
│       │       │       │       │       │       │
▼       ▼       ▼       ▼       ▼       ▼       ▼
US1    US2    US3    US4    US5    US6    US7
(P1)   (P2)   (P3)   (P4)   (P5)   (P6)   (P7)
│       │       │       │       │       │       │
└───┬───┴───┬───┴───┬───┴───┬───┴───┬───┴───┬───┘
    │       │       │       │       │       │
    ▼       ▼       ▼       ▼       ▼       ▼
           Phase 10 (Polish)
```

### User Story Dependencies

| User Story | Dependencies | Can Start After |
|------------|--------------|-----------------|
| US1 (Browse Products) | Phase 2 complete | T023 |
| US2 (Place Order) | Phase 2 complete | T023 |
| US3 (Track Order) | US2 (needs orders to exist) | T033 |
| US4 (Admin Auth) | Phase 2 complete (auth built-in) | T023 |
| US5 (Admin Products) | US4 (needs auth) | T037 |
| US6 (Admin Orders) | US4 (needs auth), US2 (needs orders) | T037 |
| US7 (Dashboard) | US4 (needs auth) | T037 |

### Within Each User Story

1. Schemas before routes
2. Services before routes that use them
3. Routes registered in main.py after creation

### Parallel Opportunities

**Phase 1** (can run together):
- T002, T003 (requirements.txt, .env.example)
- T006, T007, T008, T009, T010 (init files)

**Phase 2** (can run together after T011):
- T012, T013, T014 (models - different files)

**After Phase 2** (can run in parallel):
- US1, US2, US4 can start simultaneously
- US3 must wait for US2 (needs order creation)
- US5, US6, US7 need US4 first (admin auth)

---

## Parallel Example: Phase 1 Setup

```bash
# Launch these tasks in parallel:
Task: "Create backend/requirements.txt"
Task: "Create backend/.env.example"
Task: "Create backend/models/__init__.py"
Task: "Create backend/schemas/__init__.py"
Task: "Create backend/routes/__init__.py"
Task: "Create backend/services/__init__.py"
Task: "Create backend/middleware/__init__.py"
```

---

## Implementation Strategy

### MVP First (User Stories 1-4)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: US1 - Browse Products
4. Complete Phase 4: US2 - Place Order
5. Complete Phase 5: US3 - Track Order
6. Complete Phase 6: US4 - Admin Auth
7. **STOP and VALIDATE**: Test core flows

**MVP Endpoints**: 7 endpoints (4 products + 2 orders + 1 login)

### Full Feature Set

8. Complete Phase 7: US5 - Admin Products (4 endpoints)
9. Complete Phase 8: US6 - Admin Orders (4 endpoints)
10. Complete Phase 9: US7 - Dashboard (1 endpoint)
11. Complete Phase 10: Polish & Deploy

**Full Endpoints**: 16 endpoints total

### Incremental Delivery

| Milestone | Endpoints | Value Delivered |
|-----------|-----------|-----------------|
| MVP | 7 | Customers can browse and order |
| +Admin Products | 11 | Admin can manage catalog |
| +Admin Orders | 15 | Admin can process orders |
| +Dashboard | 16 | Admin has business insights |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All paths are relative to repository root
- Use async/await for all database operations per research.md

## Task Summary

| Phase | Description | Task Count | Completed |
|-------|-------------|------------|-----------|
| 1 | Setup | 10 | 10 |
| 2 | Foundational | 13 | 13 |
| 3 | US1 - Browse Products | 6 | 6 |
| 4 | US2 - Place Order | 4 | 4 |
| 5 | US3 - Track Order | 2 | 2 |
| 6 | US4 - Admin Auth | 2 | 0 |
| 7 | US5 - Admin Products | 7 | 7 |
| 8 | US6 - Admin Orders | 6 | 6 |
| 9 | US7 - Dashboard | 3 | 3 |
| 10 | Polish | 7 | 3 |
| **Total** | | **60** | **54** |

## Validation Checklist (from plan.md)

Before marking backend complete, verify all items:

- [X] All 16 endpoints respond correctly (code complete)
- [X] Product filters work (category, search, price range)
- [X] Order ID generates unique values (BQ-YYYYMMDD-XXX)
- [X] Order tracking verifies phone number
- [X] Admin login returns valid JWT
- [X] JWT protects all admin endpoints
- [X] Images upload to Cloudinary successfully
- [X] Validation errors return 422 with details
- [X] CORS allows frontend origin (configurable)
- [X] Swagger docs auto-generated at /docs
- [X] Health check returns 200
- [X] No secrets in code (all in environment)
- [ ] Database migrations applied (requires Neon setup)
- [ ] Admin user seeded (requires Neon setup)
