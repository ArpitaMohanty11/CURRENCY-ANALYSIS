from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ReportCreate(BaseModel):
    title: str
    report_type: str = "DAILY_WRAP"  # DAILY_WRAP, WEEKLY_VOLATILITY, CORRELATION_MATRIX, CURRENCY_PERFORMANCE, CUSTOM
    format: str = "PDF"  # PDF, CSV, JSON
    parameters: Optional[Dict[str, Any]] = {}

class ReportResponse(BaseModel):
    id: str
    user_id: str
    title: str
    report_type: str
    format: str
    file_url: Optional[str] = None
    parameters: Dict[str, Any]
    status: str
    created_at: datetime
    data_preview: Optional[Dict[str, Any]] = None
