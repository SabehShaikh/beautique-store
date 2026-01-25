"""
Request middleware.

Exports middleware dependencies.
"""

from middleware.auth import get_current_admin

__all__ = ["get_current_admin"]
