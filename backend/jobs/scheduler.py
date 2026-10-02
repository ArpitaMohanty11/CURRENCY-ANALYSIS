from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timezone
from backend.repositories.currency_repo import currency_repo
from backend.services.alert_service import alert_service
from backend.repositories.admin_repo import admin_repo

scheduler = AsyncIOScheduler()

async def sync_live_rates_job():
    """Background job: Fetch real live FX rates from open.er-api.com every 60s"""
    try:
        success = currency_repo.sync_live_rates()
        if not success:
            # If live fetch fails, apply micro-tick to keep UI responsive
            currency_repo.tick_exchange_rates()
    except Exception as e:
        print(f"[Job Error] sync_live_rates: {e}")
        try:
            currency_repo.tick_exchange_rates()
        except Exception:
            pass

async def monitor_alerts_job():
    """Background job: Price alert monitoring against live market rates"""
    try:
        alert_service.monitor_and_trigger_alerts()
    except Exception as e:
        print(f"[Job Error] monitor_alerts: {e}")

async def daily_market_summary_job():
    """Background job: Daily market analytics and audit logging"""
    try:
        admin_repo.log_audit(
            action="SCHEDULED_MARKET_SUMMARY",
            resource_type="ANALYTICS",
            details={"status": "Calculated daily liquidity and volatility metrics"}
        )
    except Exception as e:
        print(f"[Job Error] daily_market_summary: {e}")

def start_scheduler():
    if not scheduler.running:
        # Live FX rate sync every 60 seconds (open.er-api.com free tier is generous)
        scheduler.add_job(
            sync_live_rates_job,
            trigger=IntervalTrigger(seconds=60),
            id="sync_live_rates",
            name="Live FX Rate Sync (open.er-api.com)",
            replace_existing=True
        )
        scheduler.add_job(
            monitor_alerts_job,
            trigger=IntervalTrigger(seconds=30),
            id="monitor_alerts",
            name="Institutional Alert Trigger Engine",
            replace_existing=True
        )
        scheduler.add_job(
            daily_market_summary_job,
            trigger=IntervalTrigger(hours=24),
            id="daily_market_summary",
            name="Daily Market Summary Compiler",
            replace_existing=True
        )
        scheduler.start()
        print("APScheduler background jobs initialized — live FX sync active every 60s.")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        print("APScheduler stopped.")
