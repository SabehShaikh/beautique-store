# Research: Beautique Store Frontend - Phase 1

**Feature Branch**: `002-beautique-frontend`
**Created**: 2026-01-19
**Status**: Complete

## Executive Summary

This document consolidates research findings for the Beautique Store Frontend Phase 1 implementation. All technology decisions align with the project constitution and leverage established patterns for Next.js 16 App Router development.

---

## 1. Next.js 16 App Router Patterns

### Decision: App Router with Server/Client Component Architecture

**Rationale**: Next.js 16 (current stable: 15.x with 16 features) uses React 19 and the App Router as the default pattern. Server Components provide better performance for data fetching, while Client Components handle interactivity.

**Key Patterns**:
- **Server Components (default)**: Use for pages that fetch data and render static content
- **Client Components ('use client')**: Use for components with React hooks, event handlers, browser APIs
- **Parallel Routes**: For admin layouts with sidebar navigation
- **Dynamic Routes**: `[category]`, `[id]`, `[orderId]` patterns for product/order pages

**Alternatives Considered**:
| Option | Rejected Because |
|--------|-----------------|
| Pages Router | Legacy, lacks Server Components, constitution mandates App Router |
| Static Site Generation only | Requires dynamic data from backend API |

**Implementation**:
```
app/
├── layout.tsx          # Root layout (Server Component - wraps with providers)
├── page.tsx            # Home (Server Component - fetches featured products)
├── products/
│   ├── page.tsx        # Products list (Server Component with client filters)
│   ├── [category]/page.tsx  # Category filter (Server Component)
│   └── [id]/page.tsx   # Product detail (Server Component)
├── cart/page.tsx       # Client Component (localStorage access)
├── checkout/page.tsx   # Client Component (form handling)
└── admin/
    ├── layout.tsx      # Admin layout with auth check (Client Component)
    └── ...
```

---

## 2. State Management Approach

### Decision: React Context API + localStorage for Client State

**Rationale**: Constitution mandates localStorage for cart/wishlist persistence. Context API provides sufficient state management without adding dependencies. No need for Redux/Zustand for this scope.

**State Domains**:

| Domain | Storage | Mechanism | Scope |
|--------|---------|-----------|-------|
| Cart | localStorage | CartContext + useReducer | Global (customer) |
| Wishlist | localStorage | WishlistContext + useState | Global (customer) |
| Auth Token | localStorage | AuthContext | Admin panel |
| UI State (filters, pagination) | URL params | useSearchParams | Per-page |

**Cart Context Pattern**:
```typescript
// context/CartContext.tsx
'use client';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}
```

**Alternatives Considered**:
| Option | Rejected Because |
|--------|-----------------|
| Zustand | Extra dependency, Context sufficient for this scope |
| Redux Toolkit | Overkill for localStorage-based state |
| Server-side sessions | Constitution mandates localStorage, no customer auth |

---

## 3. Form Validation with Zod + React Hook Form

### Decision: React Hook Form with Zod Schema Validation

**Rationale**: Constitution requires form validation. React Hook Form provides excellent DX with minimal re-renders. Zod provides type-safe schema validation matching backend Pydantic schemas.

**Validation Schemas** (aligned with backend):
```typescript
// lib/validation.ts
import { z } from 'zod';

// Phone validation: 10-15 digits, international format
const phoneSchema = z.string().regex(
  /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/,
  'Invalid phone format'
).refine((val) => {
  const digits = val.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}, 'Phone must be 10-15 digits');

// Checkout form schema
export const checkoutSchema = z.object({
  customer_name: z.string().min(3, 'Name must be at least 3 characters'),
  phone: phoneSchema,
  whatsapp: phoneSchema,
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  country: z.string().optional(),
  notes: z.string().max(500).optional(),
  payment_method: z.enum(['Easypaisa', 'Meezan Bank', 'International Bank']),
});

// Admin login schema
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});
```

**Alternatives Considered**:
| Option | Rejected Because |
|--------|-----------------|
| Yup | Zod has better TypeScript inference |
| Formik | React Hook Form has better performance |
| Native HTML validation | Insufficient for complex rules |

---

## 4. API Client Architecture

### Decision: Native fetch with Custom Wrapper

**Rationale**: Next.js optimizes native fetch with caching and deduplication. A thin wrapper provides error handling without axios overhead.

