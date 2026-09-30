from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from backend.schemas.currency import (
    CurrencyResponse, ExchangeRateResponse, ConvertRequest, ConvertResponse,
    MultiConvertRequest, MultiConvertResponse, TopMoversResponse
)
from backend.services.currency_service import currency_service
from backend.repositories.currency_repo import currency_repo

router = APIRouter(prefix="/currencies", tags=["Currencies & Rates"])

@router.get("", response_model=List[CurrencyResponse])
async def list_currencies():
    return currency_service.get_currencies()

@router.get("/rates", response_model=List[ExchangeRateResponse])
async def list_exchange_rates():
    return currency_service.get_exchange_rates()

@router.get("/top-movers", response_model=TopMoversResponse)
async def get_top_movers():
    return currency_service.get_top_movers()

@router.post("/convert", response_model=ConvertResponse)
async def convert_currency(payload: ConvertRequest):
    try:
        return currency_service.convert_currency(payload.from_currency, payload.to_currency, payload.amount)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/multi-convert", response_model=MultiConvertResponse)
async def multi_convert_currency(payload: MultiConvertRequest):
    return currency_service.multi_convert(payload.base_currency, payload.amount, payload.target_currencies)

@router.get("/pairs/{base}/{target}", response_model=ExchangeRateResponse)
async def get_pair_rate(base: str, target: str):
    rate_obj = currency_service.get_rate(base, target)
    if not rate_obj:
        raise HTTPException(status_code=404, detail=f"Pair {base.upper()}/{target.upper()} not found.")
    return rate_obj
