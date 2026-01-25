"""
Authentication service for JWT tokens and password hashing.

Provides functions for:
- Password hashing (bcrypt, 12 rounds)
- Password verification
- JWT token creation
- JWT token verification
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from config import settings


# Password hashing context with bcrypt (12 rounds)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a plaintext password using bcrypt.

    Args:
        password: Plaintext password to hash.

    Returns:
        str: Bcrypt hashed password.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a hashed password.

    Args:
        plain_password: Plaintext password to verify.
        hashed_password: Bcrypt hashed password to compare.

    Returns:
        bool: True if passwords match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    data: dict[str, Any],
    expires_delta: timedelta | None = None,
) -> str:
    """
    Create a JWT access token.

    Args:
        data: Data to encode in the token (typically {"sub": user_id}).
        expires_delta: Optional custom expiration time. Defaults to JWT_EXPIRATION_HOURS.

    Returns:
        str: Encoded JWT token.
    """
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            hours=settings.jwt_expiration_hours
        )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )

    return encoded_jwt


def verify_token(token: str) -> dict[str, Any] | None:
    """
    Verify and decode a JWT token.

    Args:
        token: JWT token string to verify.

    Returns:
        dict | None: Decoded token payload if valid, None if invalid/expired.
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except JWTError:
        return None