**API Client Structure**:
```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiError {
  detail: string;
  status: number;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token for admin routes
  if (endpoint.startsWith('/admin') && typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw { detail: error.detail, status: response.status } as ApiError;
  }

  return response.json();
}

// Public endpoints
export const productsApi = {
  list: (params?: ProductListParams) =>
    apiRequest<ProductListResponse>(`/products?${new URLSearchParams(params)}`),
  get: (id: string) =>
    apiRequest<Product>(`/products/${id}`),
  bestsellers: (limit = 10) =>
    apiRequest<{ products: Product[] }>(`/products/bestsellers?limit=${limit}`),
};

export const ordersApi = {
  create: (data: OrderCreate) =>
    apiRequest<OrderResponse>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  track: (orderId: string, phone: string) =>
    apiRequest<OrderTracking>(`/orders/track?order_id=${orderId}&phone=${phone}`),
};

export const categoriesApi = {
  list: () => apiRequest<{ categories: string[] }>('/categories'),
};

// Admin endpoints
export const adminApi = {
  login: (credentials: AdminLogin) =>
    apiRequest<AdminLoginResponse>('/admin/login', { method: 'POST', body: JSON.stringify(credentials) }),
  products: {
    create: (data: ProductCreate) =>
      apiRequest<Product>('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: ProductUpdate) =>
      apiRequest<Product>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      apiRequest<{ message: string }>(`/admin/products/${id}`, { method: 'DELETE' }),
    uploadImages: (id: string, files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append('images', file));
      return apiRequest<{ images: string[] }>(`/admin/products/${id}/images`, {
        method: 'POST',
        body: formData,
        headers: {} // Let browser set Content-Type for FormData
      });
    },
  },
  orders: {
    list: (params?: OrderListParams) =>
      apiRequest<OrderListResponse>(`/admin/orders?${new URLSearchParams(params)}`),
    get: (id: string) =>
      apiRequest<OrderDetail>(`/admin/orders/${id}`),
    updateStatus: (id: string, data: OrderStatusUpdate) =>
      apiRequest<OrderDetail>(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
    export: (startDate?: string, endDate?: string) => {
      const params = new URLSearchParams();
      if (startDate) params.set('start_date', startDate);
      if (endDate) params.set('end_date', endDate);
      return `${API_BASE_URL}/api/admin/orders/export?${params}`;
    },
  },
  analytics: {
    dashboard: () => apiRequest<DashboardAnalytics>('/admin/analytics/dashboard'),
  },
};
```

**Alternatives Considered**:
| Option | Rejected Because |
|--------|-----------------|
| Axios | Extra dependency, fetch sufficient with Next.js optimizations |
| TanStack Query | Overkill for simple CRUD, adds complexity |
| SWR | Good option but native fetch patterns preferred |

---

## 5. UI Component Library

### Decision: shadcn/ui (Primary) + Custom Components

**Rationale**: Constitution specifies shadcn/ui as primary. It provides unstyled, accessible components that work with Tailwind CSS. No Material UI needed for Phase 1.

**Required shadcn/ui Components**:
```bash
# Installation commands
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input label card select dialog toast table tabs accordion badge separator dropdown-menu sheet skeleton
```

**Component Mapping**:
| Need | shadcn/ui Component |
|------|---------------------|
| Buttons | Button (variants: default, outline, ghost) |
| Forms | Input, Label, Select |
| Product cards | Card |
| Modals | Dialog |
| Notifications | Toast (via useToast) |
| Admin tables | Table |
| FAQ | Accordion |
| Status badges | Badge |
| Mobile nav | Sheet |
| Loading | Skeleton |
| Category dropdown | DropdownMenu |

**Custom Components Needed**:
- ProductCard (wraps Card with product-specific layout)
- ProductGrid (responsive grid with loading states)
- ProductFilter (sidebar with filter controls)
- CartItem (cart list item with quantity controls)
- Navbar (layout component)
- Footer (layout component)
- Pagination (numbered pagination)
- ImageGallery (product images with thumbnails)

**Alternatives Considered**:
| Option | Rejected Because |
|--------|-----------------|
| Material UI | Constitution specifies shadcn/ui as primary |
| Chakra UI | Different styling paradigm than Tailwind |
| Ant Design | Opinionated styling, harder to customize |

---

## 6. Image Handling

### Decision: Next.js Image with Cloudinary URLs

**Rationale**: Constitution requires fast loading with Next.js Image optimization. Backend handles Cloudinary uploads; frontend uses optimized URLs.

**Implementation**:
```typescript
// components/common/ProductImage.tsx
import Image from 'next/image';

interface ProductImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export function ProductImage({ src, alt, fill, width, height, priority, className }: ProductImageProps) {
  // Cloudinary URLs from backend
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      priority={priority}
      className={className}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
```

**Next.js Config for Cloudinary**:
```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};
```

---

## 7. Admin Authentication Flow

### Decision: JWT Token in localStorage with Route Protection

**Rationale**: Constitution mandates JWT for admin auth. localStorage is simpler than httpOnly cookies for Phase 1. Route protection via middleware and layout checks.

**Auth Flow**:
1. Admin submits credentials to `/api/admin/login`
2. Backend returns JWT token (24-hour expiry)
3. Frontend stores token in localStorage
4. Token sent in Authorization header for admin API calls
5. Admin layout checks for valid token on mount
6. Invalid/expired token redirects to login

