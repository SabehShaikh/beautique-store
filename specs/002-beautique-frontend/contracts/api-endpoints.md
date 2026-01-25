# API Contracts: Beautique Store Frontend

**Feature Branch**: `002-beautique-frontend`
**Created**: 2026-01-19
**Backend Base URL**: `http://localhost:8000`

## Overview

This document defines the API contracts between the Next.js frontend and FastAPI backend. All endpoints are RESTful JSON APIs.

---

## Authentication

### Admin Authentication

Admin endpoints require JWT Bearer token authentication.

**Header Format**:
```
Authorization: Bearer <access_token>
```

**Token Acquisition**: POST `/api/admin/login`

**Token Expiry**: 24 hours (86400 seconds)

---

## Public Endpoints (No Auth Required)

### Products

#### GET /api/products
List all active products with optional filters.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter by category: Maxi, Lehanga Choli, Long Shirt, Shalwar Kameez, Gharara |
| search | string | No | Search in name and description |
| minPrice | number | No | Minimum price filter (>=0) |
| maxPrice | number | No | Maximum price filter (<=1,000,000) |
| page | integer | No | Page number (default: 1, min: 1) |
| limit | integer | No | Items per page (default: 20, min: 1, max: 50) |

**Response**: `200 OK`
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "string",
      "category": "Maxi",
      "price": 5000.00,
      "description": "string",
      "images": ["https://res.cloudinary.com/..."],
      "sizes": ["S", "M", "L"],
      "colors": ["Red", "Blue"],
      "is_bestseller": false,
      "is_active": true,
      "created_at": "2026-01-19T00:00:00Z",
      "updated_at": "2026-01-19T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "pages": 5
}
```

---

#### GET /api/products/bestsellers
Get products marked as bestsellers.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Maximum products to return (default: 10, min: 1, max: 20) |

**Response**: `200 OK`
```json
{
  "products": [
    { "id": "uuid", "name": "string", ... }
  ]
}
```

---

#### GET /api/products/{id}
Get product details by UUID.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | UUID | Product ID |

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "name": "string",
  "category": "Maxi",
  "price": 5000.00,
  "description": "string",
  "images": ["url1", "url2"],
  "sizes": ["S", "M", "L"],
  "colors": ["Red", "Blue"],
  "is_bestseller": false,
  "is_active": true,
  "created_at": "2026-01-19T00:00:00Z",
  "updated_at": "2026-01-19T00:00:00Z"
}
```

**Error Response**: `404 Not Found`
```json
{ "detail": "Product not found" }
```

---

### Categories

#### GET /api/categories
List all product categories.

**Response**: `200 OK`
```json
{
  "categories": [
    "Maxi",
    "Lehanga Choli",
    "Long Shirt",
    "Shalwar Kameez",
    "Gharara"
  ]
}
```

---

### Orders

#### POST /api/orders
Create a new order.

**Request Body**:
```json
{
  "customer_name": "string (min 3 chars)",
  "phone": "string (10-15 digits, international format)",
  "whatsapp": "string (10-15 digits, international format)",
  "email": "string (optional, valid email)",
  "address": "string (min 10 chars)",
  "city": "string (min 2 chars)",
  "country": "string (optional)",
  "notes": "string (optional, max 500 chars)",
  "items": [
    {
      "product_id": "uuid",
      "name": "string",
      "size": "M",
      "color": "Red",
      "quantity": 1,
      "price": 5000.00
    }
  ],
  "payment_method": "Easypaisa | Meezan Bank | International Bank"
}
```

**Response**: `201 Created`
```json
{
  "id": "uuid",
  "order_id": "BQ-20260119-001",
  "customer_name": "string",
  "total_amount": 5000.00,
  "payment_status": "Pending",
  "order_status": "Received",
  "created_at": "2026-01-19T00:00:00Z"
}
```

**Error Response**: `422 Unprocessable Entity`
```json
{
  "detail": [
    {
      "loc": ["body", "phone"],
      "msg": "Phone must be 10-15 digits",
      "type": "value_error"
    }
  ]
}
```

