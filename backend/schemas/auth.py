from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: Optional[str] = "trader"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserPreferencesUpdate(BaseModel):
    base_currency: Optional[str] = "USD"
    theme: Optional[str] = "dark"
    refresh_interval_seconds: Optional[int] = 15
    notification_email: Optional[bool] = True
    notification_in_app: Optional[bool] = True

class UserPreferencesResponse(BaseModel):
    base_currency: str = "USD"
    theme: str = "dark"
    refresh_interval_seconds: int = 15
    notification_email: bool = True
    notification_in_app: bool = True

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool = True
    created_at: datetime
    preferences: Optional[UserPreferencesResponse] = None

Token.model_rebuild()
