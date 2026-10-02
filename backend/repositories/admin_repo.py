import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.repositories.database import db


class AdminRepository:
    def log_audit(self, action: str, resource_type: str, resource_id: Optional[str] = None,
                  user_id: Optional[str] = None, ip_address: Optional[str] = None,
                  details: Optional[Dict[str, Any]] = None):
        log_entry = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "ip_address": ip_address,
            "details": details or {},
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db.sb_upsert("audit_logs", log_entry)
        db.audit_logs.insert(0, log_entry)
        if len(db.audit_logs) > 500:
            db.audit_logs.pop()

    def get_audit_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        rows = db.sb_select("audit_logs")
        if rows:
            return sorted(rows, key=lambda x: x.get("created_at", ""), reverse=True)[:limit]
        return db.audit_logs[:limit]


admin_repo = AdminRepository()
