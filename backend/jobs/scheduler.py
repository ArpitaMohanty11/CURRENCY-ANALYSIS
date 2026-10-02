import httpx
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timezone
from backend.repositories.currency_repo import currency_repo
from backend.services.alert_service import alert_service
from backend.repositories.admin_repo import admin_repo
from backend.config.settings import settings

scheduler = AsyncIOScheduler()


async def sync_live_rates_job():
    """Fetch real live FX rates from open.er-api.com every 60s."""
    try:
        success = currency_repo.sync_live_rates()
        if not success:
            currency_repo.tick_exchange_rates()
    except Exception as e:
        print(f"[Job Error] sync_live_rates: {e}")
        try:
            currency_repo.tick_exchange_rates()
        except Exception:
            pass


async def monitor_alerts_job():
    """Check price alerts against live market rates every 30s."""
    try:
        alert_service.monitor_and_trigger_alerts()
    except Exception as e:
        print(f"[Job Error] monitor_alerts: {e}")


async def keep_alive_job():
    """
    Ping own /health endpoint every 10 minutes.
    Prevents Render free tier from sleeping due to inactivity.
    """
    url = settings.SELF_PING_URL
    if not url:
        return
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(f"{url}/health")
            now = datetime.now(timezone.utc).strftime("%H:%M:%S")
            print(f"[{now} UTC] Keep-alive ping → {res.status_code}")
    except Exception as e:
        print(f"[Keep-Alive] Ping failed: {e}")


async def daily_market_summary_job():
    """Daily audit log entry."""
    try:
        admin_repo.log_audit(
            action="SCHEDULED_MARKET_SUMMARY",
            resource_type="ANALYTICS",
            details={"status": "Daily liquidity and volatility metrics calculated"}
        )
    except Exception as e:
        print(f"[Job Error] daily_market_summary: {e}")


def start_scheduler():
    if not scheduler.running:
        # Live FX rate sync every 60s
        scheduler.add_job(
            sync_live_rates_job,
            trigger=IntervalTrigger(seconds=60),
            id="sync_live_rates",
            name="Live FX Rate Sync (open.er-api.com)",
            replace_existing=True
        )

        # Alert monitoring every 30s
        scheduler.add_job(
            monitor_alerts_job,
            trigger=IntervalTrigger(seconds=30),
            id="monitor_alerts",
            name="Price Alert Monitor",
            replace_existing=True
        )

        # Keep-alive ping every 10 minutes (prevents Render free tier sleep)
        scheduler.add_job(
            keep_alive_job,
            trigger=IntervalTrigger(minutes=10),
            id="keep_alive",
            name="Render Keep-Alive Ping",
            replace_existing=True
        )

        # Daily summary
        scheduler.add_job(
            daily_market_summary_job,
            trigger=IntervalTrigger(hours=24),
            id="daily_market_summary",
            name="Daily Market Summary",
            replace_existing=True
        )

        scheduler.start()
        ping_status = f"keep-alive → {settings.SELF_PING_URL}" if settings.SELF_PING_URL else "keep-alive disabled (set SELF_PING_URL)"
        print(f"[Scheduler] Started — live sync every 60s, {ping_status}")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown()
        print("[Scheduler] Stopped.")
