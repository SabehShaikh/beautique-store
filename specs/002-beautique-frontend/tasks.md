# Tasks: Beautique Store Frontend - Phase 1

**Input**: Design documents from `/specs/002-beautique-frontend/`
**Prerequisites**: plan.md (required), spec.md (required), constitution.md (required)
**Branch**: `002-beautique-frontend`
**Date**: 2026-01-19

**Tests**: Manual testing only for Phase 1 (Playwright/Jest deferred to Phase 2 per plan.md)

**Organization**: Tasks follow the 6-phase structure from user requirements, mapped to user stories.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US9)
- Exact file paths included for all tasks

## Path Conventions

- **Frontend**: `frontend/` at repository root (alongside existing `backend/`)
- All paths are relative to `frontend/` unless specified

---

## Phase 0: Project Initialization (Must complete first)

**Purpose**: Set up Next.js project with all dependencies and base configuration

**⚠️ CRITICAL**: Must complete before ANY other work can begin

- [X] T001 Create Next.js 16 project with TypeScript in `frontend/` directory
  - **Command**: `npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir=false`
  - **File**: `frontend/package.json`
  - **Acceptance**: Project runs with `npm run dev` without errors

- [X] T002 Install dependencies (shadcn/ui, Tailwind, Zod, React Hook Form, Lucide icons)
  - **Command**: `npm install zod react-hook-form @hookform/resolvers lucide-react clsx tailwind-merge`
  - **File**: `frontend/package.json`
  - **Dependencies**: zod@^3.23.0, react-hook-form@^7.53.0, @hookform/resolvers@^3.9.0, lucide-react@^0.460.0, clsx@^2.1.0, tailwind-merge@^2.5.0
  - **Acceptance**: All packages in package.json, npm install succeeds

- [X] T003 Setup Tailwind config
  - **File**: `frontend/tailwind.config.ts`
  - **Config**: Add brand colors (primary, secondary), extend theme for Beautique design system
  - **Acceptance**: Custom colors available in components

- [X] T004 Setup TypeScript config
  - **File**: `frontend/tsconfig.json`
  - **Config**: strict: true, path aliases (@/components, @/lib, @/types, @/hooks, @/context)
  - **Acceptance**: Imports work with @ prefix

- [X] T005 Create .env.local with API URL
  - **File**: `frontend/.env.local`
  - **Variables**:
    - `NEXT_PUBLIC_API_URL=http://localhost:8000`
    - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
  - **Acceptance**: Environment variables accessible in app

- [X] T006 Initialize shadcn/ui
  - **Command**: `npx shadcn@latest init` then add components
  - **Settings**: Style: Default, Base color: Slate, CSS variables: Yes
  - **Components to add**: button, card, input, label, select, checkbox, dialog, dropdown-menu, toast, tabs, accordion, badge, separator, sheet, skeleton, avatar, table, form, textarea
  - **Files**: `frontend/components/ui/*.tsx`
  - **Acceptance**: All shadcn components importable

- [X] T007 [P] Configure next.config.js for Cloudinary images
  - **File**: `frontend/next.config.js`
  - **Config**: Add res.cloudinary.com to images.remotePatterns
  - **Acceptance**: Cloudinary images render with next/image

**Checkpoint Phase 0**: Next.js project runs, all dependencies installed, shadcn/ui ready

---

## Phase 1: Core Infrastructure (Blocking)

**Purpose**: Types, API client, state management, and base layout

**⚠️ CRITICAL**: No UI pages can begin until this phase is complete

### Type Definitions [P - All can run in parallel]

- [X] T008 [P] Create TypeScript types (Product, Order, Admin)
  - **File**: `frontend/types/product.ts`
  - **Types**: Product, ProductCategory (enum: Maxi, Lehanga Choli, Long Shirt, Shalwar Kameez, Gharara), ProductSize (enum: S, M, L, XL, XXL), ProductCreate, ProductUpdate, ProductListResponse, ProductListParams
  - **Acceptance**: Types compile without errors

- [X] T009 [P] Create Order types
  - **File**: `frontend/types/order.ts`
  - **Types**: Order, OrderItem, OrderCreate, OrderResponse, OrderTracking, OrderDetail, OrderListItem, OrderListResponse, OrderListParams, OrderStatusUpdate, PaymentMethod (enum: Easypaisa, Meezan Bank, International Transfer), PaymentStatus (enum: Pending, Paid, Verified), OrderStatus (enum: Received, Processing, Ready, Delivered, Cancelled), DeliveryStatus (enum: Not Started, In Progress, Out for Delivery, Delivered)
  - **Acceptance**: All order-related types defined

- [X] T010 [P] Create Admin types
  - **File**: `frontend/types/admin.ts`
  - **Types**: Admin, AdminLogin, AdminLoginResponse, DashboardAnalytics, AuthContextType
  - **Acceptance**: Admin types compile

- [X] T011 [P] Create Cart types
  - **File**: `frontend/types/cart.ts`
  - **Types**: CartItem, CartState, CartAction, CartContextType
  - **Actions**: ADD_TO_CART, REMOVE_FROM_CART, UPDATE_QUANTITY, CLEAR_CART
  - **Acceptance**: Cart types with useReducer pattern

- [X] T012 [P] Create Wishlist types
  - **File**: `frontend/types/wishlist.ts`
  - **Types**: WishlistItem, WishlistState, WishlistAction, WishlistContextType
  - **Actions**: ADD_TO_WISHLIST, REMOVE_FROM_WISHLIST, CLEAR_WISHLIST
  - **Acceptance**: Wishlist types defined

