<!--
  SYNC IMPACT REPORT
  ==================
  Version change: N/A → 1.0.0 (initial ratification)

  Modified principles: N/A (new document)

  Added sections:
  - Core Principles (7 principles)
  - Technology Stack
  - Architecture & Data Models
  - API Contracts
  - Development Workflow
  - Governance

  Removed sections: N/A

  Templates status:
  - .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section present)
  - .specify/templates/spec-template.md: ✅ Compatible (priority-based user stories align)
  - .specify/templates/tasks-template.md: ✅ Compatible (phased approach aligns)

  Follow-up TODOs: None
-->

# Beautique Store E-Commerce Platform Constitution

## Core Principles

### I. Backend-First Development

All features MUST be built and tested on the backend before frontend implementation begins.

- API endpoints MUST be fully functional and tested via Postman/Thunder Client before frontend work starts
- Backend validation MUST be complete; frontend validation is supplementary
- Database schema and migrations MUST be finalized before frontend consumes the API
- This ensures data integrity and reduces integration failures

**Rationale**: Backend-first development catches data model issues early and ensures the API contract is stable before frontend investment.

### II. Manual Payment Workflow

Phase 1 operates WITHOUT payment gateway integration. All payments are verified manually via WhatsApp.

- NO Stripe, PayPal, or other payment processors in Phase 1
- Customers send payment screenshots to WhatsApp after checkout
- Admin manually verifies payments and updates order status
- Payment methods: Easypaisa, Meezan Bank Transfer (Pakistan), International Bank Transfer (overseas)
- NO Cash on Delivery (COD) in Phase 1

**Rationale**: Manual verification reduces complexity, third-party dependencies, and allows business validation before payment gateway investment.

### III. No Customer Authentication

Phase 1 does NOT require customer accounts or login.

- Cart and wishlist data MUST persist in localStorage only
- Orders are tracked via Order ID + Phone number combination
- No user registration, login, or password reset flows
- Admin authentication uses JWT; customers have no authentication

**Rationale**: Removing customer auth simplifies MVP, reduces security surface, and allows faster launch. Customer accounts can be added in Phase 2.

### IV. International-Ready Design

The platform MUST support both Pakistani and overseas customers from Day 1.

- Phone validation MUST accept international formats (10-15 digits with optional country code)
- Address fields MUST NOT assume Pakistan-specific formats
- Currency display: PKR (Pakistani Rupee) as base, no multi-currency conversion in Phase 1
- Payment instructions MUST include international bank transfer option

**Rationale**: The business serves diaspora customers; international support is not optional.

### V. Professional UI Standards

All interfaces MUST meet professional e-commerce quality standards.

- Mobile-responsive design: all pages MUST work on mobile, tablet, and desktop
- Fast-loading: images MUST use Next.js Image optimization + Cloudinary transformations
- Clean aesthetics: shadcn/ui + Tailwind CSS for consistent design system
- No placeholder content in production: all images and copy MUST be real
- Accessibility: basic WCAG compliance (alt text, keyboard navigation, color contrast)

**Rationale**: Professional UI builds customer trust and reduces cart abandonment.

### VI. MCP Context 7 Compliance

All code MUST use latest 2025 syntax, patterns, and best practices.

- Python: Use Python 3.11+ features, SQLAlchemy 2.0 async patterns, Pydantic v2 validation
- Next.js: Use App Router (not Pages Router), Server Components where appropriate
- TypeScript: Strict mode enabled, no `any` types without justification
- Dependencies: Use current stable versions, verify compatibility before adding

**Rationale**: Modern patterns ensure maintainability, performance, and access to latest features.

### VII. Minimal Viable Scope

Phase 1 delivers core e-commerce functionality only. Resist feature creep.

- In scope: Browse, cart, wishlist, checkout, order tracking, admin CRUD
- Out of scope: Reviews, ratings, promotions, discounts, inventory management, analytics beyond basics
- NO refactoring unrelated code during feature work
- NO adding "nice to have" features without explicit approval

