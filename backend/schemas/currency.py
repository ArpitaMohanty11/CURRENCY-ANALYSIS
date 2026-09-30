from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CurrencyBase(BaseModel):
    code: str
    name: str
    symbol: str
    country: str
    flag_url: Optional[str] = None
    category: str = "Major"
    is_active: bool = True

class CurrencyResponse(CurrencyBase):
    created_at: Optional[datetime] = None

class ExchangeRateResponse(BaseModel):
    id: Optional[str] = None
    base_currency: str
    target_currency: str
    pair: str
    rate: float
    bid: float
    ask: float
    high_24h: float
    low_24h: float
    change_24h: float
    change_pct_24h: float
    timestamp: datetime

class ConvertRequest(BaseModel):
    from_currency: str
    to_currency: str
    amount: float = Field(..., gt=0)

class ConvertResponse(BaseModel):
    from_currency: str
    to_currency: str
    amount: float
    rate: float
    converted_amount: float
    bid: float
    ask: float
    spread: float
    timestamp: datetime

class MultiConvertRequest(BaseModel):
    base_currency: str
    amount: float = Field(..., gt=0)
    target_currencies: List[str]

class MultiConvertItem(BaseModel):
    currency: str
    rate: float
    converted_amount: float
    change_pct_24h: float

class MultiConvertResponse(BaseModel):
    base_currency: str
    amount: float
    results: List[MultiConvertItem]
    timestamp: datetime

class TopMoversResponse(BaseModel):
    top_gainers: List[ExchangeRateResponse]
    top_losers: List[ExchangeRateResponse]
    market_overview: dict
