from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.repositories.currency_repo import currency_repo
from backend.schemas.currency import ConvertResponse, MultiConvertResponse, MultiConvertItem, TopMoversResponse

class CurrencyService:
    def get_currencies(self) -> List[Dict[str, Any]]:
        return currency_repo.get_all_currencies()

    def get_exchange_rates(self) -> List[Dict[str, Any]]:
        return currency_repo.get_all_exchange_rates()

    def get_rate(self, base: str, target: str) -> Optional[Dict[str, Any]]:
        base_u = base.upper()
        target_u = target.upper()
        if base_u == target_u:
            now = datetime.now(timezone.utc)
            return {
                "pair": f"{base_u}/{target_u}",
                "base_currency": base_u,
                "target_currency": target_u,
                "rate": 1.0,
                "bid": 1.0,
                "ask": 1.0,
                "high_24h": 1.0,
                "low_24h": 1.0,
                "change_24h": 0.0,
                "change_pct_24h": 0.0,
                "timestamp": now
            }
        
        # Direct pair
        direct = currency_repo.get_rate_by_pair(f"{base_u}/{target_u}")
        if direct:
            return direct
            
        # Inverse pair
        inverse = currency_repo.get_rate_by_pair(f"{target_u}/{base_u}")
        if inverse and inverse["rate"] > 0:
            now = datetime.now(timezone.utc)
            inv_rate = round(1.0 / inverse["rate"], 6)
            return {
                "pair": f"{base_u}/{target_u}",
                "base_currency": base_u,
                "target_currency": target_u,
                "rate": inv_rate,
                "bid": round(1.0 / inverse["ask"], 6),
                "ask": round(1.0 / inverse["bid"], 6),
                "high_24h": round(1.0 / inverse["low_24h"], 6),
                "low_24h": round(1.0 / inverse["high_24h"], 6),
                "change_24h": round(-inverse["change_24h"] * (inv_rate / inverse["rate"]), 6),
                "change_pct_24h": round(-inverse["change_pct_24h"], 2),
                "timestamp": now
            }
            
        # Synthetic triangulation via USD
        usd_to_base = currency_repo.get_rate_by_pair(f"USD/{base_u}")
        usd_to_target = currency_repo.get_rate_by_pair(f"USD/{target_u}")
        if usd_to_base and usd_to_target and usd_to_base["rate"] > 0:
            rate = round(usd_to_target["rate"] / usd_to_base["rate"], 6)
            spread = 0.0004
            now = datetime.now(timezone.utc)
            return {
                "pair": f"{base_u}/{target_u}",
                "base_currency": base_u,
                "target_currency": target_u,
                "rate": rate,
                "bid": round(rate * (1 - spread / 2), 6),
                "ask": round(rate * (1 + spread / 2), 6),
                "high_24h": round(rate * 1.008, 6),
                "low_24h": round(rate * 0.992, 6),
                "change_24h": round(rate * 0.002, 6),
                "change_pct_24h": 0.20,
                "timestamp": now
            }
        return None

    def convert_currency(self, from_curr: str, to_curr: str, amount: float) -> ConvertResponse:
        rate_obj = self.get_rate(from_curr, to_curr)
        if not rate_obj:
            raise ValueError(f"Unable to calculate exchange rate for {from_curr}/{to_curr}")
        
        converted = round(amount * rate_obj["rate"], 4)
        spread = round(rate_obj["ask"] - rate_obj["bid"], 6)
        return ConvertResponse(
            from_currency=from_curr.upper(),
            to_currency=to_curr.upper(),
            amount=amount,
            rate=rate_obj["rate"],
            converted_amount=converted,
            bid=rate_obj["bid"],
            ask=rate_obj["ask"],
            spread=spread,
            timestamp=rate_obj["timestamp"]
        )

    def multi_convert(self, base_currency: str, amount: float, targets: List[str]) -> MultiConvertResponse:
        results = []
        for t in targets:
            rate_obj = self.get_rate(base_currency, t)
            if rate_obj:
                results.append(MultiConvertItem(
                    currency=t.upper(),
                    rate=rate_obj["rate"],
                    converted_amount=round(amount * rate_obj["rate"], 4),
                    change_pct_24h=rate_obj["change_pct_24h"]
                ))
        return MultiConvertResponse(
            base_currency=base_currency.upper(),
            amount=amount,
            results=results,
            timestamp=datetime.now(timezone.utc)
        )

    def get_top_movers(self) -> TopMoversResponse:
        rates = currency_repo.get_all_exchange_rates()
        sorted_rates = sorted(rates, key=lambda x: x["change_pct_24h"], reverse=True)
        top_gainers = sorted_rates[:5]
        top_losers = sorted_rates[-5:][::-1]

        # Calculate market overview metrics
        advances = sum(1 for r in rates if r["change_pct_24h"] > 0)
        declines = sum(1 for r in rates if r["change_pct_24h"] < 0)
        unchanged = len(rates) - advances - declines
        avg_vol = round(sum(abs(r["change_pct_24h"]) for r in rates) / max(len(rates), 1), 2)

        return TopMoversResponse(
            top_gainers=top_gainers,
            top_losers=top_losers,
            market_overview={
                "total_tracked_pairs": len(rates),
                "advances": advances,
                "declines": declines,
                "unchanged": unchanged,
                "average_volatility_pct": avg_vol,
                "dxy_index": 104.28,
                "dxy_change_pct": 0.18,
                "market_regime": "Risk-On Institutional Flow",
                "last_sync": datetime.now(timezone.utc).isoformat()
            }
        )

currency_service = CurrencyService()