**Rationale**: Ship fast, validate assumptions, iterate based on real usage.

## Technology Stack

### Backend

| Component | Technology | Version/Notes |
|-----------|------------|---------------|
| Language | Python | 3.11+ |
| Framework | FastAPI | Latest stable |
| ORM | SQLAlchemy | 2.0 (async) |
| Migrations | Alembic | Latest stable |
| Validation | Pydantic | v2 |
| Database | PostgreSQL | Neon (serverless) |
| Image Storage | Cloudinary | SDK |
| Auth | JWT | Admin only |

### Frontend

| Component | Technology | Version/Notes |
|-----------|------------|---------------|
| Framework | Next.js | 16 (App Router) |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS | Latest stable |
| Components | shadcn/ui | Primary |
| Components | Material UI | As needed |
| Validation | Zod | Form validation |
| State | localStorage | Cart/wishlist |

### Deployment

| Component | Platform |
|-----------|----------|
| Backend | Hugging Face Spaces |
| Frontend | Vercel |
| Database | Neon PostgreSQL |

## Architecture & Data Models

### System Architecture

```
┌─────────────┐     HTTP/JSON     ┌─────────────┐
│   Next.js   │ ◄──────────────► │   FastAPI   │
│  (Vercel)   │                   │ (HF Spaces) │
└─────────────┘                   └──────┬──────┘
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │    Neon     │
                                  │ PostgreSQL  │
                                  └─────────────┘
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │ Cloudinary  │
                                  │  (Images)   │
                                  └─────────────┘
```

### Data Models

#### Products

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | 3-255 chars, required |
| category | Enum | Maxi, Lehanga Choli, Long Shirt, Shalwar Kameez, Gharara |
| price | Decimal | 0-1,000,000, required |
| description | Text | 10-2000 chars, required |
| images | JSONB | Array of Cloudinary URLs, 1-10 items |
| sizes | JSONB | Array: S, M, L, XL, XXL, min 1 |
| colors | JSONB | Array, min 1 |
| is_bestseller | Boolean | Default false |
| is_active | Boolean | Default true |
| created_at | DateTime | Auto-generated |
| updated_at | DateTime | Auto-updated |

#### Orders

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| order_id | String | Format: BQ-YYYYMMDD-XXX |
| customer_name | String | 3+ chars, required |
| phone | String | 10-15 digits, required |
| whatsapp | String | 10-15 digits, required |
| email | String | Optional, valid format |
| address | String | 10+ chars, required |
| city | String | 2+ chars, required |
| country | String | Optional |
| notes | Text | Optional, max 500 chars |
| items | JSONB | Array of {product_id, name, size, color, quantity, price} |
| total_amount | Decimal | Calculated |
| payment_method | String | Easypaisa, Meezan Bank, International Transfer |
| payment_status | Enum | Pending, Paid, Verified |
| order_status | Enum | Received, Processing, Ready, Delivered, Cancelled |
| delivery_status | Enum | Not Started, In Progress, Out for Delivery, Delivered |
| estimated_delivery | Date | Optional |
| tracking_notes | Text | Optional |
| order_date | DateTime | Auto-generated |
| created_at | DateTime | Auto-generated |
| updated_at | DateTime | Auto-updated |

#### Admin Users

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| username | String | Unique, required |
| email | String | Unique, required |
| password_hash | String | Hashed, required |
| role | String | Default: admin |
| is_active | Boolean | Default true |
| created_at | DateTime | Auto-generated |
| last_login | DateTime | Nullable |

## API Contracts

### Public Endpoints (No Auth)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/products | List products (filters: category, search, minPrice, maxPrice) |
| GET | /api/products/{id} | Get single product |
| GET | /api/categories | List all categories |
| POST | /api/orders | Create new order |
| GET | /api/orders/track | Track order (params: order_id, phone) |

