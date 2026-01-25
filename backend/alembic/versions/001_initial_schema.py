"""Initial schema for products, orders, and admin_users tables.

Revision ID: 001
Revises:
Create Date: 2026-01-18

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create product_category enum
    product_category = postgresql.ENUM(
        'Maxi', 'Lehanga Choli', 'Long Shirt', 'Shalwar Kameez', 'Gharara',
        name='product_category'
    )
    product_category.create(op.get_bind(), checkfirst=True)

    # Create payment_method enum
    payment_method = postgresql.ENUM(
        'Easypaisa', 'Meezan Bank', 'International Bank',
        name='payment_method'
    )
    payment_method.create(op.get_bind(), checkfirst=True)

    # Create payment_status enum
    payment_status = postgresql.ENUM(
        'Pending', 'Paid', 'Verified',
        name='payment_status'
    )
    payment_status.create(op.get_bind(), checkfirst=True)

    # Create order_status enum
    order_status = postgresql.ENUM(
        'Received', 'Processing', 'Ready', 'Delivered', 'Cancelled',
        name='order_status'
    )
    order_status.create(op.get_bind(), checkfirst=True)

    # Create delivery_status enum
    delivery_status = postgresql.ENUM(
        'Not Started', 'In Progress', 'Out for Delivery', 'Delivered',
        name='delivery_status'
    )
    delivery_status.create(op.get_bind(), checkfirst=True)

    # Create products table
    op.create_table(
        'products',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('category', sa.Enum('Maxi', 'Lehanga Choli', 'Long Shirt', 'Shalwar Kameez', 'Gharara', name='product_category'), nullable=False),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('images', postgresql.JSONB(), nullable=False, server_default='[]'),
        sa.Column('sizes', postgresql.JSONB(), nullable=False, server_default='[]'),
        sa.Column('colors', postgresql.JSONB(), nullable=False, server_default='[]'),
        sa.Column('is_bestseller', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create product indexes
    op.create_index('idx_product_id', 'products', ['id'])
    op.create_index('idx_product_category', 'products', ['category'])
    op.create_index('idx_product_is_active', 'products', ['is_active'])
    op.create_index('idx_product_is_bestseller', 'products', ['is_bestseller'])
    op.create_index('idx_product_price', 'products', ['price'])
    op.create_index('idx_product_created_at', 'products', ['created_at'])

    # Create orders table
    op.create_table(
        'orders',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('order_id', sa.String(50), unique=True, nullable=False),
        sa.Column('customer_name', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(20), nullable=False),
        sa.Column('whatsapp', sa.String(20), nullable=False),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('address', sa.Text(), nullable=False),
        sa.Column('city', sa.String(100), nullable=False),
        sa.Column('country', sa.String(100), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('items', postgresql.JSONB(), nullable=False),
        sa.Column('total_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('payment_method', sa.Enum('Easypaisa', 'Meezan Bank', 'International Bank', name='payment_method'), nullable=False),
        sa.Column('payment_status', sa.Enum('Pending', 'Paid', 'Verified', name='payment_status'), nullable=False, server_default='Pending'),
        sa.Column('order_status', sa.Enum('Received', 'Processing', 'Ready', 'Delivered', 'Cancelled', name='order_status'), nullable=False, server_default='Received'),
        sa.Column('delivery_status', sa.Enum('Not Started', 'In Progress', 'Out for Delivery', 'Delivered', name='delivery_status'), nullable=False, server_default='Not Started'),
        sa.Column('estimated_delivery', sa.Date(), nullable=True),
        sa.Column('tracking_notes', sa.Text(), nullable=True),
        sa.Column('order_date', sa.Date(), server_default=sa.func.current_date(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Create order indexes
    op.create_index('idx_order_id', 'orders', ['id'])
    op.create_index('idx_order_order_id', 'orders', ['order_id'])
    op.create_index('idx_order_phone', 'orders', ['phone'])
    op.create_index('idx_order_payment_status', 'orders', ['payment_status'])
    op.create_index('idx_order_order_status', 'orders', ['order_status'])
    op.create_index('idx_order_created_at', 'orders', ['created_at'])

    # Create admin_users table
    op.create_table(
        'admin_users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('username', sa.String(100), unique=True, nullable=False),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, server_default='admin'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
    )

    # Create admin indexes
    op.create_index('idx_admin_id', 'admin_users', ['id'])
    op.create_index('idx_admin_username', 'admin_users', ['username'])
    op.create_index('idx_admin_email', 'admin_users', ['email'])


def downgrade() -> None:
    # Drop tables
    op.drop_table('admin_users')
    op.drop_table('orders')
    op.drop_table('products')

    # Drop enums
    op.execute('DROP TYPE IF EXISTS delivery_status')
    op.execute('DROP TYPE IF EXISTS order_status')
    op.execute('DROP TYPE IF EXISTS payment_status')
    op.execute('DROP TYPE IF EXISTS payment_method')
    op.execute('DROP TYPE IF EXISTS product_category')
