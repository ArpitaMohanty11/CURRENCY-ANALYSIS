from typing import List, Dict, Any
from backend.repositories.alert_repo import alert_repo
from backend.repositories.currency_repo import currency_repo
from backend.schemas.alert import AlertResponse, AlertHistoryResponse

class AlertService:
    def get_user_alerts(self, user_id: str) -> List[AlertResponse]:
        raw_alerts = alert_repo.get_by_user(user_id)
        results = []
        for a in raw_alerts:
            pair = f"{a['base_currency']}/{a['target_currency']}"
            rate_obj = currency_repo.get_rate_by_pair(pair)
            current_rate = rate_obj["rate"] if rate_obj else None
            results.append(AlertResponse(
                id=a["id"],
                user_id=a["user_id"],
                base_currency=a["base_currency"],
                target_currency=a["target_currency"],
                pair=pair,
                trigger_type=a["trigger_type"],
                target_rate=a["target_rate"],
                current_rate=current_rate,
                is_active=a.get("is_active", True),
                triggered_count=a.get("triggered_count", 0),
                last_triggered_at=a.get("last_triggered_at"),
                created_at=a["created_at"]
            ))
        return results

    def create_alert(self, user_id: str, base_currency: str, target_currency: str, trigger_type: str, target_rate: float) -> AlertResponse:
        record = alert_repo.create(user_id, base_currency, target_currency, trigger_type, target_rate)
        pair = f"{record['base_currency']}/{record['target_currency']}"
        rate_obj = currency_repo.get_rate_by_pair(pair)
        current_rate = rate_obj["rate"] if rate_obj else None
        return AlertResponse(
            id=record["id"],
            user_id=record["user_id"],
            base_currency=record["base_currency"],
            target_currency=record["target_currency"],
            pair=pair,
            trigger_type=record["trigger_type"],
            target_rate=record["target_rate"],
            current_rate=current_rate,
            is_active=record["is_active"],
            triggered_count=0,
            last_triggered_at=None,
            created_at=record["created_at"]
        )

    def toggle_alert(self, alert_id: str, user_id: str, is_active: bool) -> AlertResponse:
        updated = alert_repo.update(alert_id, user_id, {"is_active": is_active})
        if not updated:
            raise ValueError("Alert not found.")
        pair = f"{updated['base_currency']}/{updated['target_currency']}"
        rate_obj = currency_repo.get_rate_by_pair(pair)
        return AlertResponse(
            id=updated["id"],
            user_id=updated["user_id"],
            base_currency=updated["base_currency"],
            target_currency=updated["target_currency"],
            pair=pair,
            trigger_type=updated["trigger_type"],
            target_rate=updated["target_rate"],
            current_rate=rate_obj["rate"] if rate_obj else None,
            is_active=updated["is_active"],
            triggered_count=updated.get("triggered_count", 0),
            last_triggered_at=updated.get("last_triggered_at"),
            created_at=updated["created_at"]
        )

    def delete_alert(self, alert_id: str, user_id: str) -> bool:
        return alert_repo.delete(alert_id, user_id)

    def get_history(self, user_id: str) -> List[AlertHistoryResponse]:
        raw_hist = alert_repo.get_history(user_id)
        return [AlertHistoryResponse(**h) for h in raw_hist]

    def monitor_and_trigger_alerts(self):
        """Executed periodically by APScheduler background job"""
        active_alerts = alert_repo.get_all_active()
        for alert in active_alerts:
            pair = f"{alert['base_currency']}/{alert['target_currency']}"
            rate_obj = currency_repo.get_rate_by_pair(pair)
            if not rate_obj:
                continue

            current_rate = rate_obj["rate"]
            target_rate = alert["target_rate"]
            trigger_type = alert["trigger_type"]
            triggered = False
            msg = ""

            if trigger_type == "ABOVE" and current_rate >= target_rate:
                triggered = True
                msg = f"Rate breached ABOVE target: {pair} reached {current_rate:.4f} (target: {target_rate:.4f})"
            elif trigger_type == "BELOW" and current_rate <= target_rate:
                triggered = True
                msg = f"Rate breached BELOW target: {pair} fell to {current_rate:.4f} (target: {target_rate:.4f})"
            elif trigger_type == "PCT_CHANGE_UP" and rate_obj["change_pct_24h"] >= target_rate:
                triggered = True
                msg = f"Rapid Surge Alert: {pair} surged +{rate_obj['change_pct_24h']:.2f}% (trigger: +{target_rate:.2f}%)"
            elif trigger_type == "PCT_CHANGE_DOWN" and rate_obj["change_pct_24h"] <= -abs(target_rate):
                triggered = True
                msg = f"Rapid Drop Alert: {pair} tumbled {rate_obj['change_pct_24h']:.2f}% (trigger: -{abs(target_rate):.2f}%)"

            if triggered:
                alert_repo.record_trigger(alert, current_rate, msg)

alert_service = AlertService()
