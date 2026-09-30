from fastapi import APIRouter, Depends
from typing import List, Dict, Any
from datetime import datetime, timezone
from backend.schemas.admin import SystemHealthResponse, AuditLogResponse, UserManagementItem, SchedulerJobStatus
from backend.services.admin_service import admin_service
from backend.middleware.auth_middleware import get_current_admin
from backend.jobs.scheduler import scheduler, sync_exchange_rates_job

router = APIRouter(prefix="/admin", tags=["Admin Terminal"])

@router.get("/health", response_model=SystemHealthResponse)
async def system_health(admin: Dict[str, Any] = Depends(get_current_admin)):
    return admin_service.get_system_health()

@router.get("/logs", response_model=List[AuditLogResponse])
async def audit_logs(admin: Dict[str, Any] = Depends(get_current_admin)):
    return admin_service.get_audit_logs()

@router.get("/users", response_model=List[UserManagementItem])
async def user_management(admin: Dict[str, Any] = Depends(get_current_admin)):
    return admin_service.get_users_list()

@router.get("/jobs", response_model=List[SchedulerJobStatus])
async def scheduler_jobs(admin: Dict[str, Any] = Depends(get_current_admin)):
    jobs = []
    for j in scheduler.get_jobs():
        jobs.append(SchedulerJobStatus(
            id=j.id,
            name=j.name,
            next_run_time=j.next_run_time,
            trigger=str(j.trigger),
            status="ACTIVE"
        ))
    return jobs

@router.post("/jobs/sync/trigger")
async def trigger_sync(admin: Dict[str, Any] = Depends(get_current_admin)):
    await sync_exchange_rates_job()
    return {"status": "SUCCESS", "message": "Manual exchange rate sync executed immediately."}
