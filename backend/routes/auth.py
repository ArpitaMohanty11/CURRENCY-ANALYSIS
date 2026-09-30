from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from backend.schemas.auth import (
    Token, UserRegister, UserLogin, UserResponse,
    UserPreferencesUpdate, UserPreferencesResponse
)
from backend.services.auth_service import auth_service
from backend.repositories.user_repo import user_repo
from backend.middleware.auth_middleware import get_current_user
from backend.repositories.admin_repo import admin_repo

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
async def register(payload: UserRegister):
    try:
        user = auth_service.register_user(payload)
        token = auth_service.create_access_token(data={"sub": user["id"], "role": user["role"]})
        prefs = user_repo.get_preferences(user["id"])
        user_res = UserResponse(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            role=user["role"],
            is_active=user["is_active"],
            created_at=user["created_at"],
            preferences=UserPreferencesResponse(**prefs)
        )
        admin_repo.log_audit("USER_REGISTER", "USER", user["id"], user["id"], details={"email": user["email"]})
        return Token(access_token=token, user=user_res)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login", response_model=Token)
async def login(payload: UserLogin):
    user = auth_service.authenticate_user(payload)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")
    token = auth_service.create_access_token(data={"sub": user["id"], "role": user["role"]})
    prefs = user_repo.get_preferences(user["id"])
    user_res = UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        is_active=user["is_active"],
        created_at=user["created_at"],
        preferences=UserPreferencesResponse(**prefs)
    )
    admin_repo.log_audit("USER_LOGIN", "USER", user["id"], user["id"])
    return Token(access_token=token, user=user_res)

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(user: Dict[str, Any] = Depends(get_current_user)):
    prefs = user_repo.get_preferences(user["id"])
    return UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        is_active=user["is_active"],
        created_at=user["created_at"],
        preferences=UserPreferencesResponse(**prefs)
    )

@router.put("/preferences", response_model=UserPreferencesResponse)
async def update_preferences(
    payload: UserPreferencesUpdate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    updated = user_repo.update_preferences(user["id"], payload.model_dump())
    admin_repo.log_audit("UPDATE_PREFERENCES", "USER_PREFERENCES", user["id"], user["id"])
    return UserPreferencesResponse(**updated)