- [X] T013 [P] Create API types
  - **File**: `frontend/types/api.ts`
  - **Types**: ApiResponse<T>, ApiError, PaginatedResponse<T>, ValidationError, CategoriesResponse
  - **Acceptance**: Generic API response types

- [X] T014 [P] Create types index
  - **File**: `frontend/types/index.ts`
  - **Exports**: Re-export all types from product, order, admin, cart, wishlist, api
  - **Acceptance**: Single import for all types

### API Client

- [X] T015 Create API client (lib/api.ts)
  - **File**: `frontend/lib/api.ts`
  - **Depends on**: T008-T014 (types)
  - **Functions**:
    - `apiClient(endpoint, options)` - base fetch wrapper with error handling
    - `productsApi`: getProducts(filters), getProduct(id), getCategories(), getBestsellers()
    - `ordersApi`: createOrder(data), trackOrder(orderId, phone)
    - `adminApi`: login(credentials), getProducts(), createProduct(data), updateProduct(id, data), deleteProduct(id), uploadImages(id, files), getOrders(filters), getOrder(id), updateOrderStatus(id, data), exportOrdersCSV(filters), getDashboardAnalytics()
  - **Error handling**: Map 401, 404, 422, 500 to user-friendly messages
  - **Acceptance**: All API functions return typed responses

### Validation Schemas

- [X] T016 Setup Zod validation schemas (lib/validation.ts)
  - **File**: `frontend/lib/validation.ts`
  - **Depends on**: T008-T013 (types)
  - **Schemas**:
    - `checkoutSchema`: name (min 3), phone (10-15 digits international), whatsapp (10-15 digits), email (optional valid), address (min 10), city (min 2), country (optional), notes (max 500 optional), paymentMethod (enum)
    - `loginSchema`: email (valid), password (min 6)
    - `productSchema`: name (3-255), description (10-2000), price (0-1000000), category (enum), sizes (min 1), colors (min 1), images (1-10)
    - `trackOrderSchema`: orderId (BQ-YYYYMMDD-XXX pattern), phone (10-15 digits)
    - `contactSchema`: name (min 2), email (valid), message (min 10)
  - **Phone regex**: `/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/`
  - **Acceptance**: All schemas validate correctly

### Utility Functions [P]

- [X] T017 [P] Create utility functions (lib/utils.ts)
  - **File**: `frontend/lib/utils.ts`
  - **Functions**: cn() (class merge), formatPrice() (PKR formatting), formatDate(), slugify()
  - **Acceptance**: Utilities work correctly

- [X] T018 [P] Create constants (lib/constants.ts)
  - **File**: `frontend/lib/constants.ts`
  - **Constants**: CATEGORIES, SIZES, COLORS, PAYMENT_METHODS, PAYMENT_DETAILS (account info), ORDER_STATUSES, DELIVERY_STATUSES, STORAGE_KEYS, WHATSAPP_NUMBER, API_ROUTES
  - **Acceptance**: All constants exported

### Context Providers

- [X] T019 Create CartContext with localStorage
  - **File**: `frontend/context/CartContext.tsx`
  - **Depends on**: T011 (Cart types), T018 (STORAGE_KEYS)
  - **State**: items: CartItem[], initialized: boolean
  - **Actions**: addToCart(product, size, color, quantity), removeFromCart(itemId), updateQuantity(itemId, quantity), clearCart(), getCartTotal(), getCartCount()
  - **Persistence**: localStorage with hydration on mount
  - **Acceptance**: Cart persists across page refreshes

- [X] T020 Create AuthContext with JWT
  - **File**: `frontend/context/AuthContext.tsx`
  - **Depends on**: T010 (Admin types), T015 (API client)
  - **State**: admin: Admin | null, token: string | null, isAuthenticated: boolean, isLoading: boolean
  - **Actions**: login(credentials), logout(), checkAuth()
  - **Persistence**: localStorage for JWT token
  - **Acceptance**: Admin session persists, invalid token clears session

- [X] T021 [P] Create WishlistContext with localStorage
  - **File**: `frontend/context/WishlistContext.tsx`
  - **Depends on**: T012 (Wishlist types), T018 (STORAGE_KEYS)
  - **State**: items: WishlistItem[], initialized: boolean
  - **Actions**: addToWishlist(product), removeFromWishlist(productId), isInWishlist(productId), clearWishlist()
  - **Persistence**: localStorage with hydration
  - **Acceptance**: Wishlist persists across sessions

### Custom Hooks [P - All can run in parallel]

- [X] T022 [P] Create useCart hook
  - **File**: `frontend/hooks/useCart.ts`
  - **Depends on**: T019 (CartContext)
  - **Returns**: All CartContext values and actions
  - **Throws**: Error if used outside CartProvider
  - **Acceptance**: Hook works in components

- [X] T023 [P] Create useWishlist hook
  - **File**: `frontend/hooks/useWishlist.ts`
  - **Depends on**: T021 (WishlistContext)
  - **Returns**: All WishlistContext values and actions
  - **Acceptance**: Hook works in components

- [X] T024 [P] Create useAuth hook
  - **File**: `frontend/hooks/useAuth.ts`
  - **Depends on**: T020 (AuthContext)
  - **Returns**: All AuthContext values and actions
  - **Acceptance**: Hook works in admin components

