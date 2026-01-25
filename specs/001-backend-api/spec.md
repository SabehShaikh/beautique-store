# Feature Specification: Beautique Store Backend API

**Feature Branch**: `001-backend-api`
**Created**: 2026-01-18
**Status**: Draft
**Constitution Reference**: `.specify/memory/constitution.md` (Principles I, II, III, IV, VI, VII)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Products (Priority: P1)

A customer wants to browse the Beautique Store product catalog, search for items, and filter by category or price range to find clothing items they're interested in purchasing.

**Why this priority**: Product browsing is the foundation of the e-commerce experience. Without the ability to view products, no other functionality (cart, checkout, orders) can be used.

**Independent Test**: Can be fully tested by making requests to product listing and detail endpoints, verifying correct data is returned with appropriate filtering.

**Acceptance Scenarios**:

1. **Given** products exist in the database, **When** a customer requests all products, **Then** the system returns a list of active products with name, category, price, images, sizes, and colors
2. **Given** products exist in multiple categories, **When** a customer filters by category "Maxi", **Then** only products in the Maxi category are returned
3. **Given** products with various prices exist, **When** a customer filters by price range 5000-10000, **Then** only products within that price range are returned
4. **Given** products exist, **When** a customer searches for "silk", **Then** products with "silk" in the name or description are returned
5. **Given** a valid product ID, **When** a customer requests product details, **Then** complete product information including all images, sizes, and colors is returned
6. **Given** bestseller products are marked, **When** a customer requests bestsellers, **Then** only products marked as bestsellers are returned

---

### User Story 2 - Place Order (Priority: P2)

A customer wants to submit their cart items as an order, providing their contact and delivery information so the store can process and deliver their purchase.

**Why this priority**: Order creation is the core revenue-generating functionality. Without orders, the business cannot operate.

**Independent Test**: Can be fully tested by submitting order data and verifying the order is stored with a generated Order ID.

**Acceptance Scenarios**:

1. **Given** valid customer details and cart items, **When** a customer submits an order, **Then** the system creates an order with a unique Order ID (format: BQ-YYYYMMDD-XXX)
2. **Given** valid order data, **When** the order is created, **Then** all customer details (name, phone, WhatsApp, address, city) are stored
3. **Given** cart items with product details, **When** the order is created, **Then** each item's product ID, name, size, color, quantity, and price are stored
4. **Given** a payment method is selected, **When** the order is created, **Then** the payment method is recorded and payment status is set to "Pending"
5. **Given** an international phone number with country code, **When** the order is submitted, **Then** the phone number is accepted and stored correctly
6. **Given** incomplete customer details (missing required fields), **When** the order is submitted, **Then** the system rejects the order with specific validation errors

---

### User Story 3 - Track Order (Priority: P3)

A customer wants to check the status of their order using their Order ID and phone number to see payment status, order status, and delivery progress.

**Why this priority**: Order tracking reduces customer support inquiries and builds trust by providing transparency on order progress.

**Independent Test**: Can be fully tested by creating an order and then retrieving it via Order ID + phone verification.

**Acceptance Scenarios**:

1. **Given** an existing order, **When** a customer provides matching Order ID and phone number, **Then** the order details and current status are returned
2. **Given** a valid Order ID but wrong phone number, **When** a customer attempts to track, **Then** the system returns "Order not found" (security: does not reveal if Order ID exists)
3. **Given** an order with updated status, **When** a customer tracks the order, **Then** current payment status, order status, delivery status, and tracking notes are shown
4. **Given** an order with estimated delivery date, **When** a customer tracks the order, **Then** the estimated delivery date is displayed

---

### User Story 4 - Admin Authentication (Priority: P4)

An admin user wants to log in to the system securely to access administrative functions for managing products and orders.

**Why this priority**: Admin authentication is a prerequisite for all admin functionality. Without it, product and order management cannot be secured.

**Independent Test**: Can be fully tested by attempting login with valid/invalid credentials and verifying token issuance.

**Acceptance Scenarios**:

1. **Given** valid admin credentials, **When** an admin logs in, **Then** a secure authentication token is returned
2. **Given** invalid credentials, **When** an admin attempts login, **Then** the system returns an authentication error without revealing which field was wrong
3. **Given** a valid authentication token, **When** an admin accesses protected endpoints, **Then** access is granted
4. **Given** an expired or invalid token, **When** an admin accesses protected endpoints, **Then** access is denied with appropriate error
5. **Given** no token provided, **When** accessing admin endpoints, **Then** the system returns "Unauthorized"

---

### User Story 5 - Admin Product Management (Priority: P5)

