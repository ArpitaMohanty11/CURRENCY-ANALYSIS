from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from backend.schemas.auth import (
    Token, UserRegister, UserLogin, UserResponse,
    UserPreferencesUpdate, UserPreferencesResponse, GoogleAuthRequest
)
from backend.services.auth_service import auth_service
from backend.repositories.user_repo import user_repo
from backend.middleware.auth_middleware import get_current_user
from backend.repositories.admin_repo import admin_repo
from backend.config.settings import settings

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


@router.post("/google", response_model=Token)
async def google_auth(payload: GoogleAuthRequest):
    """Exchange a Supabase Google OAuth access token for an app JWT."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google authentication is not configured on this server."
        )
    try:
        from supabase import create_client
        admin_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)
        user_response = admin_client.auth.get_user(payload.access_token)
        google_user = user_response.user

        if not google_user or not google_user.email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token.")

        email = google_user.email.lower().strip()
        full_name = (
            google_user.user_metadata.get("full_name")
            or google_user.user_metadata.get("name")
            or email.split("@")[0]
        )

        # Find or auto-create the user in the app's DB
        user = user_repo.get_by_email(email)
        if not user:
            user = user_repo.create_user(
                email=email,
                hashed_password="",   # OAuth users have no password
                full_name=full_name,
                role="trader"
            )

        if not user.get("is_active", True):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled.")

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
        admin_repo.log_audit("USER_LOGIN_GOOGLE", "USER", user["id"], user["id"], details={"email": email})
        return Token(access_token=token, user=user_res)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google authentication failed. Please try again."
        )
