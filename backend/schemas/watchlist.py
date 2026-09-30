from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from backend.schemas.currency import ExchangeRateResponse

class WatchlistItemCreate(BaseModel):
    base_currency: str
    target_currency: str

class WatchlistItemResponse(BaseModel):
    id: str
    watchlist_id: str
    base_currency: str
    target_currency: str
    pair: str
    added_at: datetime
    rate_info: Optional[ExchangeRateResponse] = None

class WatchlistCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_default: Optional[bool] = False

class WatchlistUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_default: Optional[bool] = None

class WatchlistResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str] = None
    is_default: bool
    created_at: datetime
    updated_at: datetime
    items: List[WatchlistItemResponse] = []