An admin wants to create, update, and remove products from the catalog, including uploading product images, to maintain the store inventory.

**Why this priority**: Product management enables the business to add new inventory and maintain accurate product information.

**Independent Test**: Can be fully tested by performing CRUD operations on products and verifying database state changes.

**Acceptance Scenarios**:

1. **Given** valid product data, **When** an admin creates a product, **Then** the product is stored with all details (name, category, price, description, sizes, colors)
2. **Given** product images, **When** an admin uploads images, **Then** images are stored in cloud storage and URLs are saved with the product
3. **Given** an existing product, **When** an admin updates product details, **Then** the product is updated and update timestamp is recorded
4. **Given** an existing product, **When** an admin deletes the product, **Then** the product is soft-deleted (marked inactive, not removed from database)
5. **Given** invalid product data (e.g., missing name, invalid category), **When** an admin attempts to create/update, **Then** specific validation errors are returned
6. **Given** valid product data, **When** an admin creates a product with bestseller flag, **Then** the product appears in bestseller listings

---

### User Story 6 - Admin Order Management (Priority: P6)

An admin wants to view all orders, filter by status, update order statuses (payment, order, delivery), and add tracking notes to process customer orders.

**Why this priority**: Order management is essential for business operations - verifying payments, processing orders, and tracking deliveries.

**Independent Test**: Can be fully tested by creating orders and then viewing/updating them through admin endpoints.

**Acceptance Scenarios**:

1. **Given** orders exist, **When** an admin requests all orders, **Then** a paginated list of orders is returned with customer name, order ID, total, and status
2. **Given** orders with various statuses, **When** an admin filters by payment status "Pending", **Then** only orders with pending payment are returned
3. **Given** an order exists, **When** an admin views order details, **Then** complete order information including all items and customer details is returned
4. **Given** an order exists, **When** an admin updates payment status to "Verified", **Then** the payment status is updated and timestamp recorded
5. **Given** an order exists, **When** an admin adds tracking notes, **Then** the notes are saved and visible in order details
6. **Given** orders exist, **When** an admin exports orders, **Then** a downloadable file with order data is generated

---

### User Story 7 - Admin Dashboard Analytics (Priority: P7)

An admin wants to view key business metrics (total orders, pending orders, revenue) to understand store performance at a glance.

**Why this priority**: Analytics provide business insights but are not critical for core operations. Can be added after CRUD functionality works.

**Independent Test**: Can be fully tested by creating orders and verifying dashboard metrics reflect the data accurately.

**Acceptance Scenarios**:

1. **Given** orders exist in the system, **When** an admin views the dashboard, **Then** total order count is displayed
2. **Given** orders with various payment statuses, **When** an admin views the dashboard, **Then** count of orders pending payment verification is shown
3. **Given** orders with total amounts, **When** an admin views the dashboard, **Then** total revenue is calculated and displayed
4. **Given** orders exist in multiple statuses, **When** an admin views the dashboard, **Then** order count by status breakdown is shown

---

### Edge Cases

- What happens when a product is deleted but orders reference it? System retains product name/details in order items (stored as snapshot)
- What happens when database connection fails? System returns appropriate error response without exposing internal details
- What happens when image upload fails? System returns error, product creation/update fails atomically
- What happens when Order ID sequence reaches 999 for a day? System continues with 1000, 1001, etc. (no limit enforced)
- What happens with empty search query? System returns all active products (no filtering applied)
- What happens with overlapping price range filters? System returns products within the specified min-max range
- What happens when admin token expires mid-operation? Current request completes, subsequent requests require re-authentication

## Requirements *(mandatory)*

### Functional Requirements

**Product Management (Public)**

- **FR-001**: System MUST provide endpoint to list all active products with optional filtering by category, search term, minimum price, and maximum price
- **FR-002**: System MUST provide endpoint to retrieve single product details by ID including all images, sizes, and colors
- **FR-003**: System MUST provide endpoint to list all 5 product categories (Maxi, Lehanga Choli, Long Shirt, Shalwar Kameez, Gharara)
- **FR-004**: System MUST provide endpoint to list products marked as bestsellers

**Order Management (Public)**

- **FR-005**: System MUST provide endpoint to create orders with customer details and cart items
- **FR-006**: System MUST generate unique Order IDs in format BQ-YYYYMMDD-XXX where XXX is a sequential number for that date
- **FR-007**: System MUST validate all required customer fields: name (min 3 chars), phone (10-15 digits, international format), WhatsApp (10-15 digits), address (min 10 chars), city (min 2 chars)
- **FR-008**: System MUST store order items as a snapshot including product ID, name, size, color, quantity, and unit price
- **FR-009**: System MUST provide endpoint to track order by Order ID and phone number combination
- **FR-010**: System MUST NOT reveal whether an Order ID exists if phone verification fails

