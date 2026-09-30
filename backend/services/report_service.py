from typing import List, Dict, Any
from backend.repositories.report_repo import report_repo
from backend.repositories.currency_repo import currency_repo
from backend.schemas.report import ReportResponse, ReportCreate

class ReportService:
    def get_user_reports(self, user_id: str) -> List[ReportResponse]:
        raw = report_repo.get_by_user(user_id)
        return [ReportResponse(**r) for r in raw]

    def generate_report(self, user_id: str, payload: ReportCreate) -> ReportResponse:
        rates = currency_repo.get_all_exchange_rates()
        preview = {
            "total_pairs": len(rates),
            "top_gainer": max(rates, key=lambda x: x["change_pct_24h"])["pair"],
            "top_loser": min(rates, key=lambda x: x["change_pct_24h"])["pair"],
            "dxy": 104.28,
            "generated_items_count": len(rates),
            "horizon": payload.parameters.get("horizon", "30D") if payload.parameters else "30D"
        }
        record = report_repo.create(
            user_id=user_id,
            title=payload.title,
            report_type=payload.report_type,
            format_type=payload.format,
            parameters=payload.parameters or {},
            preview_data=preview
        )
        return ReportResponse(**record)

    def export_csv_data(self) -> str:
        rates = currency_repo.get_all_exchange_rates()
        lines = ["Pair,Base,Target,Rate,Bid,Ask,High24h,Low24h,Change24h,ChangePct24h,Timestamp"]
        for r in rates:
            lines.append(f"{r['pair']},{r['base_currency']},{r['target_currency']},{r['rate']},{r['bid']},{r['ask']},{r['high_24h']},{r['low_24h']},{r['change_24h']},{r['change_pct_24h']},{r['timestamp']}")
        return "\n".join(lines)

report_service = ReportService()
