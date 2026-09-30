from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from backend.schemas.alert import AlertResponse, AlertCreate, AlertUpdate, AlertHistoryResponse
from backend.services.alert_service import alert_service
from backend.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/alerts", tags=["Price Alerts"])

@router.get("", response_model=List[AlertResponse])
async def list_alerts(user: Dict[str, Any] = Depends(get_current_user)):
    return alert_service.get_user_alerts(user["id"])

@router.post("", response_model=AlertResponse)
async def create_alert(payload: AlertCreate, user: Dict[str, Any] = Depends(get_current_user)):
    return alert_service.create_alert(
        user_id=user["id"],
        base_currency=payload.base_currency,
        target_currency=payload.target_currency,
        trigger_type=payload.trigger_type,
        target_rate=payload.target_rate
    )

@router.patch("/{alert_id}/toggle", response_model=AlertResponse)
async def toggle_alert(alert_id: str, is_active: bool, user: Dict[str, Any] = Depends(get_current_user)):
    try:
        return alert_service.toggle_alert(alert_id, user["id"], is_active)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/{alert_id}")
async def delete_alert(alert_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    success = alert_service.delete_alert(alert_id, user["id"])
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found.")
    return {"success": True, "message": "Alert deleted"}

@router.get("/history", response_model=List[AlertHistoryResponse])
async def get_alert_history(user: Dict[str, Any] = Depends(get_current_user)):
    return alert_service.get_history(user["id"])
