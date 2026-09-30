from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class SystemHealthResponse(BaseModel):
    status: str
    version: str
    uptime_seconds: float
    database: str
    rates_cached_count: int
    active_alerts_count: int
    active_users_count: int
    scheduler_running: bool
    timestamp: datetime

class SchedulerJobStatus(BaseModel):
    id: str
    name: str
    next_run_time: Optional[datetime] = None
    trigger: str
    status: str

class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str]
    action: str
    resource_type: str
    resource_id: Optional[str]
    ip_address: Optional[str]
    details: Dict[str, Any]
    created_at: datetime

class UserManagementItem(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    watchlists_count: int
    alerts_count: int
