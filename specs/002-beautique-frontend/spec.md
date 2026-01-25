# Feature Specification: Beautique Store Frontend - Phase 1

**Feature Branch**: `002-beautique-frontend`
**Created**: 2026-01-19
**Status**: Draft
**Input**: User description: "Beautique Store Frontend - Phase 1: Next.js 16 customer-facing website and admin panel with customer pages, admin panel, UI components, state management, form validation, and API integration"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and Purchase Products (Priority: P1)

A customer visits the Beautique Store to browse traditional clothing (maxi dresses, lehanga choli, etc.), add items to their cart, and complete a purchase with Cash on Delivery payment.

**Why this priority**: This is the core revenue-generating flow. Without the ability to browse products and place orders, the store cannot function as an e-commerce platform.

**Independent Test**: Can be fully tested by navigating from home page → product listing → product detail → add to cart → checkout → order confirmation. Delivers complete purchase capability.

**Acceptance Scenarios**:

1. **Given** a customer on the home page, **When** they click on a product category, **Then** they see a filtered list of products in that category with images, names, and prices.
2. **Given** a customer viewing a product, **When** they select size, color, and click "Add to Cart", **Then** the item is added to their cart and the cart icon shows the updated count.
3. **Given** a customer with items in cart, **When** they proceed to checkout and fill the form with valid details, **Then** an order is created with a unique Order ID and payment instructions are displayed.
4. **Given** a customer completing checkout, **When** they submit the order, **Then** they see an order confirmation page with Order ID, order summary, and COD payment instructions.

---

### User Story 2 - Track Order Status (Priority: P2)

A customer who has placed an order wants to check the current status of their order using their Order ID and phone number.

**Why this priority**: After placing an order, customers need visibility into their order status. This reduces support inquiries and improves customer satisfaction.

**Independent Test**: Can be tested by entering a valid Order ID + phone number combination on the tracking page and verifying status display.

**Acceptance Scenarios**:

1. **Given** a customer on the order tracking page, **When** they enter a valid Order ID and matching phone number, **Then** they see the current order status (Pending, Processing, Shipped, Delivered, Cancelled).
2. **Given** a customer with an invalid Order ID or phone combination, **When** they submit the tracking form, **Then** they see an appropriate error message indicating the order was not found.
3. **Given** a shipped order, **When** the customer views tracking, **Then** they see tracking notes and estimated delivery information if available.

---

### User Story 3 - Manage Wishlist (Priority: P3)

A customer wants to save products they are interested in for later consideration without adding them to the cart.

**Why this priority**: Wishlist functionality improves user engagement and return visits, but is not essential for core purchase flow.

**Independent Test**: Can be tested by adding/removing products to wishlist and verifying persistence across page refreshes (via browser storage).

**Acceptance Scenarios**:

1. **Given** a customer viewing a product, **When** they click the wishlist/heart icon, **Then** the product is saved to their wishlist and the icon state changes to indicate it's saved.
2. **Given** a customer with items in wishlist, **When** they visit the wishlist page, **Then** they see all saved products with options to remove or add to cart.
3. **Given** a customer who closes and reopens the browser, **When** they visit the wishlist page, **Then** their previously saved items are still present.

---

### User Story 4 - Admin Product Management (Priority: P1)

A store administrator needs to add new products, edit existing products, and manage the product catalog including uploading product images.

**Why this priority**: Without product management, the store cannot be populated with inventory. This is essential for the store to operate.

**Independent Test**: Can be tested by logging into admin panel, creating a new product with images, editing it, and verifying it appears on the customer-facing site.

**Acceptance Scenarios**:

1. **Given** an authenticated admin on the products page, **When** they click "Add New Product" and fill the form with name, description, price, category, sizes, colors, and images, **Then** the product is created and visible in the product list.
2. **Given** an admin editing a product, **When** they modify any field and save, **Then** the changes are persisted and reflected on the customer site.
3. **Given** an admin uploading product images, **When** they select image files, **Then** the images are uploaded and associated with the product.

---

### User Story 5 - Admin Order Management (Priority: P1)

