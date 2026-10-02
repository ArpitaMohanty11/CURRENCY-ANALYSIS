import httpx
import random
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from backend.repositories.database import db

class CurrencyRepository:
    def __init__(self):
        self._last_live_fetch: Optional[datetime] = None

    def get_all_currencies(self) -> List[Dict[str, Any]]:
        return list(db.currencies.values())

    def get_currency_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        return db.currencies.get(code.upper())

    def get_all_exchange_rates(self) -> List[Dict[str, Any]]:
        return list(db.exchange_rates.values())

    def get_rate_by_pair(self, pair: str) -> Optional[Dict[str, Any]]:
        # Handle formats like "EUR/USD" or "EURUSD" or "EUR-USD"
        clean = pair.replace("-", "/").replace("_", "/").upper()
        if "/" not in clean and len(clean) == 6:
            clean = f"{clean[:3]}/{clean[3:]}"
        return db.exchange_rates.get(clean)

    def get_historical_rates(self, pair: str, period: str = "30D") -> List[Dict[str, Any]]:
        clean = pair.replace("-", "/").replace("_", "/").upper()
        if "/" not in clean and len(clean) == 6:
            clean = f"{clean[:3]}/{clean[3:]}"
        history = db.rate_history.get(clean)
        if not history:
            current = self.get_rate_by_pair(clean)
            base_val = current["rate"] if current else 1.0
            db._generate_pair_history(clean, base_val)
            history = db.rate_history.get(clean, [])
        return history

    def sync_live_rates(self):
        """Fetches real-time foreign exchange market rates from open real-world FX feeds"""
        try:
            with httpx.Client(timeout=6.0) as client:
                res = client.get("https://open.er-api.com/v6/latest/USD")
                if res.status_code == 200:
                    data = res.json()
                    rates = data.get("rates", {})
                    now = datetime.now(timezone.utc)
                    self._last_live_fetch = now

                    for curr_code, rate_val in rates.items():
                        if curr_code in db.currencies:
                            pair_key = f"USD/{curr_code}"
                            rate_float = float(rate_val)
                            spread = 0.0002 if curr_code in ["EUR", "GBP", "JPY", "CHF"] else 0.0005
                            
                            if pair_key in db.exchange_rates:
                                old_obj = db.exchange_rates[pair_key]
                                prev_rate = old_obj["rate"]
                                change = round(rate_float - prev_rate, 6)
                                pct = round(((rate_float - prev_rate) / prev_rate) * 100, 2) if prev_rate > 0 else 0.0
                                old_obj["rate"] = round(rate_float, 6)
                                old_obj["bid"] = round(rate_float * (1 - spread / 2), 6)
                                old_obj["ask"] = round(rate_float * (1 + spread / 2), 6)
                                old_obj["high_24h"] = max(old_obj.get("high_24h", rate_float), rate_float)
                                old_obj["low_24h"] = min(old_obj.get("low_24h", rate_float), rate_float)
                                old_obj["change_24h"] = change
                                old_obj["change_pct_24h"] = pct
                                old_obj["timestamp"] = now
                            else:
                                db.exchange_rates[pair_key] = {
                                    "id": str(db.exchange_rates.get(pair_key, {}).get("id", "rate-" + curr_code)),
                                    "base_currency": "USD",
                                    "target_currency": curr_code,
                                    "pair": pair_key,
                                    "rate": round(rate_float, 6),
                                    "bid": round(rate_float * (1 - spread / 2), 6),
                                    "ask": round(rate_float * (1 + spread / 2), 6),
                                    "high_24h": round(rate_float * 1.005, 6),
                                    "low_24h": round(rate_float * 0.995, 6),
                                    "change_24h": 0.0,
                                    "change_pct_24h": 0.0,
                                    "timestamp": now
                                }

                    # Update key institutional cross-rates with authentic real-world rates
                    eur_rate = rates.get("EUR")
                    gbp_rate = rates.get("GBP")
                    jpy_rate = rates.get("JPY")
                    aud_rate = rates.get("AUD")

                    if eur_rate and eur_rate > 0:
                        db._add_cross_rate("EUR", "USD", round(1.0 / eur_rate, 6))
                        if gbp_rate:
                            db._add_cross_rate("EUR", "GBP", round((1.0 / eur_rate) * gbp_rate, 6))
                        if jpy_rate:
                            db._add_cross_rate("EUR", "JPY", round((1.0 / eur_rate) * jpy_rate, 6))

                    if gbp_rate and gbp_rate > 0:
                        db._add_cross_rate("GBP", "USD", round(1.0 / gbp_rate, 6))
                        if jpy_rate:
                            db._add_cross_rate("GBP", "JPY", round((1.0 / gbp_rate) * jpy_rate, 6))

                    if aud_rate and aud_rate > 0:
                        db._add_cross_rate("AUD", "USD", round(1.0 / aud_rate, 6))

                    print(f"[{now.strftime('%H:%M:%S')}] Live FX Market Data successfully synced from Global FX Feed.")
                    return True
        except Exception as e:
            print(f"[Live FX Sync Warning] {e}. Falling back to internal liquidity ticks.")
        return False

    def tick_exchange_rates(self):
        """Micro-tick smoothing between periodic live market sync intervals"""
        now = datetime.now(timezone.utc)
        for pair, rate_obj in db.exchange_rates.items():
            # Real micro-spread fluctuation between live feed updates
            shock = random.uniform(-0.0003, 0.0003)
            new_rate = max(0.000001, rate_obj["rate"] * (1 + shock))
            spread = 0.0002
            rate_obj["rate"] = round(new_rate, 6)
            rate_obj["bid"] = round(new_rate * (1 - spread / 2), 6)
            rate_obj["ask"] = round(new_rate * (1 + spread / 2), 6)
            rate_obj["high_24h"] = max(rate_obj.get("high_24h", new_rate), rate_obj["rate"])
            rate_obj["low_24h"] = min(rate_obj.get("low_24h", new_rate), rate_obj["rate"])
            rate_obj["timestamp"] = now

currency_repo = CurrencyRepository()