### Layout Components

- [X] T025 Create base layout (app/layout.tsx)
  - **File**: `frontend/app/layout.tsx`
  - **Depends on**: T019-T021 (Contexts)
  - **Features**:
    - HTML with lang="en"
    - Metadata (title: "Beautique Store", description)
    - Font setup (Inter or similar)
    - CartProvider wrapping children
    - WishlistProvider wrapping children
    - Toaster component for notifications
  - **Note**: AuthProvider only wraps admin routes (separate layout)
  - **Acceptance**: Layout renders, contexts available

- [X] T026 Create Navbar component
  - **File**: `frontend/components/layout/Navbar.tsx`
  - **Depends on**: T022 (useCart), T023 (useWishlist)
  - **Features**:
    - Logo linking to /
    - Categories dropdown (links to /products/[category])
    - SearchBar integration
    - Wishlist icon with count badge (links to /wishlist)
    - Cart icon with count badge (links to /cart)
    - Mobile hamburger menu (Sheet component)
  - **Responsive**: Desktop nav, mobile sheet drawer
  - **Acceptance**: Navigation works, counts update

- [X] T027 Create Footer component
  - **File**: `frontend/components/layout/Footer.tsx`
  - **Features**:
    - Logo and tagline
    - Quick links (Home, Products, About, Support)
    - Categories links
    - Contact info (Phone, WhatsApp link, Email)
    - Payment methods info (Easypaisa, Meezan Bank, International Transfer)
    - Social media icons (placeholder)
    - Copyright notice
  - **Responsive**: 4-column desktop, stacked mobile
  - **Acceptance**: Footer renders, links work

- [X] T028 Update layout with Navbar and Footer
  - **File**: `frontend/app/layout.tsx` (update T025)
  - **Depends on**: T026 (Navbar), T027 (Footer)
  - **Add**: Navbar above main content, Footer below
  - **Acceptance**: Navbar and Footer on all pages

### Common Components [P - All can run in parallel]

- [X] T029 [P] Create LoadingSpinner component
  - **File**: `frontend/components/common/LoadingSpinner.tsx`
  - **Props**: size?: 'sm' | 'md' | 'lg', className?
  - **Implementation**: Animated spinner with Tailwind animate-spin
  - **Acceptance**: Spinner displays at all sizes

- [X] T030 [P] Create ErrorMessage component
  - **File**: `frontend/components/common/ErrorMessage.tsx`
  - **Props**: message: string, onRetry?: () => void, className?
  - **Implementation**: Error icon, message text, optional retry button
  - **Acceptance**: Error displays, retry button works

- [X] T031 [P] Create Pagination component
  - **File**: `frontend/components/common/Pagination.tsx`
  - **Props**: currentPage: number, totalPages: number, onPageChange(page), className?
  - **Features**: Previous/Next buttons, page numbers, ellipsis for large counts
  - **Implementation**: shadcn Button components
  - **Acceptance**: Pagination navigates correctly

- [X] T032 [P] Create SearchBar component
  - **File**: `frontend/components/common/SearchBar.tsx`
  - **Props**: onSearch(query), placeholder?, className?
  - **Features**: Input field, search icon, debounced (300ms), clear button
  - **Navigation**: Redirects to /products?search={query}
  - **Acceptance**: Search triggers with debounce

### Global UI States [P]

- [X] T033 [P] Create global loading.tsx
  - **File**: `frontend/app/loading.tsx`
  - **Implementation**: Full-page LoadingSpinner centered
  - **Acceptance**: Shows during page transitions

- [X] T034 [P] Create global error.tsx
  - **File**: `frontend/app/error.tsx`
  - **Implementation**: Error boundary with friendly message, reset button
  - **Acceptance**: Catches errors, reset works

- [X] T035 [P] Create not-found.tsx (404)
  - **File**: `frontend/app/not-found.tsx`
  - **Implementation**: 404 message, link to home
  - **Acceptance**: Shows for invalid routes

### Test basic routing

- [X] T036 Test basic routing works
  - **Test**: Navigate between /, /products, /cart, /wishlist
  - **Verify**: Navbar and Footer show on all pages
  - **Verify**: Context providers work (cart/wishlist counts)
  - **Acceptance**: Basic routing functional

**Checkpoint Phase 1**: Core infrastructure complete, can now build pages

---

## Phase 2: Customer Pages - Browse & Purchase (P1)

**Goal**: Complete purchase flow from browse to order confirmation (User Story 1)

**Independent Test**: Home → Products → Product Detail → Add to Cart → Cart → Checkout → Order Confirmation

### Product Components [P - All can run in parallel]

- [X] T037 [P] [US1] Create ProductCard component
  - **File**: `frontend/components/product/ProductCard.tsx`
  - **Depends on**: T008 (Product types), T023 (useWishlist)
  - **Props**: product: Product, className?
  - **Features**:
    - Product image (next/image with Cloudinary)
    - Product name, price (formatted PKR)
    - Category badge
    - Wishlist heart icon (toggle)
    - Bestseller badge (if is_bestseller)
    - Click navigates to /products/[id]
  - **Acceptance**: Card displays correctly, wishlist toggle works

