import random
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from backend.repositories.database import db

class CurrencyRepository:
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

    def tick_exchange_rates(self):
        """Simulates live tick updates across foreign exchange market feeds"""
        now = datetime.now(timezone.utc)
        for pair, rate_obj in db.exchange_rates.items():
            # Small random micro-tick between -0.15% and +0.15%
            shock = random.uniform(-0.0015, 0.0015)
            new_rate = max(0.000001, rate_obj["rate"] * (1 + shock))
            spread = 0.0002
            rate_obj["rate"] = round(new_rate, 6)
            rate_obj["bid"] = round(new_rate * (1 - spread / 2), 6)
            rate_obj["ask"] = round(new_rate * (1 + spread / 2), 6)
            rate_obj["high_24h"] = max(rate_obj["high_24h"], rate_obj["rate"])
            rate_obj["low_24h"] = min(rate_obj["low_24h"], rate_obj["rate"])
            rate_obj["timestamp"] = now
            # Recalculate 24h change pct
            initial = (rate_obj["high_24h"] + rate_obj["low_24h"]) / 2
            rate_obj["change_pct_24h"] = round(((new_rate - initial) / initial) * 100, 2)
            rate_obj["change_24h"] = round(new_rate - initial, 6)

currency_repo = CurrencyRepository()
