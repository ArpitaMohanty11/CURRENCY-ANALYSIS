import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.repositories.database import db

class ReportRepository:
    def get_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        return [r for r in db.reports.values() if r["user_id"] == user_id]

    def get_by_id(self, report_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        r = db.reports.get(report_id)
        if r and r["user_id"] == user_id:
            return r
        return None

    def create(self, user_id: str, title: str, report_type: str, format_type: str, parameters: Dict[str, Any], preview_data: Dict[str, Any]) -> Dict[str, Any]:
        report_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        record = {
            "id": report_id,
            "user_id": user_id,
            "title": title,
            "report_type": report_type,
            "format": format_type,
            "file_url": f"/api/reports/{report_id}/download",
            "parameters": parameters or {},
            "status": "COMPLETED",
            "created_at": now,
            "data_preview": preview_data
        }
        db.reports[report_id] = record
        return record

    def delete(self, report_id: str, user_id: str) -> bool:
        r = self.get_by_id(report_id, user_id)
        if not r:
            return False
        del db.reports[report_id]
        return True

report_repo = ReportRepository()
