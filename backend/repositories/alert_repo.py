import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.repositories.database import db

class AlertRepository:
    def get_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        return [a for a in db.alerts.values() if a["user_id"] == user_id]

    def get_by_id(self, alert_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        a = db.alerts.get(alert_id)
        if a and a["user_id"] == user_id:
            return a
        return None

    def get_all_active(self) -> List[Dict[str, Any]]:
        return [a for a in db.alerts.values() if a.get("is_active", True)]

    def create(self, user_id: str, base_currency: str, target_currency: str, trigger_type: str, target_rate: float) -> Dict[str, Any]:
        alert_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        record = {
            "id": alert_id,
            "user_id": user_id,
            "base_currency": base_currency.upper(),
            "target_currency": target_currency.upper(),
            "trigger_type": trigger_type.upper(),
            "target_rate": float(target_rate),
            "is_active": True,
            "triggered_count": 0,
            "last_triggered_at": None,
            "created_at": now
        }
        db.alerts[alert_id] = record
        return record

    def update(self, alert_id: str, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        a = self.get_by_id(alert_id, user_id)
        if not a:
            return None
        for k, v in updates.items():
            if v is not None:
                a[k] = v
        return a

    def delete(self, alert_id: str, user_id: str) -> bool:
        a = self.get_by_id(alert_id, user_id)
        if not a:
            return False
        del db.alerts[alert_id]
        return True

    def record_trigger(self, alert: Dict[str, Any], triggered_rate: float, message: str):
        now = datetime.now(timezone.utc)
        alert["triggered_count"] = alert.get("triggered_count", 0) + 1
        alert["last_triggered_at"] = now
        
        hist = {
            "id": str(uuid.uuid4()),
            "alert_id": alert["id"],
            "user_id": alert["user_id"],
            "base_currency": alert["base_currency"],
            "target_currency": alert["target_currency"],
            "pair": f"{alert['base_currency']}/{alert['target_currency']}",
            "triggered_rate": triggered_rate,
            "target_rate": alert["target_rate"],
            "message": message,
            "created_at": now
        }
        db.alert_history.insert(0, hist)

        # Also log to notification_logs
        db.notification_logs.insert(0, {
            "id": str(uuid.uuid4()),
            "user_id": alert["user_id"],
            "type": "PRICE_ALERT",
            "title": f"FX Alert Triggered: {alert['base_currency']}/{alert['target_currency']}",
            "message": message,
            "is_read": False,
            "created_at": now
        })

    def get_history(self, user_id: str) -> List[Dict[str, Any]]:
        return [h for h in db.alert_history if h["user_id"] == user_id]

alert_repo = AlertRepository()
