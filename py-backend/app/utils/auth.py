import os
from datetime import datetime, timedelta
from jose import jwt, ExpiredSignatureError, JWTError
from passlib.context import CryptContext
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# Load environment variables from a .env file (if present)
load_dotenv()

# Secret and algorithm for JWTs. In production set SECRET_KEY in env vars.
SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# OAuth2 scheme used by FastAPI to extract the bearer token from requests
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# Password hashing context configured to use bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a plaintext password using the configured password context.
    Returns the hashed password string (bcrypt).
    """
    # Encode as UTF-8 and truncate to 72 bytes
    password_bytes = password.encode("utf-8")[:72]
    return pwd_context.hash(password_bytes)



def verify_password(plain_password: str, hashed: str) -> bool:
    """
    Verify a plaintext password against a stored hashed password.
    Returns True if the password matches, False otherwise.
    """
    return pwd_context.verify(plain_password.encode("utf-8")[:72], hashed)


def create_access_token(data: dict) -> str:
    """
    Create a JWT access token with an expiration.
    - data: payload dictionary (should include e.g. {"sub": user_id})
    Returns the encoded JWT as a string.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str):
    """
    Verify the JWT token and check if it has expired.
    - token: The JWT token to verify.
    Returns the user ID if the token is valid and has not expired.
    Raises an HTTPException if the token is invalid or has expired.
    """
    try:
        # Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user_id
    except ExpiredSignatureError:
        # Token has expired
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except JWTError:
        # Token is invalid
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Dependency for FastAPI routes to extract and validate the current user
    from the Authorization: Bearer <token> header.

    - Decodes the JWT and returns the 'sub' claim (user id) if valid.
    - Raises HTTPException(401) if token is invalid or missing required data.
    """
    return verify_token(token)