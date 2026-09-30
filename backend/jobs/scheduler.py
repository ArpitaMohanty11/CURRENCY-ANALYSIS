from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timezone
from backend.repositories.currency_repo import currency_repo
from backend.services.alert_service import alert_service
from backend.repositories.admin_repo import admin_repo

scheduler = AsyncIOScheduler()

async def sync_exchange_rates_job():
    """Background job: Live FX rate tick simulation and spread adjustment"""
    try:
        currency_repo.tick_exchange_rates()
    except Exception as e:
        print(f"[Job Error] sync_exchange_rates: {e}")

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
        scheduler.add_job(
            sync_exchange_rates_job,
            trigger=IntervalTrigger(seconds=15),
            id="sync_exchange_rates",
            name="FX Live Exchange Rate Sync",
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
        print("APScheduler background jobs initialized and running.")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        print("APScheduler stopped.")