**Auth Context**:
```typescript
// context/AuthContext.tsx
'use client';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token on mount
    const stored = localStorage.getItem('admin_token');
    if (stored) {
      // Optionally validate token hasn't expired
      setToken(stored);
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Admin Layout Protection**:
```typescript
// app/admin/layout.tsx
'use client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated && pathname !== '/admin/login') {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex min-h-screen">
      {pathname !== '/admin/login' && <AdminSidebar />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

---

## 8. Payment Workflow (Constitution Alignment)

### Decision: Manual Payment via WhatsApp - NO COD

**Rationale**: Constitution explicitly states "NO Cash on Delivery (COD) in Phase 1". Payment is verified manually via WhatsApp screenshot.

**Payment Methods** (from backend schema):
- Easypaisa
- Meezan Bank
- International Bank

**Order Flow**:
1. Customer fills checkout form with payment method selection
2. Order created with `payment_status: Pending`
3. Order confirmation shows:
   - Order ID (e.g., BQ-20260119-001)
   - Selected payment method bank details
   - WhatsApp link to send payment screenshot
   - Instructions for payment verification
4. Admin manually updates `payment_status` to Verified after receiving screenshot

**Payment Instructions Component**:
```typescript
// components/checkout/PaymentInstructions.tsx
const PAYMENT_DETAILS = {
  'Easypaisa': {
    account: '03XX-XXXXXXX',
    name: 'Beautique Store',
    instructions: 'Send payment to this Easypaisa number'
  },
  'Meezan Bank': {
    account: 'XXXX-XXXXXXXXXX',
    name: 'Beautique Store',
    instructions: 'Transfer to this Meezan Bank account'
  },
  'International Bank': {
    iban: 'PK00MEZN0000000000000000',
    swift: 'MEZNPKKAXXX',
    name: 'Beautique Store',
    instructions: 'International wire transfer details'
  },
};
```

**IMPORTANT**: The spec.md file mentions "Cash on Delivery payment instructions" which contradicts the constitution. The frontend implementation MUST follow the constitution (manual WhatsApp payment verification, NO COD).

---

## 9. Responsive Design Strategy

### Decision: Mobile-First with Tailwind Breakpoints

**Rationale**: Constitution requires mobile-responsive design for all pages.

**Breakpoints** (Tailwind defaults):
- `sm`: 640px (large phones)
- `md`: 768px (tablets)
- `lg`: 1024px (laptops)
- `xl`: 1280px (desktops)
- `2xl`: 1536px (large screens)

**Layout Patterns**:
```typescript
// Product grid responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

// Sidebar layout (desktop only)
<div className="flex">
  <aside className="hidden lg:block w-64">...</aside>
  <main className="flex-1">...</main>
</div>

// Mobile navigation
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" className="lg:hidden">
      <MenuIcon />
    </Button>
  </SheetTrigger>
  <SheetContent side="left">
    <MobileNav />
  </SheetContent>
</Sheet>
```

---

## 10. Error Handling Strategy

### Decision: Centralized Error Handling with User-Friendly Messages

**Rationale**: Constitution requires user-friendly error messages. Backend returns structured errors.

**Error Types from Backend**:
| Status | Backend Response | Frontend Display |
|--------|-----------------|------------------|
| 401 | `{"detail": "Invalid or expired token"}` | Redirect to login |
| 404 | `{"detail": "Product not found"}` | "Not found" page or message |
| 422 | `{"detail": [{"loc": [...], "msg": "..."}]}` | Form field errors |
| 500 | `{"detail": "Internal server error"}` | "Something went wrong" toast |

**Error Handling Hook**:
```typescript
// hooks/useApiError.ts
export function useApiError() {
  const { toast } = useToast();
  const router = useRouter();

  const handleError = (error: ApiError) => {
    switch (error.status) {
      case 401:
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
        toast({ title: 'Session expired', description: 'Please log in again', variant: 'destructive' });
        break;
      case 404:
        toast({ title: 'Not found', description: error.detail, variant: 'destructive' });
        break;
      case 422:
        // Validation errors handled by form
        break;
      default:
        toast({ title: 'Error', description: error.detail || 'Something went wrong', variant: 'destructive' });
    }
  };

  return { handleError };
}
```

---

## Summary of Technology Decisions

| Concern | Decision | Constitution Aligned |
|---------|----------|---------------------|
| Framework | Next.js 16 App Router | Yes (VI) |
| State Management | React Context + localStorage | Yes (III) |
| Form Validation | Zod + React Hook Form | Yes |
| API Client | Native fetch wrapper | Yes |
| UI Components | shadcn/ui | Yes (V) |
| Styling | Tailwind CSS | Yes (V) |
| Images | Next.js Image + Cloudinary | Yes (V) |
| Admin Auth | JWT in localStorage | Yes (III) |
| Payment | Manual WhatsApp (NO COD) | Yes (II) |
| TypeScript | Strict mode | Yes (VI) |

---

## Resolved Clarifications

| Item | Resolution |
|------|------------|
| Payment method | Manual WhatsApp verification (Easypaisa, Meezan Bank, International Bank) - NO COD |
| Order status states | Received, Processing, Ready, Delivered, Cancelled (from backend) |
| Payment status states | Pending, Paid, Verified (from backend) |
| Delivery status states | Not Started, In Progress, Out for Delivery, Delivered (from backend) |
| Product categories | Maxi, Lehanga Choli, Long Shirt, Shalwar Kameez, Gharara (from backend) |
| Product sizes | S, M, L, XL, XXL (from backend) |
| Admin auth storage | localStorage (simpler for Phase 1) |
| Spec COD reference | Constitution takes precedence - implement manual payment flow |
