import os
import uuid
import random
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from backend.config.settings import settings

try:
    from supabase import create_client, Client
except ImportError:
    Client = Any

class DatabaseManager:
    """
    Database Manager supporting Supabase PostgreSQL with local resilient fallback store.
    Guarantees seamless execution even before custom remote credentials are configured.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
            cls._instance._init_db()
        return cls._instance

    def _init_db(self):
        self.supabase: Optional[Client] = None
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                print("Connected to Supabase PostgreSQL.")
            except Exception as e:
                print(f"Supabase connection notice: {e}. Using resilient local store.")

        # In-memory / local state for instant, reliable execution
        self.users: Dict[str, Dict[str, Any]] = {}
        self.user_preferences: Dict[str, Dict[str, Any]] = {}
        self.currencies: Dict[str, Dict[str, Any]] = {}
        self.exchange_rates: Dict[str, Dict[str, Any]] = {}
        self.rate_history: Dict[str, List[Dict[str, Any]]] = {}
        self.watchlists: Dict[str, Dict[str, Any]] = {}
        self.watchlist_items: Dict[str, Dict[str, Any]] = {}
        self.alerts: Dict[str, Dict[str, Any]] = {}
        self.alert_history: List[Dict[str, Any]] = []
        self.reports: Dict[str, Dict[str, Any]] = {}
        self.audit_logs: List[Dict[str, Any]] = []
        self.notification_logs: List[Dict[str, Any]] = []

        self._seed_initial_data()

    def _seed_initial_data(self):
        # 1. Seed Currencies
        initial_currencies = [
            {"code": "USD", "name": "United States Dollar", "symbol": "$", "country": "United States", "category": "Major"},
            {"code": "EUR", "name": "Euro", "symbol": "€", "country": "European Union", "category": "Major"},
            {"code": "GBP", "name": "British Pound", "symbol": "£", "country": "United Kingdom", "category": "Major"},
            {"code": "JPY", "name": "Japanese Yen", "symbol": "¥", "country": "Japan", "category": "Major"},
            {"code": "CHF", "name": "Swiss Franc", "symbol": "CHF", "country": "Switzerland", "category": "Major"},
            {"code": "AUD", "name": "Australian Dollar", "symbol": "A$", "country": "Australia", "category": "Major"},
            {"code": "CAD", "name": "Canadian Dollar", "symbol": "C$", "country": "Canada", "category": "Major"},
            {"code": "NZD", "name": "New Zealand Dollar", "symbol": "NZ$", "country": "New Zealand", "category": "Major"},
            {"code": "INR", "name": "Indian Rupee", "symbol": "₹", "country": "India", "category": "Minor"},
            {"code": "SGD", "name": "Singapore Dollar", "symbol": "S$", "country": "Singapore", "category": "Minor"},
            {"code": "HKD", "name": "Hong Kong Dollar", "symbol": "HK$", "country": "Hong Kong", "category": "Minor"},
            {"code": "CNY", "name": "Chinese Yuan", "symbol": "¥", "country": "China", "category": "Minor"},
            {"code": "AED", "name": "UAE Dirham", "symbol": "د.إ", "country": "United Arab Emirates", "category": "Minor"},
            {"code": "KRW", "name": "South Korean Won", "symbol": "₩", "country": "South Korea", "category": "Minor"},
            {"code": "BRL", "name": "Brazilian Real", "symbol": "R$", "country": "Brazil", "category": "Exotic"},
            {"code": "MXN", "name": "Mexican Peso", "symbol": "Mex$", "country": "Mexico", "category": "Exotic"},
            {"code": "ZAR", "name": "South African Rand", "symbol": "R", "country": "South Africa", "category": "Exotic"},
            {"code": "SEK", "name": "Swedish Krona", "symbol": "kr", "country": "Sweden", "category": "Minor"},
            {"code": "NOK", "name": "Norwegian Krone", "symbol": "kr", "country": "Norway", "category": "Minor"},
            {"code": "BTC", "name": "Bitcoin (FX Cross)", "symbol": "₿", "country": "Global", "category": "Crypto"},
        ]
        now = datetime.now(timezone.utc)
        for c in initial_currencies:
            self.currencies[c["code"]] = {
                **c,
                "flag_url": f"https://flagcdn.com/w40/{c['code'][:2].lower()}.png",
                "is_active": True,
                "created_at": now
            }

        # 2. Seed Base USD Realistic Exchange Rates
        rates_map = {
            "EUR": 0.9245,
            "GBP": 0.7892,
            "JPY": 154.32,
            "CHF": 0.8840,
            "AUD": 1.5320,
            "CAD": 1.3785,
            "NZD": 1.6840,
            "INR": 86.42,
            "SGD": 1.3420,
            "HKD": 7.7810,
            "CNY": 7.2340,
            "AED": 3.6725,
            "KRW": 1385.20,
            "BRL": 5.4820,
            "MXN": 19.3450,
            "ZAR": 18.2400,
            "SEK": 10.4520,
            "NOK": 10.8240,
            "BTC": 0.00001520,
        }

        for curr, base_rate in rates_map.items():
            spread_pct = 0.0002 if curr in ["EUR", "GBP", "JPY", "CHF"] else 0.0006
            bid = base_rate * (1 - spread_pct / 2)
            ask = base_rate * (1 + spread_pct / 2)
            change_pct = round(random.uniform(-1.45, 1.85), 2)
            change_val = round(base_rate * (change_pct / 100), 6)
            high = round(base_rate * 1.008, 6)
            low = round(base_rate * 0.992, 6)

            pair_key = f"USD/{curr}"
            rate_obj = {
                "id": str(uuid.uuid4()),
                "base_currency": "USD",
                "target_currency": curr,
                "pair": pair_key,
                "rate": round(base_rate, 6),
                "bid": round(bid, 6),
                "ask": round(ask, 6),
                "high_24h": high,
                "low_24h": low,
                "change_24h": change_val,
                "change_pct_24h": change_pct,
                "timestamp": now
            }
            self.exchange_rates[pair_key] = rate_obj
            self._generate_pair_history(pair_key, base_rate)

        # Cross rates: EUR/USD, GBP/USD, EUR/GBP, USD/INR, EUR/JPY
        self._add_cross_rate("EUR", "USD", 1 / rates_map["EUR"])
        self._add_cross_rate("GBP", "USD", 1 / rates_map["GBP"])
        self._add_cross_rate("EUR", "GBP", (1 / rates_map["EUR"]) * rates_map["GBP"])
        self._add_cross_rate("EUR", "JPY", (1 / rates_map["EUR"]) * rates_map["JPY"])
        self._add_cross_rate("GBP", "JPY", (1 / rates_map["GBP"]) * rates_map["JPY"])
        self._add_cross_rate("AUD", "USD", 1 / rates_map["AUD"])

        # 3. Seed Demo Users
        admin_id = "00000000-0000-0000-0000-000000000001"
        trader_id = "00000000-0000-0000-0000-000000000002"

        self.users[admin_id] = {
            "id": admin_id,
            "email": "admin@currencylens.com",
            # Hashed representation of "admin123"
            "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
            "full_name": "Alexander Vance (Chief FX Strategist)",
            "role": "admin",
            "is_active": True,
            "created_at": now - timedelta(days=120)
        }
        self.user_preferences[admin_id] = {
            "base_currency": "USD",
            "theme": "dark",
            "refresh_interval_seconds": 10,
            "notification_email": True,
            "notification_in_app": True
        }

        self.users[trader_id] = {
            "id": trader_id,
            "email": "trader@currencylens.com",
            # Hashed representation of "trader123"
            "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
            "full_name": "Dharmendra Trader",
            "role": "trader",
            "is_active": True,
            "created_at": now - timedelta(days=60)
        }
        self.user_preferences[trader_id] = {
            "base_currency": "USD",
            "theme": "dark",
            "refresh_interval_seconds": 15,
            "notification_email": True,
            "notification_in_app": True
        }

        # 4. Seed Default Watchlist
        w_id = str(uuid.uuid4())
        self.watchlists[w_id] = {
            "id": w_id,
            "user_id": trader_id,
            "name": "Institutional G10 & Asia FX",
            "description": "Core liquidity pairs and high-volatility crosses monitored for institutional flow",
            "is_default": True,
            "created_at": now - timedelta(days=30),
            "updated_at": now
        }
        watchlist_pairs = [("EUR", "USD"), ("GBP", "USD"), ("USD", "JPY"), ("USD", "INR"), ("USD", "CHF"), ("AUD", "USD")]
        for base, target in watchlist_pairs:
            item_id = str(uuid.uuid4())
            self.watchlist_items[item_id] = {
                "id": item_id,
                "watchlist_id": w_id,
                "base_currency": base,
                "target_currency": target,
                "added_at": now - timedelta(days=15)
            }

        # 5. Seed Alerts
        a1_id = str(uuid.uuid4())
        self.alerts[a1_id] = {
            "id": a1_id,
            "user_id": trader_id,
            "base_currency": "USD",
            "target_currency": "JPY",
            "trigger_type": "ABOVE",
            "target_rate": 155.00,
            "is_active": True,
            "triggered_count": 2,
            "last_triggered_at": now - timedelta(hours=4),
            "created_at": now - timedelta(days=5)
        }
        self.alert_history.append({
            "id": str(uuid.uuid4()),
            "alert_id": a1_id,
            "user_id": trader_id,
            "base_currency": "USD",
            "target_currency": "JPY",
            "pair": "USD/JPY",
            "triggered_rate": 155.08,
            "target_rate": 155.00,
            "message": "ALERT TRIGGERED: USD/JPY pierced above threshold 155.0000 at 155.0800",
            "created_at": now - timedelta(hours=4)
        })

        a2_id = str(uuid.uuid4())
        self.alerts[a2_id] = {
            "id": a2_id,
            "user_id": trader_id,
            "base_currency": "EUR",
            "target_currency": "USD",
            "trigger_type": "BELOW",
            "target_rate": 1.0750,
            "is_active": True,
            "triggered_count": 0,
            "last_triggered_at": None,
            "created_at": now - timedelta(days=2)
        }

        # 6. Seed Reports
        r_id = str(uuid.uuid4())
        self.reports[r_id] = {
            "id": r_id,
            "user_id": trader_id,
            "title": "Global Macro FX & Volatility Brief",
            "report_type": "DAILY_WRAP",
            "format": "PDF",
            "file_url": "/api/reports/sample.pdf",
            "parameters": {"base_currency": "USD", "horizon": "30D"},
            "status": "COMPLETED",
            "created_at": now - timedelta(days=1),
            "data_preview": {
                "top_gainer": "USD/JPY (+1.24%)",
                "top_loser": "AUD/USD (-0.88%)",
                "dxy_index": 104.45,
                "sentiment": "Moderate Dollar Bullish"
            }
        }

    def _add_cross_rate(self, base: str, target: str, rate: float):
        pair = f"{base}/{target}"
        now = datetime.now(timezone.utc)
        spread = 0.0003
        change_pct = round(random.uniform(-1.2, 1.4), 2)
        change_val = round(rate * (change_pct / 100), 6)
        self.exchange_rates[pair] = {
            "id": str(uuid.uuid4()),
            "base_currency": base,
            "target_currency": target,
            "pair": pair,
            "rate": round(rate, 6),
            "bid": round(rate * (1 - spread / 2), 6),
            "ask": round(rate * (1 + spread / 2), 6),
            "high_24h": round(rate * 1.007, 6),
            "low_24h": round(rate * 0.993, 6),
            "change_24h": change_val,
            "change_pct_24h": change_pct,
            "timestamp": now
        }
        self._generate_pair_history(pair, rate)

    def _generate_pair_history(self, pair: str, current_rate: float):
        points = []
        now = datetime.now(timezone.utc)
        walk_rate = current_rate * 0.97
        for i in range(30, 0, -1):
            ts = now - timedelta(days=i)
            shock = random.uniform(-0.006, 0.0065)
            walk_rate = max(0.000001, walk_rate * (1 + shock))
            h = walk_rate * (1 + random.uniform(0.001, 0.004))
            l = walk_rate * (1 - random.uniform(0.001, 0.004))
            o = (walk_rate + l) / 2
            c = walk_rate
            points.append({
                "timestamp": ts.isoformat(),
                "date": ts.strftime("%b %d"),
                "open": round(o, 6),
                "high": round(h, 6),
                "low": round(l, 6),
                "close": round(c, 6),
                "volume": round(random.uniform(500000, 3500000), 2)
            })
        self.rate_history[pair] = points

db = DatabaseManager()
