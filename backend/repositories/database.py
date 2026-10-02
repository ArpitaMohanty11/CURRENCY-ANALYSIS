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
    Database Manager — Supabase PostgreSQL as primary store,
    in-memory dicts as fast cache and fallback.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseManager, cls).__new__(cls)
            cls._instance._init_db()
        return cls._instance

    def _init_db(self):
        self.supabase: Optional[Any] = None
        self.supabase_admin: Optional[Any] = None  # service role client (bypasses RLS)

        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                print("[DB] Supabase anon client connected.")
            except Exception as e:
                print(f"[DB] Supabase anon connection failed: {e}")

        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            try:
                self.supabase_admin = create_client(
                    settings.SUPABASE_URL,
                    settings.SUPABASE_SERVICE_ROLE_KEY
                )
                print("[DB] Supabase service-role client connected (RLS bypass).")
            except Exception as e:
                print(f"[DB] Supabase admin connection failed: {e}")

        # ── In-memory cache (always populated) ──────────────────────────────
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

        self._seed_currencies()
        self._seed_rates()
        self._load_from_supabase()

    # ── Supabase helpers ─────────────────────────────────────────────────────

    def _client(self):
        """Return best available client: admin > anon > None"""
        return self.supabase_admin or self.supabase

    def sb_select(self, table: str, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Run a SELECT on Supabase, return rows or []."""
        client = self._client()
        if not client:
            return []
        try:
            q = client.table(table).select("*")
            if filters:
                for col, val in filters.items():
                    q = q.eq(col, val)
            res = q.execute()
            return res.data or []
        except Exception as e:
            print(f"[SB SELECT {table}] {e}")
            return []

    def sb_upsert(self, table: str, record: Dict[str, Any]) -> bool:
        """Upsert a row into Supabase."""
        client = self._client()
        if not client:
            return False
        try:
            # Serialize datetimes
            clean = _serialize(record)
            client.table(table).upsert(clean).execute()
            return True
        except Exception as e:
            print(f"[SB UPSERT {table}] {e}")
            return False

    def sb_insert(self, table: str, record: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Insert a row and return the created record."""
        client = self._client()
        if not client:
            return None
        try:
            clean = _serialize(record)
            res = client.table(table).insert(clean).execute()
            return res.data[0] if res.data else None
        except Exception as e:
            print(f"[SB INSERT {table}] {e}")
            return None

    def sb_update(self, table: str, filters: Dict[str, Any], updates: Dict[str, Any]) -> bool:
        """Update rows matching filters."""
        client = self._client()
        if not client:
            return False
        try:
            clean = _serialize(updates)
            q = client.table(table).update(clean)
            for col, val in filters.items():
                q = q.eq(col, val)
            q.execute()
            return True
        except Exception as e:
            print(f"[SB UPDATE {table}] {e}")
            return False

    def sb_delete(self, table: str, filters: Dict[str, Any]) -> bool:
        """Delete rows matching filters."""
        client = self._client()
        if not client:
            return False
        try:
            q = client.table(table).delete()
            for col, val in filters.items():
                q = q.eq(col, val)
            q.execute()
            return True
        except Exception as e:
            print(f"[SB DELETE {table}] {e}")
            return False

    # ── Supabase loader ──────────────────────────────────────────────────────

    def _load_from_supabase(self):
        """Load users, preferences, watchlists, alerts, reports from Supabase into cache."""
        if not self._client():
            print("[DB] No Supabase client — using in-memory seed data only.")
            self._seed_demo_users_local()
            return

        print("[DB] Loading data from Supabase...")

        # Users
        for row in self.sb_select("users"):
            self.users[row["id"]] = row

        # User preferences
        for row in self.sb_select("user_preferences"):
            self.user_preferences[row["user_id"]] = row

        # Watchlists
        for row in self.sb_select("watchlists"):
            self.watchlists[row["id"]] = row

        # Watchlist items
        for row in self.sb_select("watchlist_items"):
            self.watchlist_items[row["id"]] = row

        # Alerts
        for row in self.sb_select("alerts"):
            self.alerts[row["id"]] = row

        # Alert history (last 200)
        for row in self.sb_select("alert_history"):
            self.alert_history.append(row)
        self.alert_history.sort(key=lambda x: x.get("created_at", ""), reverse=True)

        # Reports
        for row in self.sb_select("reports"):
            self.reports[row["id"]] = row

        print(f"[DB] Loaded: {len(self.users)} users, {len(self.watchlists)} watchlists, "
              f"{len(self.alerts)} alerts, {len(self.reports)} reports.")

        # Seed demo users into Supabase if none exist
        if not self.users:
            print("[DB] No users found in Supabase — seeding demo users.")
            self._seed_demo_users_supabase()

    # ── Currency / rate seeding (always local — updated by live sync) ────────

    def _seed_currencies(self):
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

    def _seed_rates(self):
        """Seed baseline rates that will be replaced by live sync within 60s."""
        rates_map = {
            "EUR": 0.9245, "GBP": 0.7892, "JPY": 154.32, "CHF": 0.8840,
            "AUD": 1.5320, "CAD": 1.3785, "NZD": 1.6840, "INR": 86.42,
            "SGD": 1.3420, "HKD": 7.7810, "CNY": 7.2340, "AED": 3.6725,
            "KRW": 1385.20, "BRL": 5.4820, "MXN": 19.3450, "ZAR": 18.2400,
            "SEK": 10.4520, "NOK": 10.8240, "BTC": 0.00001520,
        }
        now = datetime.now(timezone.utc)
        for curr, base_rate in rates_map.items():
            spread = 0.0002 if curr in {"EUR", "GBP", "JPY", "CHF"} else 0.0006
            pair_key = f"USD/{curr}"
            self.exchange_rates[pair_key] = {
                "id": str(uuid.uuid4()),
                "base_currency": "USD",
                "target_currency": curr,
                "pair": pair_key,
                "rate": round(base_rate, 6),
                "bid": round(base_rate * (1 - spread / 2), 6),
                "ask": round(base_rate * (1 + spread / 2), 6),
                "high_24h": round(base_rate * 1.005, 6),
                "low_24h": round(base_rate * 0.995, 6),
                "change_24h": 0.0,
                "change_pct_24h": 0.0,
                "timestamp": now
            }
            self._generate_pair_history(pair_key, base_rate)

        # Seed cross rates
        self._add_cross_rate("EUR", "USD", 1 / rates_map["EUR"])
        self._add_cross_rate("GBP", "USD", 1 / rates_map["GBP"])
        self._add_cross_rate("EUR", "GBP", (1 / rates_map["EUR"]) * rates_map["GBP"])
        self._add_cross_rate("EUR", "JPY", (1 / rates_map["EUR"]) * rates_map["JPY"])
        self._add_cross_rate("GBP", "JPY", (1 / rates_map["GBP"]) * rates_map["JPY"])
        self._add_cross_rate("AUD", "USD", 1 / rates_map["AUD"])

    def _seed_demo_users_local(self):
        """Fallback: seed demo users into in-memory only (no Supabase)."""
        now = datetime.now(timezone.utc)

        admin_id = "00000000-0000-0000-0000-000000000001"
        trader_id = "00000000-0000-0000-0000-000000000002"

        # Pre-computed bcrypt hashes (admin123 and trader123)
        admin_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN1oA3p3kzBpGCeK5Vn2O"
        trader_hash = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"

        self.users[admin_id] = {
            "id": admin_id, "email": "admin@currencyanalysis.com",
            "hashed_password": admin_hash,
            "full_name": "Admin User", "role": "admin",
            "is_active": True, "created_at": now
        }
        self.users[trader_id] = {
            "id": trader_id, "email": "trader@currencyanalysis.com",
            "hashed_password": trader_hash,
            "full_name": "Trader User", "role": "trader",
            "is_active": True, "created_at": now
        }
        for uid in [admin_id, trader_id]:
            self.user_preferences[uid] = {
                "user_id": uid, "base_currency": "USD", "theme": "dark",
                "refresh_interval_seconds": 15,
                "notification_email": True, "notification_in_app": True
            }

    def _seed_demo_users_supabase(self):
        """Seed demo users into Supabase if the users table is empty."""
        now = datetime.now(timezone.utc)

        # Pre-computed bcrypt hashes — admin123 and trader123
        admin_hash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN1oA3p3kzBpGCeK5Vn2O"
        trader_hash = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"

        demo_users = [
            {
                "id": "00000000-0000-0000-0000-000000000001",
                "email": "admin@currencyanalysis.com",
                "hashed_password": admin_hash,
                "full_name": "Admin User",
                "role": "admin",
                "is_active": True,
                "created_at": now.isoformat()
            },
            {
                "id": "00000000-0000-0000-0000-000000000002",
                "email": "trader@currencyanalysis.com",
                "hashed_password": trader_hash,
                "full_name": "Trader User",
                "role": "trader",
                "is_active": True,
                "created_at": now.isoformat()
            }
        ]

        for u in demo_users:
            result = self.sb_upsert("users", u)
            if result:
                self.users[u["id"]] = u
                prefs = {
                    "user_id": u["id"], "base_currency": "USD", "theme": "dark",
                    "refresh_interval_seconds": 15,
                    "notification_email": True, "notification_in_app": True
                }
                self.sb_upsert("user_preferences", prefs)
                self.user_preferences[u["id"]] = prefs

        # Default watchlist for trader
        trader_id = "00000000-0000-0000-0000-000000000002"
        w_id = str(uuid.uuid4())
        watchlist = {
            "id": w_id, "user_id": trader_id,
            "name": "Institutional G10 & Asia FX",
            "description": "Core liquidity pairs monitored for institutional flow",
            "is_default": True,
            "created_at": now.isoformat(), "updated_at": now.isoformat()
        }
        self.sb_upsert("watchlists", watchlist)
        self.watchlists[w_id] = watchlist

        for base, target in [("EUR","USD"),("GBP","USD"),("USD","JPY"),("USD","INR"),("USD","CHF"),("AUD","USD")]:
            item_id = str(uuid.uuid4())
            item = {
                "id": item_id, "watchlist_id": w_id,
                "base_currency": base, "target_currency": target,
                "added_at": now.isoformat()
            }
            self.sb_upsert("watchlist_items", item)
            self.watchlist_items[item_id] = item

        print("[DB] Demo users and default watchlist seeded into Supabase.")

    # ── Helpers ──────────────────────────────────────────────────────────────

    def _add_cross_rate(self, base: str, target: str, rate: float):
        pair = f"{base}/{target}"
        now = datetime.now(timezone.utc)
        spread = 0.0003
        self.exchange_rates[pair] = {
            "id": str(uuid.uuid4()),
            "base_currency": base, "target_currency": target,
            "pair": pair,
            "rate": round(rate, 6),
            "bid": round(rate * (1 - spread / 2), 6),
            "ask": round(rate * (1 + spread / 2), 6),
            "high_24h": round(rate * 1.007, 6),
            "low_24h": round(rate * 0.993, 6),
            "change_24h": 0.0, "change_pct_24h": 0.0,
            "timestamp": now
        }
        self._generate_pair_history(pair, rate)

    def _generate_pair_history(self, pair: str, current_rate: float):
        """Generate 30-day synthetic history (replaced by real data on first live sync)."""
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
            points.append({
                "timestamp": ts.isoformat(),
                "date": ts.strftime("%b %d"),
                "open": round(o, 6), "high": round(h, 6),
                "low": round(l, 6), "close": round(walk_rate, 6),
                "volume": round(random.uniform(500_000, 3_500_000), 2)
            })
        self.rate_history[pair] = points


# ── Serialization helper ─────────────────────────────────────────────────────

def _serialize(obj: Any) -> Any:
    """Recursively convert datetime objects to ISO strings for Supabase JSON."""
    if isinstance(obj, dict):
        return {k: _serialize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_serialize(i) for i in obj]
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj


db = DatabaseManager()