A store administrator needs to view all orders, update order statuses, add tracking notes, and export order data for fulfillment and accounting purposes.

**Why this priority**: Order management is essential for business operations - fulfilling orders, tracking shipments, and maintaining records.

**Independent Test**: Can be tested by viewing orders list, updating an order status, adding tracking notes, and exporting orders to CSV.

**Acceptance Scenarios**:

1. **Given** an authenticated admin on the orders page, **When** they view the orders list, **Then** they see all orders with customer name, total, status, and date with pagination and filtering options.
2. **Given** an admin viewing an order, **When** they update the status (Pending → Processing → Shipped → Delivered), **Then** the status is saved and visible to the customer on the tracking page.
3. **Given** an admin, **When** they click "Export to CSV", **Then** a CSV file is downloaded containing all filtered order data.

---

### User Story 6 - Admin Authentication (Priority: P1)

A store administrator needs to securely log in to access the admin panel, with their session persisted across page refreshes.

**Why this priority**: Security is critical - all admin functionality must be protected behind authentication.

**Independent Test**: Can be tested by logging in with valid credentials, verifying access to admin pages, and confirming unauthenticated users are redirected.

**Acceptance Scenarios**:

1. **Given** an admin on the login page, **When** they enter valid credentials, **Then** they are authenticated and redirected to the admin dashboard.
2. **Given** an unauthenticated user, **When** they try to access any admin route, **Then** they are redirected to the login page.
3. **Given** an authenticated admin, **When** they close and reopen the browser within the session validity period, **Then** they remain authenticated.
4. **Given** an authenticated admin, **When** they click logout, **Then** their session is terminated and they cannot access admin pages without re-authenticating.

---

### User Story 7 - Search and Filter Products (Priority: P2)

A customer wants to quickly find products using search functionality and filter results by category, price range, size, and color.

**Why this priority**: Improves product discoverability and user experience, especially as the product catalog grows.

**Independent Test**: Can be tested by entering search terms, applying filters, and verifying results match the criteria.

**Acceptance Scenarios**:

1. **Given** a customer on any page with the navbar, **When** they enter a search term in the search bar, **Then** they see search results matching product names or descriptions.
2. **Given** a customer on the products page, **When** they apply filters (category, price range, size, color), **Then** the product list updates to show only matching products.
3. **Given** a customer with active filters, **When** they clear filters, **Then** all products are displayed again.

---

### User Story 8 - View Store Information (Priority: P3)

A customer wants to learn about the store, find contact information, view FAQs, and understand policies before making a purchase.

**Why this priority**: Builds trust and provides necessary information, but not essential for the core purchase flow.

**Independent Test**: Can be tested by navigating to each informational page and verifying content displays correctly.

**Acceptance Scenarios**:

1. **Given** a customer, **When** they visit the About Us page, **Then** they see the shop description and an embedded Google Maps showing the store location.
2. **Given** a customer, **When** they visit the Contact Us page, **Then** they see phone number, WhatsApp link, email, and a contact form.
3. **Given** a customer, **When** they visit the FAQ page, **Then** they see common questions and answers in an expandable format.
4. **Given** a customer, **When** they visit Privacy Policy or Terms of Service pages, **Then** they see the respective policy content.

---

### User Story 9 - Admin Dashboard Analytics (Priority: P2)

A store administrator wants to view business analytics and statistics on the dashboard to understand store performance.

**Why this priority**: Provides business insights but not essential for day-to-day operations of order fulfillment.

**Independent Test**: Can be tested by logging in as admin and verifying dashboard displays relevant statistics.

**Acceptance Scenarios**:

1. **Given** an authenticated admin on the dashboard, **When** the page loads, **Then** they see key metrics including total orders, total revenue, pending orders count, and recent orders.
2. **Given** an admin viewing the dashboard, **When** new orders are placed, **Then** the statistics reflect the updated data on page refresh.

---

### Edge Cases

- What happens when a customer adds a product to cart that becomes out of stock before checkout?
  - Display a clear message that the item is no longer available and allow removal from cart.