- [X] T038 [P] [US1] Create ProductGrid component
  - **File**: `frontend/components/product/ProductGrid.tsx`
  - **Depends on**: T037 (ProductCard)
  - **Props**: products: Product[], isLoading?: boolean, emptyMessage?: string
  - **Features**:
    - Responsive grid (1 col mobile, 2 col tablet, 3-4 col desktop)
    - Loading skeleton state
    - Empty state message
  - **Acceptance**: Grid responsive, loading works

- [X] T039 [P] [US7] Create ProductFilter component
  - **File**: `frontend/components/product/ProductFilter.tsx`
  - **Depends on**: T018 (constants)
  - **Props**: filters: FilterState, onFilterChange(filters), className?
  - **Features**:
    - Category checkboxes
    - Price range (min/max inputs)
    - Size checkboxes
    - Color checkboxes
    - Clear all filters button
    - Active filter count
  - **Responsive**: Sidebar on desktop, Sheet drawer on mobile
  - **Acceptance**: Filters change state, clear works

- [X] T040 [P] [US1] Create ProductImageGallery component
  - **File**: `frontend/components/product/ImageGallery.tsx`
  - **Props**: images: string[], productName: string
  - **Features**:
    - Main large image display
    - Thumbnail strip below
    - Click thumbnail to change main image
    - Zoom on hover (optional)
  - **Implementation**: next/image with Cloudinary URLs
  - **Acceptance**: Gallery works, images load

### Cart Components [P - All can run in parallel]

- [X] T041 [P] [US1] Create CartItem component
  - **File**: `frontend/components/cart/CartItem.tsx`
  - **Depends on**: T011 (CartItem type), T022 (useCart)
  - **Props**: item: CartItem
  - **Features**:
    - Product image (small)
    - Product name, selected size, color
    - Price per item
    - Quantity controls (+/- buttons)
    - Remove button (trash icon)
    - Line total
  - **Actions**: updateQuantity(), removeFromCart()
  - **Acceptance**: Controls update cart state

- [X] T042 [P] [US1] Create CartSummary component
  - **File**: `frontend/components/cart/CartSummary.tsx`
  - **Depends on**: T022 (useCart)
  - **Props**: None (uses hook)
  - **Features**:
    - Subtotal
    - Item count
    - Proceed to Checkout button (links to /checkout)
  - **Acceptance**: Totals update when cart changes

### Checkout Components

- [X] T043 [US1] Create CheckoutForm component
  - **File**: `frontend/components/forms/CheckoutForm.tsx`
  - **Depends on**: T016 (checkoutSchema), T009 (Order types)
  - **Props**: onSubmit(data), isLoading?: boolean
  - **Fields**:
    - Customer Name (required, min 3)
    - Phone (required, international format)
    - WhatsApp (required, checkbox "same as phone")
    - Email (optional)
    - Address (required, min 10, textarea)
    - City (required, min 2)
    - Country (optional)
    - Notes (optional, max 500, textarea)
    - Payment Method (radio: Easypaisa, Meezan Bank, International Bank)
  - **Validation**: Zod schema, inline errors
  - **Implementation**: React Hook Form + Zod resolver
  - **Acceptance**: All validations work, form submits

### Customer Pages

- [X] T044 [US1] Create Home page (featured products, categories)
  - **File**: `frontend/app/page.tsx`
  - **Depends on**: T038 (ProductGrid), T015 (API)
  - **Sections**:
    - Hero section (banner image, headline, CTA button)
    - Featured Products (bestsellers from API, limit 8)
    - Category Cards (grid linking to /products/[category])
  - **API Call**: productsApi.getBestsellers()
  - **Loading**: Skeleton for products section
  - **Acceptance**: Hero displays, products load, category links work

- [X] T045 [US1] Create Products listing page (with filters, search, pagination)
  - **File**: `frontend/app/products/page.tsx`
  - **Depends on**: T038 (ProductGrid), T039 (ProductFilter), T031 (Pagination), T015 (API)
  - **Features**:
    - ProductFilter sidebar
    - ProductGrid main area
    - Pagination at bottom
    - Search query from URL params
    - Filter state from URL params
  - **API Call**: productsApi.getProducts(filters) with pagination
  - **URL Params**: ?category=&search=&minPrice=&maxPrice=&size=&color=&page=
  - **Acceptance**: Filters update URL and results

- [X] T046 [US1] Create Category pages ([category]/page.tsx)
  - **File**: `frontend/app/products/[category]/page.tsx`
  - **Depends on**: T045 (Products page pattern)
  - **Props**: params.category from dynamic route
  - **Features**: Same as products page but pre-filtered by category
  - **Validation**: Redirect to /products if invalid category
  - **Metadata**: Dynamic title based on category name
  - **Acceptance**: Category filter applied automatically

- [X] T047 [US1] Create Product detail page (image gallery, add to cart)
  - **File**: `frontend/app/products/[id]/page.tsx`
  - **Depends on**: T040 (ImageGallery), T022 (useCart), T023 (useWishlist), T015 (API)
  - **Features**:
    - ImageGallery (left side)
    - Product info: name, price, description
    - Size selector (radio/buttons)
    - Color selector (radio/buttons with color swatches)
    - Quantity selector
    - Add to Cart button (disabled until size/color selected)
    - Add to Wishlist button (heart toggle)
    - Stock status display
  - **API Call**: productsApi.getProduct(id)
  - **Error**: Show 404 if product not found
  - **Acceptance**: Can select variants, add to cart