### Admin Endpoints (JWT Required)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/admin/login | Admin authentication |
| POST | /api/admin/products | Create product |
| PUT | /api/admin/products/{id} | Update product |
| DELETE | /api/admin/products/{id} | Delete product |
| POST | /api/admin/products/{id}/images | Upload product images |
| GET | /api/admin/orders | List orders (filters, pagination) |
| GET | /api/admin/orders/{id} | Get single order |
| PATCH | /api/admin/orders/{id}/status | Update order status |
| GET | /api/admin/orders/export | Export orders to CSV |
| GET | /api/admin/analytics/dashboard | Dashboard analytics |

### Validation Rules

#### Phone Numbers

```regex
/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
```

#### Checkout Form

- name: min 3 chars, required
- phone: 10-15 digits, international format, required
- whatsapp: 10-15 digits, international format, required
- email: optional, valid email format
- address: min 10 chars, required
- city: min 2 chars, required
- country: optional
- notes: optional, max 500 chars

## Development Workflow

### Phase Sequence

1. **Constitution** (this document) - Define principles and constraints
2. **Backend Development**: `/sp.specify` → `/sp.plan` → `/sp.tasks` → `/sp.implement`
3. **Backend Testing**: Postman/Thunder Client validation
4. **Frontend Development**: `/sp.specify` → `/sp.plan` → `/sp.tasks` → `/sp.implement`
5. **Frontend Testing**: Manual browser testing
6. **Deployment**: Backend to Hugging Face, Frontend to Vercel

### Page Routes

#### Customer Pages

| Route | Purpose |
|-------|---------|
| / | Home page |
| /products | All products |
| /products/[category] | Products by category |
| /products/[id] | Product detail |
| /cart | Shopping cart |
| /checkout | Checkout form |
| /order-confirmation/[orderId] | Order confirmation |
| /track-order | Order tracking |
| /wishlist | Wishlist |
| /about | About page |
| /faq | FAQ |
| /contact | Contact |
| /privacy-policy | Privacy policy |
| /terms-of-service | Terms |

#### Admin Pages

| Route | Purpose |
|-------|---------|
| /admin/login | Admin login |
| /admin/dashboard | Dashboard |
| /admin/products | Product list |
| /admin/products/new | Create product |
| /admin/products/[id]/edit | Edit product |
| /admin/orders | Order list |
| /admin/orders/[id] | Order detail |
| /admin/settings | Settings |

## Governance

### Constitution Authority

This constitution supersedes all other documentation when conflicts arise. All PRs and code reviews MUST verify compliance with these principles.

### Amendment Process

1. Propose amendment with rationale
2. Document impact on existing features
3. Update version according to semantic versioning:
   - **MAJOR**: Backward-incompatible principle changes
   - **MINOR**: New principles or expanded guidance
   - **PATCH**: Clarifications, typo fixes
4. Update dependent artifacts (specs, plans, tasks)

### Compliance Review

- All features MUST reference relevant constitution principles
- Code reviews MUST check for principle violations
- Deviations require explicit justification and approval

### Success Criteria

Phase 1 is complete when:

- [ ] Products browsable by category with search/filters
- [ ] Cart and wishlist functional (localStorage)
- [ ] Checkout validates inputs (frontend + backend)
- [ ] Orders saved with generated Order ID
- [ ] Order confirmation displays full details
- [ ] Order tracking works (Order ID + Phone)
- [ ] Admin login with JWT
- [ ] Admin CRUD for products with image upload
- [ ] Admin can view/update orders
- [ ] Admin can export orders to CSV
- [ ] Admin dashboard shows basic analytics
- [ ] All pages responsive (mobile/tablet/desktop)
- [ ] Backend deployed on Hugging Face
- [ ] Frontend deployed on Vercel
- [ ] Professional, clean UI throughout

**Version**: 1.0.0 | **Ratified**: 2026-01-18 | **Last Amended**: 2026-01-18
