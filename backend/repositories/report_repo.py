import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.repositories.database import db


class ReportRepository:
    def get_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        rows = db.sb_select("reports", {"user_id": user_id})
        if rows:
            for row in rows:
                db.reports[row["id"]] = row
            return sorted(rows, key=lambda x: x.get("created_at", ""), reverse=True)
        return sorted(
            [r for r in db.reports.values() if r["user_id"] == user_id],
            key=lambda x: x.get("created_at", ""), reverse=True
        )

    def get_by_id(self, report_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        r = db.reports.get(report_id)
        if r and r["user_id"] == user_id:
            return r
        rows = db.sb_select("reports", {"id": report_id})
        if rows and rows[0]["user_id"] == user_id:
            db.reports[report_id] = rows[0]
            return rows[0]
        return None

    def create(self, user_id: str, title: str, report_type: str, format_type: str,
               parameters: Dict[str, Any], preview_data: Dict[str, Any]) -> Dict[str, Any]:
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
            "created_at": now.isoformat(),
            "data_preview": preview_data
        }
        db.sb_upsert("reports", record)
        db.reports[report_id] = {**record, "created_at": now}
        return db.reports[report_id]

    def delete(self, report_id: str, user_id: str) -> bool:
        r = self.get_by_id(report_id, user_id)
        if not r:
            return False
        db.sb_delete("reports", {"id": report_id})
        db.reports.pop(report_id, None)
        return True


report_repo = ReportRepository()