---

#### GET /api/orders/track
Track order by Order ID and phone number.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| order_id | string | Yes | Order ID (e.g., BQ-20260119-001) |
| phone | string | Yes | Phone number used during checkout |

**Response**: `200 OK`
```json
{
  "order_id": "BQ-20260119-001",
  "customer_name": "string",
  "items": [
    {
      "product_id": "uuid",
      "name": "string",
      "size": "M",
      "color": "Red",
      "quantity": 1,
      "price": 5000.00
    }
  ],
  "total_amount": 5000.00,
  "payment_method": "Easypaisa",
  "payment_status": "Pending",
  "order_status": "Received",
  "delivery_status": "Not Started",
  "estimated_delivery": "2026-01-26",
  "tracking_notes": "string or null",
  "order_date": "2026-01-19"
}
```

**Error Response**: `404 Not Found`
```json
{ "detail": "Order not found" }
```

**Security Note**: Returns same "Order not found" error whether Order ID doesn't exist or phone doesn't match.

---

## Admin Endpoints (JWT Required)

### Authentication

#### POST /api/admin/login
Authenticate admin and get JWT token.

**Request Body**:
```json
{
  "username": "string",
  "password": "string"
}
```

**Response**: `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

**Error Response**: `401 Unauthorized`
```json
{ "detail": "Invalid username or password" }
```

---

### Admin Products

#### POST /api/admin/products
Create a new product.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "name": "string (3-255 chars)",
  "category": "Maxi | Lehanga Choli | Long Shirt | Shalwar Kameez | Gharara",
  "price": 5000.00,
  "description": "string (10-2000 chars)",
  "images": ["https://cloudinary.com/..."],
  "sizes": ["S", "M", "L"],
  "colors": ["Red", "Blue"],
  "is_bestseller": false
}
```

**Response**: `201 Created` - Full product object

---

#### PUT /api/admin/products/{id}
Update an existing product.

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**: `id` (UUID)

**Request Body**: Same as create, all fields optional

**Response**: `200 OK` - Updated product object

**Error Response**: `404 Not Found`

---

#### DELETE /api/admin/products/{id}
Soft-delete a product (sets is_active=false).

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**: `id` (UUID)

**Response**: `200 OK`
```json
{ "message": "Product deleted successfully" }
```

**Error Response**: `404 Not Found`

---

#### POST /api/admin/products/{id}/images
Upload images to Cloudinary and add to product.

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**: `id` (UUID)

**Request Body**: `multipart/form-data`
```
images: File[] (max 10 files)
```

**Response**: `200 OK`
```json
{ "images": ["https://res.cloudinary.com/..."] }
```

**Error Response**: `422 Unprocessable Entity`
```json
{ "detail": "Maximum 10 images allowed per upload" }
```

---

### Admin Orders

#### GET /api/admin/orders
List all orders with filters and pagination.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| payment_status | string | No | Filter by: Pending, Paid, Verified |
| order_status | string | No | Filter by: Received, Processing, Ready, Delivered, Cancelled |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20, max: 50) |

**Response**: `200 OK`
```json
{
  "orders": [
    {
      "id": "uuid",
      "order_id": "BQ-20260119-001",
      "customer_name": "string",
      "total_amount": 5000.00,
      "payment_status": "Pending",
      "order_status": "Received",
      "created_at": "2026-01-19T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "pages": 5
}
```

---

#### GET /api/admin/orders/{id}
Get full order details.

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**: `id` (UUID)

