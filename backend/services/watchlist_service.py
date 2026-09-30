from typing import List, Dict, Any, Optional
from backend.repositories.watchlist_repo import watchlist_repo
from backend.repositories.currency_repo import currency_repo
from backend.schemas.watchlist import WatchlistResponse, WatchlistItemResponse

class WatchlistService:
    def get_user_watchlists(self, user_id: str) -> List[WatchlistResponse]:
        lists = watchlist_repo.get_by_user(user_id)
        results = []
        for w in lists:
            raw_items = watchlist_repo.get_items(w["id"])
            item_objs = []
            for item in raw_items:
                pair_key = f"{item['base_currency']}/{item['target_currency']}"
                rate_info = currency_repo.get_rate_by_pair(pair_key)
                item_objs.append(WatchlistItemResponse(
                    id=item["id"],
                    watchlist_id=w["id"],
                    base_currency=item["base_currency"],
                    target_currency=item["target_currency"],
                    pair=pair_key,
                    added_at=item["added_at"],
                    rate_info=rate_info
                ))
            results.append(WatchlistResponse(
                id=w["id"],
                user_id=w["user_id"],
                name=w["name"],
                description=w.get("description"),
                is_default=w.get("is_default", False),
                created_at=w["created_at"],
                updated_at=w["updated_at"],
                items=item_objs
            ))
        return results

    def create_watchlist(self, user_id: str, name: str, description: Optional[str], is_default: bool) -> WatchlistResponse:
        record = watchlist_repo.create(user_id, name, description, is_default)
        return WatchlistResponse(
            id=record["id"],
            user_id=record["user_id"],
            name=record["name"],
            description=record.get("description"),
            is_default=record.get("is_default", False),
            created_at=record["created_at"],
            updated_at=record["updated_at"],
            items=[]
        )

    def add_pair_to_watchlist(self, watchlist_id: str, user_id: str, base_currency: str, target_currency: str) -> WatchlistItemResponse:
        w = watchlist_repo.get_by_id(watchlist_id, user_id)
        if not w:
            raise ValueError("Watchlist not found or unauthorized.")
        item = watchlist_repo.add_item(watchlist_id, base_currency, target_currency)
        pair_key = f"{item['base_currency']}/{item['target_currency']}"
        rate_info = currency_repo.get_rate_by_pair(pair_key)
        return WatchlistItemResponse(
            id=item["id"],
            watchlist_id=watchlist_id,
            base_currency=item["base_currency"],
            target_currency=item["target_currency"],
            pair=pair_key,
            added_at=item["added_at"],
            rate_info=rate_info
        )

    def remove_item(self, watchlist_id: str, item_id: str, user_id: str) -> bool:
        w = watchlist_repo.get_by_id(watchlist_id, user_id)
        if not w:
            raise ValueError("Watchlist not found or unauthorized.")
        return watchlist_repo.remove_item(watchlist_id, item_id)

    def delete_watchlist(self, watchlist_id: str, user_id: str) -> bool:
        return watchlist_repo.delete(watchlist_id, user_id)

watchlist_service = WatchlistService()
