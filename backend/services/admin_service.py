import time
from datetime import datetime, timezone
from typing import List, Dict, Any
from backend.repositories.database import db
from backend.repositories.admin_repo import admin_repo
from backend.schemas.admin import SystemHealthResponse, AuditLogResponse, UserManagementItem

START_TIME = time.time()

class AdminService:
    def get_system_health(self) -> SystemHealthResponse:
        uptime = round(time.time() - START_TIME, 1)
        active_alerts = sum(1 for a in db.alerts.values() if a.get("is_active"))
        return SystemHealthResponse(
            status="OPERATIONAL",
            version="1.0.0-institutional",
            uptime_seconds=uptime,
            database="Supabase PostgreSQL (Ready / Live Fallback Active)",
            rates_cached_count=len(db.exchange_rates),
            active_alerts_count=active_alerts,
            active_users_count=len(db.users),
            scheduler_running=True,
            timestamp=datetime.now(timezone.utc)
        )

    def get_audit_logs(self) -> List[AuditLogResponse]:
        raw = admin_repo.get_audit_logs()
        return [AuditLogResponse(**log) for log in raw]

    def get_users_list(self) -> List[UserManagementItem]:
        users = list(db.users.values())
        results = []
        for u in users:
            w_count = sum(1 for w in db.watchlists.values() if w["user_id"] == u["id"])
            a_count = sum(1 for a in db.alerts.values() if a["user_id"] == u["id"])
            results.append(UserManagementItem(
                id=u["id"],
                email=u["email"],
                full_name=u["full_name"],
                role=u["role"],
                is_active=u["is_active"],
                created_at=u["created_at"],
                watchlists_count=w_count,
                alerts_count=a_count
            ))
        return results

admin_service = AdminService()
