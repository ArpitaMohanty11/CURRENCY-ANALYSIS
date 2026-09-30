from fastapi import APIRouter, Query
from typing import List
from backend.schemas.analytics import (
    CurrencyStrengthItem,
    HistoricalTrendsResponse,
    CorrelationMatrixResponse,
    TechnicalIndicatorsResponse,
    AIInsightsResponse
)
from backend.services.analytics_service import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics & AI"])

@router.get("/strength", response_model=List[CurrencyStrengthItem])
async def get_currency_strength():
    return analytics_service.get_currency_strength_rankings()

@router.get("/historical", response_model=HistoricalTrendsResponse)
async def get_historical_trends(
    pair: str = Query("EUR/USD", description="Currency pair symbol, e.g. EUR/USD"),
    period: str = Query("30D", description="Time horizon e.g. 7D, 30D, 90D, 1Y")
):
    return analytics_service.get_historical_trends(pair, period)

@router.get("/correlations", response_model=CorrelationMatrixResponse)
async def get_correlations():
    return analytics_service.get_correlation_matrix()

@router.get("/indicators", response_model=TechnicalIndicatorsResponse)
async def get_technical_indicators(
    pair: str = Query("EUR/USD", description="Currency pair symbol, e.g. EUR/USD")
):
    return analytics_service.get_technical_indicators(pair)

@router.get("/ai-insights", response_model=AIInsightsResponse)
async def get_ai_insights():
    return analytics_service.get_ai_insights()
