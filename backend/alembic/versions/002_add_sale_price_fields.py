"""Add regular_price and sale_price fields to products table.

Revision ID: 002
Revises: 001
Create Date: 2026-01-24

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)

    # Get existing columns in products table
    columns = [col['name'] for col in inspector.get_columns('products')]

    # Get existing indexes
    indexes = [idx['name'] for idx in inspector.get_indexes('products')]

    # Rename price column to regular_price if price exists
    if 'price' in columns and 'regular_price' not in columns:
        op.alter_column('products', 'price', new_column_name='regular_price')

    # Add sale_price column if it doesn't exist
    if 'sale_price' not in columns:
        op.add_column(
            'products',
            sa.Column('sale_price', sa.Numeric(10, 2), nullable=True)
        )

    # Drop old price index if it exists
    if 'idx_product_price' in indexes:
        op.drop_index('idx_product_price', table_name='products')

    # Create new index if it doesn't exist
    if 'idx_product_regular_price' not in indexes:
        op.create_index('idx_product_regular_price', 'products', ['regular_price'])


def downgrade() -> None:
    conn = op.get_bind()
    inspector = inspect(conn)

    # Get existing columns and indexes
    columns = [col['name'] for col in inspector.get_columns('products')]
    indexes = [idx['name'] for idx in inspector.get_indexes('products')]

    # Drop the new index if it exists
    if 'idx_product_regular_price' in indexes:
        op.drop_index('idx_product_regular_price', table_name='products')

    # Create the old price index if it doesn't exist
    if 'idx_product_price' not in indexes and 'regular_price' in columns:
        op.create_index('idx_product_price', 'products', ['regular_price'])

    # Rename regular_price back to price if regular_price exists
    if 'regular_price' in columns and 'price' not in columns:
        op.alter_column('products', 'regular_price', new_column_name='price')

    # Drop sale_price column if it exists
    if 'sale_price' in columns:
        op.drop_column('products', 'sale_price')
