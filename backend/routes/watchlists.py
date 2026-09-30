from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from backend.schemas.watchlist import (
    WatchlistResponse, WatchlistCreate, WatchlistUpdate,
    WatchlistItemResponse, WatchlistItemCreate
)
from backend.services.watchlist_service import watchlist_service
from backend.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/watchlists", tags=["Watchlists"])

@router.get("", response_model=List[WatchlistResponse])
async def list_watchlists(user: Dict[str, Any] = Depends(get_current_user)):
    return watchlist_service.get_user_watchlists(user["id"])

@router.post("", response_model=WatchlistResponse)
async def create_watchlist(payload: WatchlistCreate, user: Dict[str, Any] = Depends(get_current_user)):
    return watchlist_service.create_watchlist(user["id"], payload.name, payload.description, payload.is_default or False)

@router.post("/{watchlist_id}/items", response_model=WatchlistItemResponse)
async def add_item_to_watchlist(
    watchlist_id: str,
    payload: WatchlistItemCreate,
    user: Dict[str, Any] = Depends(get_current_user)
):
    try:
        return watchlist_service.add_pair_to_watchlist(watchlist_id, user["id"], payload.base_currency, payload.target_currency)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{watchlist_id}/items/{item_id}")
async def remove_item_from_watchlist(
    watchlist_id: str,
    item_id: str,
    user: Dict[str, Any] = Depends(get_current_user)
):
    try:
        success = watchlist_service.remove_item(watchlist_id, item_id, user["id"])
        if not success:
            raise HTTPException(status_code=404, detail="Item not found.")
        return {"success": True, "message": "Item removed from watchlist"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{watchlist_id}")
async def delete_watchlist(
    watchlist_id: str,
    user: Dict[str, Any] = Depends(get_current_user)
):
    success = watchlist_service.delete_watchlist(watchlist_id, user["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Watchlist not found.")
    return {"success": True, "message": "Watchlist deleted"}
