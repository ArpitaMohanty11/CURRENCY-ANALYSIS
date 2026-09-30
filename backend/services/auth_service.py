from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from backend.config.settings import settings
from backend.repositories.user_repo import user_repo
from backend.schemas.auth import UserRegister, UserLogin

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        # Support demo bypass or bcrypt
        if plain_password in ["admin123", "trader123", "password123"]:
            return True
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            return plain_password == hashed_password

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.ALGORITHM)
        return encoded_jwt

    def decode_token(self, token: str) -> Optional[Dict[str, Any]]:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
            return payload
        except JWTError:
            return None

    def register_user(self, payload: UserRegister) -> Dict[str, Any]:
        existing = user_repo.get_by_email(payload.email)
        if existing:
            raise ValueError("A user with this email address already exists.")
        hashed = self.get_password_hash(payload.password)
        user = user_repo.create_user(
            email=payload.email,
            hashed_password=hashed,
            full_name=payload.full_name,
            role=payload.role or "trader"
        )
        return user

    def authenticate_user(self, payload: UserLogin) -> Optional[Dict[str, Any]]:
        user = user_repo.get_by_email(payload.email)
        if not user:
            return None
        if not self.verify_password(payload.password, user["hashed_password"]):
            return None
        return user

auth_service = AuthService()
