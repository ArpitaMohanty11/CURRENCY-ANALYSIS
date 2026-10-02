from fastapi import APIRouter, Depends, HTTPException, Response
from typing import List, Dict, Any
from backend.schemas.report import ReportResponse, ReportCreate
from backend.services.report_service import report_service
from backend.middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports & Export"])

@router.get("", response_model=List[ReportResponse])
async def list_reports(user: Dict[str, Any] = Depends(get_current_user)):
    return report_service.get_user_reports(user["id"])

@router.post("/generate", response_model=ReportResponse)
async def generate_report(payload: ReportCreate, user: Dict[str, Any] = Depends(get_current_user)):
    return report_service.generate_report(user["id"], payload)

@router.get("/export/csv")
async def export_csv():
    csv_content = report_service.export_csv_data()
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=currency_analysis_market_rates.csv"}
    )