- [X] T048 [US1] Create Cart page (view items, update quantities)
  - **File**: `frontend/app/cart/page.tsx`
  - **Depends on**: T041 (CartItem), T042 (CartSummary), T022 (useCart)
  - **Features**:
    - List of CartItems
    - CartSummary sidebar
    - Empty cart state (message + link to products)
    - Continue shopping link
  - **Responsive**: Stack on mobile, side-by-side on desktop
  - **Acceptance**: Items display, quantities update, remove works

- [X] T049 [US1] Create Checkout page (form with validation)
  - **File**: `frontend/app/checkout/page.tsx`
  - **Depends on**: T043 (CheckoutForm), T022 (useCart), T015 (API)
  - **Features**:
    - Order summary (cart items, readonly)
    - CheckoutForm
    - Submit creates order via API
    - Redirect to /order-confirmation/[orderId] on success
    - Error handling for API failures
  - **Guard**: Redirect to /cart if cart empty
  - **API Call**: ordersApi.createOrder(data)
  - **On Success**: Clear cart, redirect to confirmation
  - **Acceptance**: Order created, cart cleared, redirect works

- [X] T050 [US1] Create Order confirmation page (Order ID, payment instructions)
  - **File**: `frontend/app/order-confirmation/[orderId]/page.tsx`
  - **Props**: params.orderId from dynamic route
  - **Features**:
    - Order ID displayed prominently
    - Order summary (items, quantities, total)
    - Payment instructions based on payment method:
      - Easypaisa: Account number, name, instructions
      - Meezan Bank: Account details, instructions
      - International Transfer: Bank details, SWIFT code
    - WhatsApp link to send payment screenshot
    - "How it works" steps
    - Print order button (optional)
  - **Data**: From query params or localStorage (temp storage)
  - **Acceptance**: Shows correct payment instructions, WhatsApp link works

**Checkpoint Phase 2**: Complete purchase flow works (US1 satisfied)

---

## Phase 3: Admin Panel - Core Features (P1)

**Goal**: Admin authentication, product CRUD, order management (User Stories 4, 5, 6, 9)

**Independent Test**: Login → Dashboard → Create Product → View Orders → Update Status → CSV Export

### Admin Login [US6]

- [X] T051 [US6] Create LoginForm component
  - **File**: `frontend/components/forms/LoginForm.tsx`
  - **Depends on**: T016 (loginSchema)
  - **Props**: onSubmit(credentials), isLoading?: boolean, error?: string
  - **Fields**: Email (required, valid), Password (required, min 6)
  - **Validation**: Zod schema, inline errors
  - **Features**: Show/hide password toggle, loading state
  - **Acceptance**: Form validates, submits credentials

- [X] T052 [US6] Create Admin login page
  - **File**: `frontend/app/admin/login/page.tsx`
  - **Depends on**: T051 (LoginForm), T020 (AuthContext), T015 (API)
  - **Features**:
    - Centered login card
    - LoginForm
    - Error message for invalid credentials
    - Redirect to /admin/dashboard on success
  - **Guard**: Redirect to /admin/dashboard if already authenticated
  - **Acceptance**: Login stores JWT, redirects

- [X] T053 [US6] Create AdminSidebar component
  - **File**: `frontend/components/layout/AdminSidebar.tsx`
  - **Depends on**: T024 (useAuth)
  - **Features**:
    - Logo/brand
    - Navigation links:
      - Dashboard (/admin/dashboard)
      - Products (/admin/products)
      - Orders (/admin/orders)
      - Settings (/admin/settings)
    - Active link highlighting
    - Logout button
  - **Responsive**: Sidebar desktop, Sheet mobile
  - **Icons**: Lucide icons for each nav item
  - **Acceptance**: Navigation works, logout clears session

- [X] T054 [US6] Create Admin layout with sidebar
  - **File**: `frontend/app/admin/layout.tsx`
  - **Depends on**: T020 (AuthContext), T024 (useAuth), T053 (AdminSidebar)
  - **Features**:
    - AuthProvider wrapper
    - Auth check on mount
    - Redirect to /admin/login if not authenticated
    - Loading state during auth check
    - AdminSidebar
    - Main content area
  - **Acceptance**: All admin routes protected, redirect works

### Admin Dashboard [US9]

- [X] T055 [US9] Create Admin dashboard (analytics, stats)
  - **File**: `frontend/app/admin/dashboard/page.tsx`
  - **Depends on**: T015 (API)
  - **Features**:
    - Key metrics cards:
      - Total Orders (count)
      - Total Revenue (PKR formatted)
      - Pending Payments (count)
      - Orders Ready to Ship (count)
    - Orders by Status breakdown (cards or simple chart)
    - Recent Orders table (last 5-10)
  - **API Call**: adminApi.getDashboardAnalytics()
  - **Loading**: Skeleton cards
  - **Acceptance**: Metrics display from API

### Admin Products [US4]

- [X] T056 [US4] Create Products list page (/admin/products)
  - **File**: `frontend/app/admin/products/page.tsx`
  - **Depends on**: T015 (API), T031 (Pagination)
  - **Features**:
    - "Add New Product" button (links to /admin/products/new)
    - Products table:
      - Image thumbnail
      - Name
      - Category
      - Price (PKR)
      - Status (Active/Inactive badge)
      - Actions (Edit, View)
    - Pagination
    - Search/filter (optional)
  - **API Call**: adminApi.getProducts(page, filters)
  - **Acceptance**: Lists products, pagination works

