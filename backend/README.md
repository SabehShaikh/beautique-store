# Beautique Store Backend API

RESTful API for Beautique Store e-commerce platform built with FastAPI, SQLAlchemy 2.0 (async), and PostgreSQL.

## Features

- **Product Management**: Browse, search, filter products by category/price
- **Order Processing**: Create orders, track by Order ID + phone verification
- **Admin Dashboard**: JWT-protected endpoints for managing products, orders, and analytics
- **Image Upload**: Cloudinary integration for product images
- **Manual Payment**: Status tracking for Easypaisa, Meezan Bank, International Bank

## Tech Stack

- **Framework**: FastAPI 0.109.0
- **ORM**: SQLAlchemy 2.0.25 (async)
- **Database**: PostgreSQL (Neon serverless)
- **Image Storage**: Cloudinary
- **Authentication**: JWT (python-jose)
- **Deployment**: Hugging Face Spaces (Docker)

## Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL database (Neon recommended)
- Cloudinary account (free tier)

### Setup

1. **Clone and create virtual environment**

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

3. **Configure environment**

```bash
cp .env.example .env
# Edit .env with your credentials
```

Required environment variables:

```env
DATABASE_URL=postgresql+asyncpg://user:pass@host/db?sslmode=require
JWT_SECRET=your-64-character-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ALLOWED_ORIGINS=http://localhost:3000
```

4. **Run database migrations**

```bash
alembic upgrade head
```

5. **Seed admin user**

```bash
python scripts/seed_admin.py
```

6. **Start development server**

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List products (filters: category, search, price) |
| GET | /api/products/{id} | Get product details |
| GET | /api/products/bestsellers | Get bestseller products |
| GET | /api/categories | List all categories |
| POST | /api/orders | Create new order |
| GET | /api/orders/track | Track order (Order ID + phone) |

### Admin Endpoints (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/admin/login | Admin login, returns JWT |
| POST | /api/admin/products | Create product |
| PUT | /api/admin/products/{id} | Update product |
| DELETE | /api/admin/products/{id} | Soft-delete product |
| POST | /api/admin/products/{id}/images | Upload images |
| GET | /api/admin/orders | List orders (filters) |
| GET | /api/admin/orders/{id} | Get order details |
| PATCH | /api/admin/orders/{id}/status | Update order status |
| GET | /api/admin/orders/export | Export orders CSV |
| GET | /api/admin/analytics/dashboard | Dashboard metrics |

## Project Structure

```
backend/
├── main.py              # FastAPI app entry point
├── config.py            # Pydantic settings
├── database.py          # SQLAlchemy async setup
├── models/              # SQLAlchemy models
│   ├── product.py
│   ├── order.py
│   └── admin.py
├── schemas/             # Pydantic schemas
│   ├── product.py
│   ├── order.py
│   └── admin.py
├── routes/              # API endpoints
│   ├── products.py
│   ├── orders.py
│   └── admin/
│       ├── auth.py
│       ├── products.py
│       ├── orders.py
│       └── analytics.py
├── services/            # Business logic
│   ├── auth.py
│   ├── cloudinary.py
│   └── order_id.py
├── middleware/          # Request middleware
│   └── auth.py
├── alembic/             # Database migrations
├── scripts/
│   └── seed_admin.py
├── requirements.txt
└── Dockerfile
```

## Deployment

### Hugging Face Spaces (Docker)

1. Create a new Space with Docker SDK
2. Add environment variables in Space settings
3. Push code to Space repository

The included `Dockerfile` configures the application for port 7860 (HF requirement).

### Environment Variables for Production

```env
ENVIRONMENT=production
DATABASE_URL=postgresql+asyncpg://...
JWT_SECRET=<64-char-random-string>
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

## Development

### Generate JWT Secret

```bash
openssl rand -hex 32
```

### Create New Migration

```bash
alembic revision --autogenerate -m "Description"
```

### Apply Migrations

```bash
alembic upgrade head
```

## License

MIT