- How does the system handle checkout form submission with invalid phone number format?
  - Show inline validation errors immediately, preventing form submission until corrected.
- What happens when the backend API is unavailable?
  - Display user-friendly error messages and offer retry options where appropriate.
- How does the cart behave when browser storage is full or disabled?
  - Gracefully handle storage errors and inform the user that cart data may not persist.
- What happens when an admin session expires during a form submission?
  - Preserve form data where possible and redirect to login, then allow completion after re-authentication.
- How does the system handle image upload failures?
  - Display error message and allow retry without losing other form data.
- What happens when a customer tries to track an order with correct Order ID but wrong phone?
  - Display "Order not found" message without revealing whether the Order ID exists (security consideration).

## Requirements *(mandatory)*

### Functional Requirements

#### Customer Pages (Public)

- **FR-001**: System MUST display a home page with hero section, featured products, and product categories.
- **FR-002**: System MUST display a products listing page with all products, showing product cards with image, name, price, wishlist button, and add-to-cart button.
- **FR-003**: System MUST support category-specific pages (e.g., /products/maxi, /products/lehanga-choli) showing filtered products.
- **FR-004**: System MUST display a product detail page with image gallery, product name, description, price, available sizes, colors, and add-to-cart functionality.
- **FR-005**: System MUST allow customers to select size and color variants before adding a product to cart.
- **FR-006**: System MUST maintain a shopping cart that persists in browser storage, allowing customers to view items, update quantities, and remove items.
- **FR-007**: System MUST provide a checkout page with a validated customer form collecting: name, phone, WhatsApp number, email, address, city, country, and notes.
- **FR-008**: System MUST validate phone numbers accepting international formats (10-15 digits).
- **FR-009**: System MUST display an order confirmation page showing Order ID, order details, and Cash on Delivery payment instructions.
- **FR-010**: System MUST provide an order tracking page where customers can input Order ID and phone number to view order status.
- **FR-011**: System MUST maintain a wishlist that persists in browser storage, allowing customers to add, remove, and view saved products.
- **FR-012**: System MUST display an About Us page with shop description and embedded Google Maps location.
- **FR-013**: System MUST display a FAQ page with expandable question/answer sections.
- **FR-014**: System MUST display a Contact Us page with phone, WhatsApp, email, and a contact form.
- **FR-015**: System MUST display Privacy Policy and Terms of Service pages with respective content.

#### Navigation and UI

- **FR-016**: System MUST display a navigation bar on all pages with logo, categories dropdown, search bar, wishlist icon, and cart icon with item count.
- **FR-017**: System MUST display a footer on all pages with navigation links, social media links, and payment method information.
- **FR-018**: System MUST provide a filter sidebar on product listing pages with category, price range, size, and color filters.
- **FR-019**: System MUST implement pagination for product listings and order lists.
- **FR-020**: System MUST display appropriate loading states during data fetching.
- **FR-021**: System MUST display user-friendly error messages when operations fail.
- **FR-022**: System MUST display toast notifications for user actions (add to cart, add to wishlist, form submissions).

#### Admin Panel (Protected)

- **FR-023**: System MUST provide an admin login page at /admin/login requiring email and password.
- **FR-024**: System MUST protect all admin routes, redirecting unauthenticated users to the login page.
- **FR-025**: System MUST provide an admin dashboard at /admin/dashboard displaying analytics and statistics.
- **FR-026**: System MUST provide a products management page at /admin/products listing all products with options to add, edit, and view.
- **FR-027**: System MUST provide a product creation form at /admin/products/new with fields for name, description, price, category, sizes, colors, and image upload.
- **FR-028**: System MUST provide a product edit form at /admin/products/[id]/edit pre-populated with existing product data.
- **FR-029**: System MUST support image upload for products through the backend's image upload service.
- **FR-030**: System MUST provide an orders management page at /admin/orders listing all orders with filters and pagination.
- **FR-031**: System MUST provide an order detail page at /admin/orders/[id] showing full order information with ability to update status and add tracking notes.
- **FR-032**: System MUST allow admins to update order status through predefined states: Pending, Processing, Shipped, Delivered, Cancelled.
- **FR-033**: System MUST provide CSV export functionality for orders with current filter criteria applied.
- **FR-034**: System MUST provide an admin settings page at /admin/settings allowing password changes.
- **FR-035**: System MUST provide admin logout functionality that terminates the session.

