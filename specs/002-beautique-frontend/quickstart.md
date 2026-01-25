# Quickstart: Beautique Store Frontend

**Feature Branch**: `002-beautique-frontend`
**Created**: 2026-01-19

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm or pnpm
- Backend API running at http://localhost:8000

## Project Initialization

### 1. Create Next.js Project

```bash
# From repository root
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

cd frontend
```

**Options selected**:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes
- src/ directory: No (use app/ at root)
- Import alias: @/*

### 2. Install Dependencies

```bash
# Core dependencies
npm install zod react-hook-form @hookform/resolvers lucide-react clsx tailwind-merge

# shadcn/ui CLI
npx shadcn-ui@latest init
```

**shadcn/ui init options**:
- Style: Default
- Base color: Slate
- CSS variables: Yes

### 3. Add shadcn/ui Components

```bash
npx shadcn-ui@latest add button input label card select dialog toast table tabs accordion badge separator dropdown-menu sheet skeleton textarea form
```

### 4. Configure Environment

Create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5. Configure Next.js for Cloudinary Images

Update `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

module.exports = nextConfig;
```

## Project Structure

After setup, create the following structure:

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home page
│   ├── loading.tsx             # Global loading UI
│   ├── error.tsx               # Global error UI
│   ├── not-found.tsx           # 404 page
│   ├── products/
│   │   ├── page.tsx            # All products
│   │   ├── [category]/page.tsx # Category pages
│   │   └── [id]/page.tsx       # Product detail
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── order-confirmation/[orderId]/page.tsx
│   ├── track-order/page.tsx
│   ├── wishlist/page.tsx
│   ├── about/page.tsx
│   ├── legal/page.tsx          # Privacy + Terms (tabbed)
│   ├── support/page.tsx        # FAQ + Contact (combined)
│   └── admin/
│       ├── layout.tsx          # Admin layout with auth
│       ├── login/page.tsx
│       ├── dashboard/page.tsx
│       ├── products/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/edit/page.tsx
│       ├── orders/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── ui/                     # shadcn/ui components (auto-generated)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── AdminSidebar.tsx
│   ├── product/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductFilter.tsx
│   │   └── ImageGallery.tsx
│   ├── cart/
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   ├── forms/
│   │   ├── CheckoutForm.tsx
│   │   ├── LoginForm.tsx
│   │   ├── ProductForm.tsx
│   │   └── ContactForm.tsx
│   └── common/
│       ├── SearchBar.tsx
│       ├── Pagination.tsx
│       ├── LoadingSpinner.tsx
│       └── ErrorMessage.tsx
├── context/
│   ├── CartContext.tsx
│   ├── WishlistContext.tsx
│   └── AuthContext.tsx
├── hooks/
│   ├── useCart.ts
│   ├── useWishlist.ts
│   ├── useAuth.ts
│   └── useApiError.ts
├── lib/
│   ├── api.ts                  # API client
│   ├── validation.ts           # Zod schemas
│   ├── utils.ts                # Helper functions (cn, formatPrice, etc.)
│   └── constants.ts            # Categories, payment methods, etc.
├── types/
│   ├── product.ts
│   ├── order.ts
│   ├── admin.ts
│   ├── cart.ts
│   ├── wishlist.ts
│   └── api.ts
└── public/
    ├── images/
    │   └── logo.svg
    └── icons/
```

## Essential Files to Create First

### 1. lib/utils.ts

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
```

### 2. lib/constants.ts

```typescript
export const PRODUCT_CATEGORIES = [
  'Maxi',
  'Lehanga Choli',
  'Long Shirt',
  'Shalwar Kameez',
  'Gharara',
] as const;

export const PRODUCT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;

export const PAYMENT_METHODS = [
  'Easypaisa',
  'Meezan Bank',
  'International Bank',
] as const;

export const PAYMENT_DETAILS = {
  'Easypaisa': {
    title: 'Easypaisa',
    account: '03XX-XXXXXXX',
    name: 'Beautique Store',
    instructions: 'Send payment to this Easypaisa number',
  },
  'Meezan Bank': {
    title: 'Meezan Bank Transfer',
    account: 'XXXX-XXXXXXXXXX',
    name: 'Beautique Store',
    instructions: 'Transfer to this Meezan Bank account',
  },
  'International Bank': {
    title: 'International Wire Transfer',
    iban: 'PK00MEZN0000000000000000',
    swift: 'MEZNPKKAXXX',
    name: 'Beautique Store',
    instructions: 'Use these details for international transfer',
  },
};

export const STORAGE_KEYS = {
  CART: 'beautique_cart',
  WISHLIST: 'beautique_wishlist',
  ADMIN_TOKEN: 'admin_token',
} as const;

export const WHATSAPP_NUMBER = '+923XXXXXXXXX'; // Store WhatsApp number
```

### 3. Root Layout (app/layout.tsx)

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Beautique Store - Traditional Pakistani Fashion',
  description: 'Shop beautiful maxi dresses, lehanga choli, and traditional Pakistani clothing.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <WishlistProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

## Verification Checklist

After setup, verify:

- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 shows Next.js page
- [ ] shadcn/ui components are available in `components/ui/`
- [ ] Tailwind CSS is working (test with a class like `bg-red-500`)
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] Environment variables are loaded (`console.log(process.env.NEXT_PUBLIC_API_URL)`)

## Backend Dependency

The frontend requires the backend API to be running for:
- Product data
- Category list
- Order creation
- Order tracking
- Admin authentication
- Admin operations

Start the backend first:
```bash
cd backend
python -m uvicorn main:app --reload
```

Then start the frontend:
```bash
cd frontend
npm run dev
```

## Next Steps

After project initialization:

1. Create type definitions (`types/*.ts`)
2. Implement API client (`lib/api.ts`)
3. Set up context providers (`context/*.tsx`)
4. Build layout components (Navbar, Footer)
5. Implement home page
6. Build product listing and detail pages
7. Implement cart functionality
8. Build checkout flow
9. Implement admin panel