- [X] T057 [US4] Create ProductForm component
  - **File**: `frontend/components/forms/ProductForm.tsx`
  - **Depends on**: T016 (productSchema), T008 (Product types), T018 (constants)
  - **Props**: initialData?: Product, onSubmit(data), isLoading?: boolean
  - **Fields**:
    - Name (required, 3-255 chars)
    - Description (required, 10-2000 chars, textarea)
    - Price (required, 0-1,000,000)
    - Category (required, select from CATEGORIES)
    - Sizes (required, multi-select checkboxes)
    - Colors (required, multi-input)
    - Is Bestseller (checkbox)
    - Is Active (checkbox)
    - Images (file upload, 1-10 images, preview thumbnails)
  - **Validation**: Zod schema
  - **Acceptance**: All fields validate, image previews work

- [X] T058 [US4] Create Add product page (/admin/products/new with image upload)
  - **File**: `frontend/app/admin/products/new/page.tsx`
  - **Depends on**: T057 (ProductForm), T015 (API)
  - **Flow**:
    1. Submit product data (creates product)
    2. Upload images (associates with product)
    3. Redirect to /admin/products on success
  - **Error Handling**: Show errors, preserve form data
  - **Acceptance**: Product created with images

- [X] T059 [US4] Create Edit product page (/admin/products/[id]/edit)
  - **File**: `frontend/app/admin/products/[id]/edit/page.tsx`
  - **Depends on**: T057 (ProductForm), T015 (API)
  - **Features**:
    - Pre-populate form with existing data
    - Existing images with remove option
    - Add new images
    - Save updates
    - Delete product button (confirmation dialog)
  - **API Calls**: getProduct, updateProduct, uploadImages, deleteProduct
  - **Acceptance**: Edits save, images upload, delete works

### Admin Orders [US5]

- [X] T060 [US5] Create Orders list page (/admin/orders with filters)
  - **File**: `frontend/app/admin/orders/page.tsx`
  - **Depends on**: T015 (API), T031 (Pagination)
  - **Features**:
    - Filters:
      - Payment Status (All, Pending, Paid, Verified)
      - Order Status (All, Received, Processing, Ready, Delivered, Cancelled)
      - Date range (optional)
    - Orders table:
      - Order ID
      - Customer Name
      - Phone
      - Total (PKR)
      - Payment Status (badge)
      - Order Status (badge)
      - Date
      - Actions (View)
    - Pagination
    - "Export CSV" button
  - **API Calls**: adminApi.getOrders(filters), adminApi.exportOrdersCSV()
  - **CSV Export**: Downloads file directly
  - **Acceptance**: Filters work, CSV downloads

- [X] T061 [US5] Create Order detail page (/admin/orders/[id] with status update)
  - **File**: `frontend/app/admin/orders/[id]/page.tsx`
  - **Depends on**: T015 (API)
  - **Features**:
    - Order header (Order ID, date)
    - Customer info (name, phone, WhatsApp, email, address, city, country)
    - Order items table (product, size, color, quantity, price, line total)
    - Order total
    - Status update section:
      - Payment Status dropdown
      - Order Status dropdown
      - Delivery Status dropdown
      - Estimated Delivery date picker
      - Tracking Notes textarea
      - Save Changes button
    - Back to Orders link
  - **API Call**: adminApi.updateOrderStatus(id, data)
  - **Acceptance**: Status updates save

- [X] T062 [US5] Add CSV export functionality
  - **File**: `frontend/app/admin/orders/page.tsx` (update T060)
  - **Implementation**: Button calls adminApi.exportOrdersCSV(currentFilters)
  - **Features**: Downloads CSV with current filter criteria applied
  - **Acceptance**: CSV file downloads with order data

**Checkpoint Phase 3**: Admin panel complete (US4, US5, US6, US9 satisfied)

---

## Phase 4: Secondary Features (P2)

**Goal**: Order tracking and enhanced search/filter (User Stories 2, 7)

### Order Tracking [US2]

- [X] T063 [US2] Create Order tracking page (Order ID + Phone input)
  - **File**: `frontend/app/track-order/page.tsx`
  - **Depends on**: T015 (API), T016 (trackOrderSchema)
  - **Features**:
    - TrackOrderForm:
      - Order ID input (required, BQ-YYYYMMDD-XXX format)
      - Phone input (required, 10-15 digits)
      - Track button
    - Results section (hidden until search):
      - Order ID, Date
      - Order Status (visual progress indicator)
      - Payment Status
      - Delivery Status
      - Estimated Delivery (if available)
      - Tracking Notes (if available)
      - Order items summary
    - Error state: "Order not found" (generic message)
  - **API Call**: ordersApi.trackOrder(orderId, phone)
  - **Acceptance**: Valid combination shows status, invalid shows error

### Search Functionality [US7]

- [X] T064 [US7] Enhance SearchBar component (already created in T032)
  - **File**: `frontend/components/common/SearchBar.tsx` (update)
  - **Enhancements**:
    - 300ms debounce (if not already)
    - Loading indicator while searching
    - Clear button (X icon)
    - Search on Enter key
    - URL update without page reload
  - **Acceptance**: Debounce works, UX improved

### Filter Functionality [US7]

- [X] T065 [US7] Enhance ProductFilter (price, size, color)
  - **File**: `frontend/components/product/ProductFilter.tsx` (update T039)
  - **Enhancements**:
    - Filter state synced to URL params
    - URL changes update filter UI
    - "Clear All" resets URL params
    - Filter count badge
    - Collapsible sections (Accordion)
  - **Acceptance**: Filters persist in URL, shareable links work

