import sys
from pathlib import Path

# Ensure project root is in sys.path so backend imports work from anywhere
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.config.settings import settings
from backend.jobs.scheduler import start_scheduler, stop_scheduler
from backend.routes import auth, currencies, analytics, watchlists, alerts, reports, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────────────
    # 1. Immediately sync live FX rates so first request has real data
    try:
        from backend.repositories.currency_repo import currency_repo
        print("[Startup] Fetching initial live FX rates...")
        currency_repo.sync_live_rates()
    except Exception as e:
        print(f"[Startup] Initial live sync warning: {e}")

    # 2. Start background scheduler (syncs every 60s after that)
    start_scheduler()

    yield

    # ── Shutdown ─────────────────────────────────────────────────────────────
    stop_scheduler()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Institutional FX analytics — live rates, AI insights, real-time alerts.",
    lifespan=lifespan
)

# CORS — allow all origins for API accessibility (frontend handles auth)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(currencies.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(watchlists.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    from backend.repositories.currency_repo import currency_repo
    last_sync = currency_repo._last_live_fetch
    return {
        "service": "Currency Analysis Institutional FX Intelligence API",
        "version": settings.VERSION,
        "status": "ONLINE",
        "last_live_sync": last_sync.isoformat() if last_sync else "pending",
        "documentation": "/docs"
    }


@app.get("/health")
async def health_check():
    from backend.repositories.currency_repo import currency_repo
    from backend.repositories.database import db
    last_sync = currency_repo._last_live_fetch
    return {
        "status": "HEALTHY",
        "live_rates_active": last_sync is not None,
        "last_sync": last_sync.isoformat() if last_sync else None,
        "pairs_loaded": len(db.exchange_rates),
        "users_loaded": len(db.users),
        "supabase_connected": db._client() is not None,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