**Response**: `200 OK`
```json
{
  "id": "uuid",
  "order_id": "BQ-20260119-001",
  "customer_name": "string",
  "phone": "03001234567",
  "whatsapp": "03001234567",
  "email": "email@example.com",
  "address": "123 Main Street",
  "city": "Karachi",
  "country": "Pakistan",
  "notes": "Gift wrap please",
  "items": [...],
  "total_amount": 5000.00,
  "payment_method": "Easypaisa",
  "payment_status": "Pending",
  "order_status": "Received",
  "delivery_status": "Not Started",
  "estimated_delivery": null,
  "tracking_notes": null,
  "order_date": "2026-01-19",
  "created_at": "2026-01-19T00:00:00Z",
  "updated_at": "2026-01-19T00:00:00Z"
}
```

**Error Response**: `404 Not Found`

---

#### PATCH /api/admin/orders/{id}/status
Update order status fields.

**Headers**: `Authorization: Bearer <token>`

**Path Parameters**: `id` (UUID)

**Request Body** (all fields optional):
```json
{
  "payment_status": "Pending | Paid | Verified",
  "order_status": "Received | Processing | Ready | Delivered | Cancelled",
  "delivery_status": "Not Started | In Progress | Out for Delivery | Delivered",
  "estimated_delivery": "2026-01-26",
  "tracking_notes": "Shipment dispatched via courier"
}
```

**Response**: `200 OK` - Updated order detail object

**Error Response**: `404 Not Found`

---

#### GET /api/admin/orders/export
Export orders as CSV file.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start_date | date | No | Filter orders from this date (ISO format) |
| end_date | date | No | Filter orders until this date (ISO format) |

**Response**: `200 OK`
- Content-Type: `text/csv`
- Content-Disposition: `attachment; filename=orders_from_YYYY-MM-DD_to_YYYY-MM-DD.csv`

**CSV Columns**:
```
Order ID, Customer Name, Phone, WhatsApp, Email, City, Address, Total Amount, Payment Method, Payment Status, Order Status, Delivery Status, Order Date, Items
```

---

### Admin Analytics

#### GET /api/admin/analytics/dashboard
Get dashboard analytics metrics.

**Headers**: `Authorization: Bearer <token>`

**Response**: `200 OK`
```json
{
  "total_orders": 150,
  "pending_payment": 25,
  "total_revenue": 750000.00,
  "orders_by_status": {
    "Received": 20,
    "Processing": 30,
    "Ready": 10,
    "Delivered": 85,
    "Cancelled": 5
  }
}
```

---

## Error Responses

### Standard Error Format

All error responses follow this format:

```json
{ "detail": "Error message" }
```

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 401 | Unauthorized | Missing/invalid JWT token |
| 404 | Not Found | Resource doesn't exist |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server-side error |

### 401 Unauthorized
```json
{
  "detail": "Invalid or expired token"
}
```
**Header**: `WWW-Authenticate: Bearer`

### 404 Not Found
```json
{
  "detail": "Product not found"  // or "Order not found"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "Validation message",
      "type": "error_type"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"  // or detailed message in development
}
```

---

## Frontend API Client Usage

```typescript
// Example: Fetch products with filters
const products = await productsApi.list({
  category: 'Maxi',
  minPrice: 1000,
  maxPrice: 10000,
  page: 1,
  limit: 20,
});

// Example: Create order
const order = await ordersApi.create({
  customer_name: 'John Doe',
  phone: '+923001234567',
  whatsapp: '+923001234567',
  email: 'john@example.com',
  address: '123 Main Street, Block A',
  city: 'Karachi',
  country: 'Pakistan',
  payment_method: 'Easypaisa',
  items: cartItems.map(item => ({
    product_id: item.productId,
    name: item.name,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    price: item.price,
  })),
});

// Example: Track order
const tracking = await ordersApi.track('BQ-20260119-001', '+923001234567');

// Example: Admin login
const { access_token } = await adminApi.login({
  username: 'admin',
  password: 'password123',
});
localStorage.setItem('admin_token', access_token);

// Example: CSV export URL
const exportUrl = adminApi.orders.export('2026-01-01', '2026-01-31');
// Returns: http://localhost:8000/api/admin/orders/export?start_date=2026-01-01&end_date=2026-01-31
window.open(exportUrl, '_blank');
```