### Admin Settings

- [X] T066 Create Admin settings page
  - **File**: `frontend/app/admin/settings/page.tsx`
  - **Depends on**: T024 (useAuth)
  - **Features**:
    - Change Password form:
      - Current Password
      - New Password
      - Confirm New Password
    - Validation: passwords match, min 6 chars
    - Success/error messages
  - **Note**: Backend endpoint may need verification
  - **Acceptance**: Password change works (if endpoint exists)

**Checkpoint Phase 4**: Order tracking works, search/filter enhanced

---

## Phase 5: Nice-to-Have Features (P3)

**Goal**: Wishlist page and informational pages (User Stories 3, 8)

### Wishlist [US3]

- [X] T067 [US3] Create Wishlist page
  - **File**: `frontend/app/wishlist/page.tsx`
  - **Depends on**: T023 (useWishlist), T037 (ProductCard variant)
  - **Features**:
    - Grid of wishlisted products
    - Remove from wishlist button per item
    - Add to Cart button per item (navigate to product or quick add)
    - Empty state (message + link to products)
    - Wishlist count in header
  - **Acceptance**: Items display, remove works, empty state shows

### Informational Pages [US8] [P - Can run in parallel]

- [X] T068 [P] [US8] Create About Us page
  - **File**: `frontend/app/about/page.tsx`
  - **Features**:
    - Store description/story
    - Mission statement
    - Google Maps embed (iframe with store location)
  - **Content**: Static content
  - **Acceptance**: Content displays, map loads

- [X] T069 [P] [US8] Create Legal page (Privacy Policy + Terms of Service combined)
  - **File**: `frontend/app/legal/page.tsx`
  - **Features**:
    - Tabs component (Privacy Policy | Terms of Service)
    - Privacy Policy content
    - Terms of Service content
  - **Implementation**: shadcn Tabs component
  - **Acceptance**: Tabs switch content

- [X] T070 [P] [US8] Create Support page (FAQ + Contact form combined)
  - **File**: `frontend/app/support/page.tsx`
  - **Depends on**: T016 (contactSchema)
  - **Features**:
    - FAQ section (Accordion with Q&A)
    - Contact information (phone, WhatsApp link, email)
    - Contact form (name, email, message)
  - **Implementation**: shadcn Accordion for FAQ
  - **Form**: React Hook Form + Zod
  - **Note**: Contact form shows success toast (no backend endpoint)
  - **Acceptance**: FAQ expands/collapses, form validates

- [X] T071 [P] [US8] Create ContactForm component
  - **File**: `frontend/components/forms/ContactForm.tsx`
  - **Depends on**: T016 (contactSchema)
  - **Props**: onSubmit(data), isLoading?: boolean
  - **Fields**: Name, Email, Message
  - **Validation**: Zod schema
  - **Acceptance**: Form validates and shows success on submit

**Checkpoint Phase 5**: Wishlist and info pages complete (US3, US8 satisfied)

---

## Phase 6: Testing & Polish

**Purpose**: Quality assurance, responsive testing, bug fixes

### Loading States [P]

- [X] T072 [P] Add loading states (LoadingSpinner usage across app)
  - **Files**: All pages with data fetching
  - **Implementation**: Loading skeleton or spinner during API calls
  - **Acceptance**: All pages show loading state

### Error Messages [P]

- [X] T073 [P] Add error messages (ErrorMessage usage)
  - **Files**: All pages with API calls
  - **Implementation**: User-friendly error messages with retry
  - **Acceptance**: Errors display nicely, retry works

### Toast Notifications

- [X] T074 Add toast notifications
  - **Files**: Multiple components
  - **Add toasts for**:
    - Add to cart success
    - Add to wishlist success
    - Remove from cart/wishlist
    - Order created success
    - Login success/failure
    - Product saved success
    - Order status updated success
    - Form validation errors
    - API errors
  - **Acceptance**: Toasts appear for all major actions

### Responsive Design Testing

- [X] T075 Test responsive design (mobile, tablet, desktop)
  - **Test at**:
    - 320px (mobile small)
    - 375px (mobile)
    - 768px (tablet)
    - 1024px (desktop)
    - 1440px (large desktop)
  - **Pages**: All customer and admin pages
  - **Verify**: No horizontal scroll, touch targets adequate, navigation works
  - **Fix**: Any layout issues found
  - **Acceptance**: All pages responsive

### Form Validations Testing

- [X] T076 Test form validations
  - **Test Cases**:
    - Phone with country code (+92 3001234567)
    - Phone without country code (03001234567)
    - International phone (+1 555 123 4567)
    - Invalid email formats
    - Empty required fields
    - Max length fields
    - Invalid Order ID format
  - **Forms**: Checkout, Login, Product, TrackOrder, Contact
  - **Fix**: Any validation issues
  - **Acceptance**: All validations work correctly

### API Integration Testing

- [X] T077 Test API integration
  - **Test**:
    - All API endpoints respond correctly
    - Error handling for 401, 404, 422, 500
    - Loading states during requests
    - Data displays correctly
  - **Fix**: Any integration issues
  - **Acceptance**: All API integrations work

### Cart/Wishlist Persistence Testing

