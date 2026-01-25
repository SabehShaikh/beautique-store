# Quickstart: Beautique Store Backend API

**Feature Branch**: `001-backend-api`
**Date**: 2026-01-18

## Prerequisites

- Python 3.11+
- PostgreSQL database (Neon recommended)
- Cloudinary account (free tier)
- Git

## Quick Setup

### 1. Clone and Setup Environment

```bash
# Clone repository
git clone <repository-url>
cd beautique-store

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 2. Configure Environment Variables

Create `backend/.env` file:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql+asyncpg://username:password@host/database?sslmode=require

# JWT Authentication
JWT_SECRET=your-64-character-random-string-here-generate-with-openssl-rand

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://your-vercel-domain.vercel.app

# Environment
ENVIRONMENT=development
```

**Generate JWT Secret**:
```bash
openssl rand -hex 32
```

### 3. Run Database Migrations

```bash
cd backend

# Create initial migration (if not exists)
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head
```

### 4. Seed Admin User

```bash
python scripts/seed_admin.py
```

Default credentials:
- Username: `admin`
- Password: Set via `ADMIN_PASSWORD` environment variable

### 5. Start Development Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API available at: http://localhost:8000

## Verification Steps

### 1. Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy", "timestamp": "2026-01-18T12:00:00Z"}
```

### 2. View API Documentation

Open in browser: http://localhost:8000/docs

### 3. Test Product Endpoints

```bash
# List products (should return empty array initially)
curl http://localhost:8000/api/products

# List categories
curl http://localhost:8000/api/categories
```

### 4. Test Admin Login

```bash
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-password"}'
```

Expected response:
```json
{
  "access_token": "eyJhbG...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

### 5. Test Protected Endpoint

```bash
# Use token from login response
curl http://localhost:8000/api/admin/orders \
  -H "Authorization: Bearer eyJhbG..."
```

## Common Issues

### Database Connection Failed

**Error**: `Connection refused` or `SSL required`

**Solution**:
- Verify `DATABASE_URL` is correct
- For Neon, ensure `?sslmode=require` is in URL
- Check database is active in Neon dashboard

### Invalid JWT Token

**Error**: `401 Unauthorized`

**Solution**:
- Verify `JWT_SECRET` matches between login and request
- Token may be expired (24 hour lifetime)
- Re-login to get fresh token

### Cloudinary Upload Failed

**Error**: `Invalid API credentials`

**Solution**:
- Verify all three Cloudinary credentials are correct
- Check Cloudinary dashboard for API key status

### CORS Blocked

**Error**: `Access-Control-Allow-Origin` error in browser

**Solution**:
- Add frontend URL to `ALLOWED_ORIGINS`
- Restart server after changing environment variables

## Project Structure

```
backend/
├── main.py              # FastAPI app entry point
├── config.py            # Settings from environment
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
│   ├── cloudinary.py
│   ├── order_id.py
│   └── auth.py
├── middleware/          # Request middleware
│   └── auth.py
├── alembic/             # Database migrations
├── scripts/             # Utility scripts
│   └── seed_admin.py
├── alembic.ini
├── requirements.txt
└── .env.example
```

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/products | No | List products |
| GET | /api/products/{id} | No | Get product |
| GET | /api/categories | No | List categories |
| GET | /api/products/bestsellers | No | Get bestsellers |
| POST | /api/orders | No | Create order |
| GET | /api/orders/track | No | Track order |
| POST | /api/admin/login | No | Admin login |
| POST | /api/admin/products | JWT | Create product |
| PUT | /api/admin/products/{id} | JWT | Update product |
| DELETE | /api/admin/products/{id} | JWT | Delete product |
| POST | /api/admin/products/{id}/images | JWT | Upload images |
| GET | /api/admin/orders | JWT | List orders |
| GET | /api/admin/orders/{id} | JWT | Get order |
| PATCH | /api/admin/orders/{id}/status | JWT | Update status |
| GET | /api/admin/orders/export | JWT | Export CSV |
| GET | /api/admin/analytics/dashboard | JWT | Dashboard |
| GET | /health | No | Health check |

## Testing with Postman

1. Import OpenAPI spec from `specs/001-backend-api/contracts/openapi.yaml`
2. Set environment variable `base_url` to `http://localhost:8000`
3. Run "Admin Login" request first
4. Set `token` variable from response
5. Run other requests in order

## Deployment (Hugging Face Spaces)

1. Create new Space with Docker SDK
2. Add `Dockerfile`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/ .
RUN pip install -r requirements.txt
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
```
3. Add environment variables in Space settings
4. Push code to Space repository

## Next Steps

After backend is running:

1. Test all 16 endpoints with Postman
2. Verify Cloudinary image upload works
3. Test order creation and tracking flow
4. Proceed to frontend development (`/sp.specify frontend`)
