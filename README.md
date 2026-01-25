# Beautique Store

A modern, full-stack e-commerce platform for Pakistani fashion, built with Next.js 16 and FastAPI.

## Features

### Customer Features
- **Product Browsing** - Browse products by category (Maxi, Lehanga Choli, Long Shirt, Shalwar Kameez, Gharara)
- **Product Search** - Full-text search across products
- **Product Details** - Detailed product pages with image gallery, size/color selection
- **Shopping Cart** - Add to cart with size/color variants, quantity management
- **Wishlist** - Save favorite products for later
- **Order Placement** - Complete checkout with customer details
- **Order Tracking** - Track order status with order ID and phone number
- **Responsive Design** - Optimized for mobile, tablet, and desktop

### Admin Features
- **Dashboard** - Analytics overview with key metrics
- **Product Management** - Create, update, deactivate, and permanently delete products
- **Image Upload** - Cloudinary integration for product images
- **Order Management** - View and update order statuses
- **Order Export** - Export orders to CSV

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible UI components
- **Radix UI** - Headless UI primitives
- **Lucide Icons** - Beautiful icons

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Async ORM with asyncpg
- **PostgreSQL** - Neon serverless database
- **Pydantic** - Data validation and serialization
- **Cloudinary** - Image storage and optimization
- **JWT** - Secure admin authentication

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL database (or Neon account)
- Cloudinary account

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` (see `.env.example` for reference):
```env
DATABASE_URL=postgresql+asyncpg://user:password@host/database
JWT_SECRET_KEY=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Database Setup

Run Alembic migrations to set up the database schema:
```bash
cd backend
alembic upgrade head
```

Create an admin user:
```bash
python scripts/seed_admin.py
```

Run the server:
```bash
uvicorn main:app --reload
```

The backend API will be available at `http://localhost:8000`

## Project Structure

```
beautique-store/
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── cart/               # Shopping cart
│   │   ├── checkout/           # Checkout flow
│   │   ├── products/           # Product listing and details
│   │   ├── track-order/        # Order tracking
│   │   └── wishlist/           # Wishlist page
│   ├── components/             # React components
│   │   ├── common/             # Shared components
│   │   ├── forms/              # Form components
│   │   ├── layout/             # Layout components
│   │   ├── product/            # Product-specific components
│   │   └── ui/                 # shadcn/ui components
│   ├── context/                # React Context providers
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and API client
│   └── types/                  # TypeScript types
│
└── backend/
    ├── main.py                 # FastAPI application entry
    ├── config.py               # Configuration management
    ├── database.py             # Database configuration
    ├── models/                 # SQLAlchemy models
    ├── schemas/                # Pydantic schemas
    ├── routes/                 # API routes
    │   ├── products.py         # Public product endpoints
    │   ├── orders.py           # Order endpoints
    │   └── admin/              # Protected admin endpoints
    ├── middleware/             # Auth middleware
    ├── services/               # Business logic services
    ├── alembic/                # Database migrations
    └── scripts/                # Utility scripts
```

## API Endpoints

### Public Endpoints
- `GET /api/products` - List products with filters
- `GET /api/products/{id}` - Get product details
- `GET /api/products/bestsellers` - Get bestseller products
- `GET /api/categories` - List all categories
- `POST /api/orders` - Create new order
- `GET /api/orders/track` - Track order by ID and phone

### Admin Endpoints (Protected)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard` - Dashboard analytics
- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/{id}` - Update product
- `DELETE /api/admin/products/{id}` - Soft delete (deactivate)
- `DELETE /api/admin/products/{id}/permanent` - Permanent delete
- `POST /api/admin/products/{id}/images` - Upload images
- `GET /api/admin/orders` - List orders
- `PATCH /api/admin/orders/{id}/status` - Update order status

## Environment Variables

### Frontend (.env.local)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (asyncpg) |
| `JWT_SECRET_KEY` | Secret key for JWT tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Running Both Services

To run both frontend and backend simultaneously:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## License

MIT License - feel free to use this project for learning or commercial purposes.