- [X] T078 Test cart/wishlist persistence
  - **Test**:
    - Add items, close browser, reopen - items present
    - Clear localStorage - app handles gracefully
    - localStorage disabled - graceful degradation
  - **Fix**: Any persistence issues
  - **Acceptance**: Data persists correctly

### Admin Authentication Testing

- [X] T079 Test admin authentication
  - **Test**:
    - Login with valid credentials
    - Login with invalid credentials (error shown)
    - Access admin route when not logged in (redirect)
    - Session expiry handling
    - Logout clears session
    - Close browser, reopen - session persists (within validity)
  - **Fix**: Any auth flow issues
  - **Acceptance**: Auth works correctly

### Bug Fixes

- [X] T080 Fix any bugs found during testing
  - **Process**: Document bugs, fix, verify
  - **Acceptance**: All critical bugs fixed

### Performance Optimization

- [X] T081 Optimize performance
  - **Check**:
    - All images use next/image
    - Cloudinary images configured
    - No unnecessary re-renders
    - Pages load under 3 seconds
    - Lazy loading where appropriate
  - **Fix**: Any performance issues
  - **Acceptance**: Pages load quickly

### Final Cleanup

- [X] T082 Code cleanup
  - **Check**:
    - No unused imports
    - No commented-out code
    - No console.log statements
    - No TypeScript any types without justification
    - Consistent code style
  - **Commands**: `npm run lint`, `npx tsc --noEmit`
  - **Fix**: Any cleanup needed
  - **Acceptance**: Code clean, no lint errors

- [X] T083 Verify no console errors
  - **Check**: All pages in development mode
  - **Fix**: Any console errors or warnings
  - **Acceptance**: Console clean during normal flows

**Checkpoint Phase 6**: All testing complete, app polished

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 0: Project Initialization
    ↓ (BLOCKING)
Phase 1: Core Infrastructure
    ↓ (BLOCKING)
    ├── Phase 2: Customer Pages (P1) ←→ Phase 3: Admin Panel (P1)
    │   (Can run in parallel if team capacity allows)
    ↓
Phase 4: Secondary Features (P2)
    ↓
Phase 5: Nice-to-Have Features (P3)
    ↓
Phase 6: Testing & Polish
```

### User Story Dependencies

| User Story | Phase | Depends On | Priority |
|------------|-------|------------|----------|
| US1 Browse & Purchase | Phase 2 | Phase 1 | P1 |
| US6 Admin Auth | Phase 3 | Phase 1 | P1 |
| US4 Admin Products | Phase 3 | US6 | P1 |
| US5 Admin Orders | Phase 3 | US6 | P1 |
| US9 Admin Dashboard | Phase 3 | US6 | P2 |
| US2 Order Tracking | Phase 4 | Phase 1 | P2 |
| US7 Search/Filter | Phase 4 | US1 (partial) | P2 |
| US3 Wishlist | Phase 5 | Phase 1 | P3 |
| US8 Store Info | Phase 5 | Phase 1 | P3 |

### Parallel Opportunities by Phase

**Phase 0**: T003, T004, T005, T007 (after T001-T002)

**Phase 1**:
- Types: T008-T014 (all parallel)
- Utils: T017-T018 (parallel)
- Hooks: T022-T024 (parallel after contexts)
- Common: T029-T035 (parallel)

**Phase 2**:
- Product Components: T037-T040 (parallel)
- Cart Components: T041-T042 (parallel)

**Phase 3**:
- Admin Products & Orders can overlap after auth is done

**Phase 5**:
- Info Pages: T068-T071 (all parallel)

**Phase 6**:
- T072-T073, T074 (parallel)

---

## Task Summary

| Phase | Description | Task Count | Parallel |
|-------|-------------|------------|----------|
| 0 | Project Initialization | 7 | 1 |
| 1 | Core Infrastructure | 29 | 19 |
| 2 | Customer Pages (P1) | 14 | 8 |
| 3 | Admin Panel (P1) | 12 | 1 |
| 4 | Secondary Features (P2) | 4 | 0 |
| 5 | Nice-to-Have (P3) | 5 | 4 |
| 6 | Testing & Polish | 12 | 4 |
| **Total** | | **83** | **37** |

---

## Success Criteria Mapping

| Criteria | Verification Task |
|----------|-------------------|
| SC-001: Checkout in <5 min | T049 (Checkout flow) |
| SC-002: Pages load <3s | T081 (Performance) |
| SC-003: 95% successful add-to-cart | T047, T074 (Product detail, toasts) |
| SC-004: Tracking <2s response | T063 (Track order) |
| SC-005: Cart/wishlist persistence | T078 (Persistence test) |
| SC-006: Validation <500ms | T016, T076 (Schemas, form tests) |
| SC-007: Admin login <3s | T052 (Admin login) |
| SC-008: Product creation <3 min | T058 (Add product) |
| SC-009: Status update ≤2 clicks | T061 (Order detail) |
| SC-010: CSV export <5s | T062 (CSV export) |
| SC-011: Responsive design | T075 (Responsive test) |
| SC-012: No console errors | T083 (Console check) |
| SC-013: Admin route protection | T054, T079 (Auth layout, test) |

---

## Notes

- **[P]** = Can run in parallel (different files, no dependencies)
- **[US#]** = Maps to User Story for traceability
- Payment: Easypaisa/Meezan Bank/International Bank + WhatsApp verification (NO COD per constitution)
- Backend API assumed running at http://localhost:8000
- Manual testing only for Phase 1 (automated tests deferred)
- Commit after each task or logical group