**Admin Authentication**

- **FR-011**: System MUST provide login endpoint that accepts username and password and returns authentication token
- **FR-012**: System MUST protect all admin endpoints requiring valid authentication token
- **FR-013**: System MUST securely hash admin passwords (never store plaintext)
- **FR-014**: System MUST reject expired or invalid authentication tokens

**Admin Product Management**

- **FR-015**: System MUST provide endpoint to create products with name, category, price, description, images, sizes, and colors
- **FR-016**: System MUST provide endpoint to update existing products
- **FR-017**: System MUST provide endpoint to soft-delete products (set is_active=false)
- **FR-018**: System MUST provide endpoint to upload product images to cloud storage and return URLs
- **FR-019**: System MUST validate product data: name (3-255 chars), category (one of 5 valid options), price (0-1,000,000), description (10-2000 chars), at least 1 image, at least 1 size, at least 1 color

**Admin Order Management**

- **FR-020**: System MUST provide endpoint to list all orders with pagination and filtering by status
- **FR-021**: System MUST provide endpoint to retrieve single order details including all items and customer information
- **FR-022**: System MUST provide endpoint to update order payment status (Pending, Paid, Verified)
- **FR-023**: System MUST provide endpoint to update order status (Received, Processing, Ready, Delivered, Cancelled)
- **FR-024**: System MUST provide endpoint to update delivery status (Not Started, In Progress, Out for Delivery, Delivered)
- **FR-025**: System MUST provide endpoint to add/update tracking notes and estimated delivery date
- **FR-026**: System MUST provide endpoint to export orders as downloadable data file

**Admin Analytics**

- **FR-027**: System MUST provide dashboard endpoint returning total orders, pending payment count, and total revenue

**Cross-Cutting**

- **FR-028**: System MUST accept requests from configured frontend origins (cross-origin support)
- **FR-029**: System MUST return appropriate error codes: 422 for validation errors, 401 for authentication errors, 404 for not found, 500 for server errors
- **FR-030**: System MUST auto-generate interactive documentation for all endpoints

### Key Entities

- **Product**: Sellable item with name, category (5 types), price, description, multiple images, available sizes, available colors, bestseller flag, active status, timestamps
- **Order**: Customer purchase containing contact details (name, phone, WhatsApp, email, address, city, country, notes), purchased items (snapshot of product details), total amount, payment method, three status fields (payment, order, delivery), tracking information, timestamps
- **Admin User**: System administrator with username, email, secure password, role, active status, login tracking

## Assumptions

- Phone numbers follow international format and regex validation is sufficient (no SMS verification required)
- Product images are uploaded to cloud storage and URLs are stored; no local file storage
- Order ID daily sequence (XXX) resets each day; no collision handling needed beyond timestamp
- Admin users are pre-created; no self-registration for admin accounts
- Single currency (PKR) assumed; no currency conversion
- Soft delete for products; orders are never deleted
- Session/token expiration time follows standard practices (e.g., 24 hours)
- Pagination defaults to 20 items per page if not specified
- Search is case-insensitive and matches name/description fields

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 16 documented endpoints respond correctly to valid requests within 2 seconds under normal load
- **SC-002**: Product listing supports filtering by category, search term, and price range in a single request
- **SC-003**: Order creation generates unique Order IDs with zero duplicates
- **SC-004**: Order tracking returns results only when both Order ID and phone number match (100% accuracy)
- **SC-005**: Admin authentication rejects 100% of invalid credential attempts
- **SC-006**: Product images are stored in cloud storage and accessible via returned URLs
- **SC-007**: All validation rules enforce constraints as specified (phone format, field lengths, required fields)
- **SC-008**: Admin can update any order's payment, order, and delivery status independently
- **SC-009**: Order export generates downloadable file containing all order data
- **SC-010**: Dashboard analytics accurately reflect current order counts and revenue totals
- **SC-011**: System accepts international phone numbers with country codes (10-15 digits)
- **SC-012**: Interactive documentation is automatically available without manual maintenance
- **SC-013**: No sensitive configuration values are hardcoded in the codebase

## Out of Scope

- Customer authentication/login (Phase 1 uses localStorage on frontend)
- Payment gateway integration (manual WhatsApp verification)
- Automated email/SMS notifications
- Stock/inventory tracking
- Real-time order updates (WebSockets)
- Product reviews/ratings
- Advanced search (full-text search engine)
- Image processing beyond cloud storage upload
- Multi-language support
- Shipping cost calculator
- Discount codes/promotions
