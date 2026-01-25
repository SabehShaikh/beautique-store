# Data Model: Beautique Store Backend API

**Feature Branch**: `001-backend-api`
**Date**: 2026-01-18
**Source**: Feature specification and constitution data models

## Entity Relationship Diagram

```
┌─────────────────┐
│   AdminUser     │
├─────────────────┤
│ id (PK)         │
│ username        │
│ email           │
│ password_hash   │
│ role            │
│ is_active       │
│ created_at      │
│ last_login      │
└─────────────────┘

┌─────────────────┐          ┌─────────────────┐
│    Product      │          │     Order       │
├─────────────────┤          ├─────────────────┤
│ id (PK)         │          │ id (PK)         │
│ name            │          │ order_id        │◄─── BQ-YYYYMMDD-XXX
│ category        │          │ customer_name   │
│ price           │    ┌────►│ phone           │
│ description     │    │     │ whatsapp        │
│ images (JSONB)  │    │     │ email           │
│ sizes (JSONB)   │    │     │ address         │
│ colors (JSONB)  │    │     │ city            │
│ is_bestseller   │    │     │ country         │
│ is_active       │    │     │ notes           │
│ created_at      │    │     │ items (JSONB)   │───── Snapshot of products
│ updated_at      │    │     │ total_amount    │
└─────────────────┘    │     │ payment_method  │
                       │     │ payment_status  │
                       │     │ order_status    │
                       │     │ delivery_status │
                       │     │ estimated_delvry│
                       │     │ tracking_notes  │
                       │     │ order_date      │
                       │     │ created_at      │
                       │     │ updated_at      │
                       │     └─────────────────┘
                       │
                       └── Note: No FK relationship.
                           Order.items stores product
                           snapshot at time of purchase.
```

## Entities

### 1. Product

**Purpose**: Represents a sellable item in the store catalog.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | Primary identifier |
| name | VARCHAR(255) | NOT NULL, 3-255 chars | Product display name |
| category | ENUM | NOT NULL | One of 5 categories |
| price | DECIMAL(10,2) | NOT NULL, 0-1000000 | Price in PKR |
| description | TEXT | NOT NULL, 10-2000 chars | Product description |
| images | JSONB | NOT NULL, 1-10 items | Array of Cloudinary URLs |
| sizes | JSONB | NOT NULL, min 1 item | Array: S, M, L, XL, XXL |
| colors | JSONB | NOT NULL, min 1 item | Array of color names |
| is_bestseller | BOOLEAN | DEFAULT FALSE | Featured in bestsellers |
| is_active | BOOLEAN | DEFAULT TRUE | Soft delete flag |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last update timestamp |

**Category Enum Values**:
- `Maxi`
- `Lehanga Choli`
- `Long Shirt`
- `Shalwar Kameez`
- `Gharara`

**JSONB Structures**:

```json
// images
["https://res.cloudinary.com/.../image1.jpg", "https://res.cloudinary.com/.../image2.jpg"]

// sizes
["S", "M", "L", "XL"]

// colors
["Red", "Blue", "Green"]
```

**Indexes**:
- `idx_product_category` on `category` (filter queries)
- `idx_product_is_active` on `is_active` (public queries)
- `idx_product_is_bestseller` on `is_bestseller` (bestseller queries)
- `idx_product_price` on `price` (range queries)
- `idx_product_created_at` on `created_at` (sorting)

---

### 2. Order

**Purpose**: Represents a customer purchase with contact details and cart items.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | Internal identifier |
| order_id | VARCHAR(50) | UNIQUE, NOT NULL | Customer-facing ID (BQ-YYYYMMDD-XXX) |
| customer_name | VARCHAR(255) | NOT NULL, min 3 chars | Customer full name |
| phone | VARCHAR(20) | NOT NULL, 10-15 digits | Contact phone |
| whatsapp | VARCHAR(20) | NOT NULL, 10-15 digits | WhatsApp for payment verification |
| email | VARCHAR(255) | NULL, valid email | Optional email |
| address | TEXT | NOT NULL, min 10 chars | Delivery address |
| city | VARCHAR(100) | NOT NULL, min 2 chars | Delivery city |
| country | VARCHAR(100) | NULL | Optional (defaults to Pakistan) |
| notes | TEXT | NULL, max 500 chars | Order notes |
| items | JSONB | NOT NULL, min 1 item | Cart items snapshot |
| total_amount | DECIMAL(10,2) | NOT NULL | Order total in PKR |
| payment_method | VARCHAR(50) | NOT NULL | Payment method selected |
| payment_status | ENUM | DEFAULT 'Pending' | Payment verification state |
| order_status | ENUM | DEFAULT 'Received' | Order processing state |
| delivery_status | ENUM | DEFAULT 'Not Started' | Delivery progress state |
| estimated_delivery | DATE | NULL | Optional delivery estimate |
| tracking_notes | TEXT | NULL | Admin notes for customer |
| order_date | DATE | DEFAULT CURRENT_DATE | Order placement date |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last update timestamp |

**Payment Method Values**:
- `Easypaisa`
- `Meezan Bank`
- `International Bank`

**Payment Status Enum**:
- `Pending` (awaiting payment screenshot)
- `Paid` (screenshot received)
- `Verified` (admin confirmed)

**Order Status Enum**:
- `Received` (order placed)
- `Processing` (being prepared)
- `Ready` (ready for dispatch)
- `Delivered` (delivered to customer)
- `Cancelled` (order cancelled)