#### API Integration

- **FR-036**: System MUST integrate with the backend API at the configured base URL for all data operations.
- **FR-037**: System MUST handle API errors gracefully, displaying appropriate messages for 401 (unauthorized), 404 (not found), 422 (validation error), and 500 (server error) responses.
- **FR-038**: System MUST send authentication tokens with admin API requests.

### Key Entities

- **Product**: Represents a clothing item with name, description, price, category, available sizes, available colors, images, and stock status.
- **Category**: Represents a product classification (e.g., Maxi, Lehanga Choli, Saree) used for filtering and navigation.
- **Cart**: Represents a customer's shopping cart containing cart items with product reference, selected size, selected color, and quantity.
- **CartItem**: Represents a single item in the cart with product details, selected variants, and quantity.
- **Order**: Represents a customer purchase with order ID, customer details (name, phone, WhatsApp, email, address, city, country), order items, total amount, status, and tracking notes.
- **OrderItem**: Represents a product within an order with product details, selected size, color, quantity, and price at time of purchase.
- **Wishlist**: Represents a customer's saved products for later consideration.
- **Admin**: Represents a store administrator with authentication credentials and the ability to manage products and orders.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Customers can browse products and complete checkout in under 5 minutes from landing on the home page.
- **SC-002**: All customer-facing pages load and become interactive within 3 seconds on standard broadband connections.
- **SC-003**: 95% of users can successfully add items to cart and proceed to checkout without encountering errors.
- **SC-004**: Order tracking returns status within 2 seconds of form submission.
- **SC-005**: Cart and wishlist data persists correctly across browser sessions in 100% of supported browsers.
- **SC-006**: All forms display validation errors within 500ms of invalid input.
- **SC-007**: Admin can log in and access the dashboard within 3 seconds.
- **SC-008**: Admin can create a new product with images in under 3 minutes.
- **SC-009**: Admin can update an order status with 2 or fewer clicks from the orders list.
- **SC-010**: CSV export generates and downloads within 5 seconds for up to 1000 orders.
- **SC-011**: All pages display correctly on mobile (320px+), tablet (768px+), and desktop (1024px+) viewports.
- **SC-012**: No console errors appear during normal user flows on any page.
- **SC-013**: 100% of admin routes correctly redirect unauthenticated users to login.

## Assumptions

- The backend API (http://localhost:8000) is fully implemented and operational, providing all required endpoints.
- Image upload is handled by the backend which integrates with Cloudinary; the frontend only needs to send files to the backend.
- Cash on Delivery is the only payment method for Phase 1; no payment gateway integration is needed.
- Customer authentication/registration is out of scope for Phase 1; customers checkout as guests.
- Product inventory/stock management is handled by the backend; the frontend displays stock status provided by the API.
- Order statuses follow a fixed progression: Pending → Processing → Shipped → Delivered (with Cancelled as an alternative terminal state).
- Admin credentials are pre-seeded in the backend; no admin registration functionality is required.
- Google Maps embed requires only a static location; no interactive features or API key management beyond basic embedding.
- WhatsApp integration uses standard wa.me links; no WhatsApp Business API integration is required.
- Browser storage (localStorage) is available in all supported browsers; no server-side session fallback is needed for cart/wishlist.

## Dependencies

- Backend API must be running and accessible for all data operations.
- Cloudinary service (via backend) must be available for image uploads.
- Google Maps embed service for store location display.

## Out of Scope

- Customer login/signup (deferred to Phase 2)
- Payment gateway integration (COD only for Phase 1)
- Real-time notifications (WebSocket)
- Advanced search functionality (Elasticsearch)
- Product reviews and ratings system
- Multi-language support
- Email notifications to customers
- Inventory/stock management UI
- Product variant management beyond size/color
- Discount codes and promotions
- Shipping cost calculation
