from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AlertCreate(BaseModel):
    base_currency: str
    target_currency: str
    trigger_type: str = Field(..., description="ABOVE, BELOW, PCT_CHANGE_UP, PCT_CHANGE_DOWN")
    target_rate: float

class AlertUpdate(BaseModel):
    is_active: Optional[bool] = None
    target_rate: Optional[float] = None
    trigger_type: Optional[str] = None

class AlertResponse(BaseModel):
    id: str
    user_id: str
    base_currency: str
    target_currency: str
    pair: str
    trigger_type: str
    target_rate: float
    current_rate: Optional[float] = None
    is_active: bool
    triggered_count: int
    last_triggered_at: Optional[datetime] = None
    created_at: datetime

class AlertHistoryResponse(BaseModel):
    id: str
    alert_id: str
    user_id: str
    base_currency: str
    target_currency: str
    pair: str
    triggered_rate: float
    target_rate: float
    message: str
    created_at: datetime