**Delivery Status Enum**:
- `Not Started`
- `In Progress`
- `Out for Delivery`
- `Delivered`

**Items JSONB Structure**:

```json
[
  {
    "product_id": "uuid-here",
    "name": "Silk Maxi Dress",
    "size": "M",
    "color": "Red",
    "quantity": 2,
    "price": 5500.00
  },
  {
    "product_id": "uuid-here",
    "name": "Cotton Shalwar Kameez",
    "size": "L",
    "color": "Blue",
    "quantity": 1,
    "price": 3200.00
  }
]
```

**Indexes**:
- `idx_order_order_id` on `order_id` (lookup by customer-facing ID)
- `idx_order_phone` on `phone` (order tracking verification)
- `idx_order_payment_status` on `payment_status` (admin filtering)
- `idx_order_order_status` on `order_status` (admin filtering)
- `idx_order_created_at` on `created_at` (sorting, date filtering)

---

### 3. AdminUser

**Purpose**: Represents an administrator who can manage products and orders.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | Internal identifier |
| username | VARCHAR(100) | UNIQUE, NOT NULL | Login username |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Admin email |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | VARCHAR(50) | DEFAULT 'admin' | Role (future: super_admin) |
| is_active | BOOLEAN | DEFAULT TRUE | Account active flag |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| last_login | TIMESTAMP | NULL | Last successful login |

**Indexes**:
- `idx_admin_username` on `username` (login lookup)
- `idx_admin_email` on `email` (unique constraint)

---

## State Transitions

### Order Payment Status

```
┌─────────┐   screenshot   ┌──────┐   admin    ┌──────────┐
│ Pending │ ─────────────► │ Paid │ ────────► │ Verified │
└─────────┘    received    └──────┘  verified  └──────────┘
```

### Order Status

```
┌──────────┐   prepare   ┌────────────┐   ready   ┌───────┐   deliver   ┌───────────┐
│ Received │ ──────────► │ Processing │ ────────► │ Ready │ ──────────► │ Delivered │
└──────────┘             └────────────┘           └───────┘             └───────────┘
      │
      └──────────────────────────────────────────────────────────────────────┐
                                   cancel at any point                        │
                                                                              ▼
                                                                      ┌───────────┐
                                                                      │ Cancelled │
                                                                      └───────────┘
```

### Delivery Status

```
┌─────────────┐   start   ┌─────────────┐   dispatch   ┌──────────────────┐   arrive   ┌───────────┐
│ Not Started │ ────────► │ In Progress │ ───────────► │ Out for Delivery │ ─────────► │ Delivered │
└─────────────┘           └─────────────┘              └──────────────────┘            └───────────┘
```

---

## Validation Rules

### Product

| Field | Rule | Error Message |
|-------|------|---------------|
| name | 3-255 characters | "Name must be 3-255 characters" |
| category | One of 5 values | "Invalid category" |
| price | 0 - 1,000,000 | "Price must be between 0 and 1,000,000" |
| description | 10-2000 characters | "Description must be 10-2000 characters" |
| images | 1-10 valid URLs | "Must have 1-10 images" |
| sizes | At least 1 | "Must have at least 1 size" |
| colors | At least 1 | "Must have at least 1 color" |

### Order

| Field | Rule | Error Message |
|-------|------|---------------|
| customer_name | Min 3 characters | "Name must be at least 3 characters" |
| phone | 10-15 digits, international | "Phone must be 10-15 digits" |
| whatsapp | 10-15 digits, international | "WhatsApp must be 10-15 digits" |
| email | Valid email or empty | "Invalid email format" |
| address | Min 10 characters | "Address must be at least 10 characters" |
| city | Min 2 characters | "City must be at least 2 characters" |
| notes | Max 500 characters | "Notes cannot exceed 500 characters" |
| items | At least 1 item | "Order must have at least 1 item" |
| payment_method | One of 3 values | "Invalid payment method" |

### Phone Number Regex

```regex
^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$
```

**Examples of valid formats**:
- `03001234567` (Pakistani mobile)
- `+923001234567` (Pakistani with country code)
- `+1-555-123-4567` (US format)
- `+44 7911 123456` (UK format)

---

## Database Migration Strategy

### Initial Migration (001_initial_schema.py)

1. Create `products` table
2. Create `orders` table
3. Create `admin_users` table
4. Create all indexes

### Seed Data Script (seed_admin.py)

1. Create default admin user:
   - Username: `admin`
   - Email: `admin@beautique.com`
   - Password: (hashed, set via environment variable)
   - Role: `admin`

---

## Notes

### No Foreign Keys Between Orders and Products

Orders store product snapshots in the `items` JSONB field. This is intentional:

1. **Historical accuracy**: Order shows product details at time of purchase
2. **Product deletion safe**: Soft-deleted products don't break orders
3. **Price changes safe**: Order reflects price paid, not current price
4. **Simplicity**: No cascade or orphan handling needed

### JSONB vs Normalized Tables

Using JSONB for arrays (images, sizes, colors, items) instead of junction tables:

1. **Simpler queries**: No joins needed for product display
2. **Atomic updates**: Update entire array in one operation
3. **PostgreSQL native**: Full indexing and query support
4. **Appropriate scale**: Product doesn't have thousands of images

For larger scale, normalized tables would be better. For MVP, JSONB is sufficient.
