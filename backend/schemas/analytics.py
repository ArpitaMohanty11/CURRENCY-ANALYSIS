from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class CurrencyStrengthItem(BaseModel):
    currency: str
    name: str
    score: float  # 0 to 100
    rank: int
    change_24h: float
    sentiment: str  # Strong Bullish, Bullish, Neutral, Bearish, Strong Bearish

class HistoricalRatePoint(BaseModel):
    timestamp: str
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float

class HistoricalTrendsResponse(BaseModel):
    pair: str
    period: str
    rates: List[HistoricalRatePoint]
    metrics: Dict[str, Any]

class CorrelationPair(BaseModel):
    pair_a: str
    pair_b: str
    correlation: float

class CorrelationMatrixResponse(BaseModel):
    currencies: List[str]
    matrix: Dict[str, Dict[str, float]]

class TechnicalIndicatorsResponse(BaseModel):
    pair: str
    rsi_14: float
    sma_20: float
    sma_50: float
    sma_200: float
    volatility_30d: float
    bollinger_upper: float
    bollinger_middle: float
    bollinger_lower: float
    macd: float
    signal_line: float
    summary_signal: str  # BUY, NEUTRAL, SELL

class AIInsightItem(BaseModel):
    id: str
    title: str
    category: str  # Macro, Central Bank, Technical, Geopolitical
    sentiment: str  # Bullish, Bearish, Neutral
    impact_level: str  # HIGH, MEDIUM, LOW
    currency_pair: str
    summary: str
    published_at: str
    confidence_score: float

class AIInsightsResponse(BaseModel):
    insights: List[AIInsightItem]
    market_sentiment_score: float
    dxy_forecast: str
