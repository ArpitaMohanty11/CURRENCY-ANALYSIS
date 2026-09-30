import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.repositories.database import db

class WatchlistRepository:
    def get_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        return [w for w in db.watchlists.values() if w["user_id"] == user_id]

    def get_by_id(self, watchlist_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        w = db.watchlists.get(watchlist_id)
        if w and w["user_id"] == user_id:
            return w
        return None

    def create(self, user_id: str, name: str, description: Optional[str], is_default: bool) -> Dict[str, Any]:
        w_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        if is_default:
            # Unset any other default
            for item in db.watchlists.values():
                if item["user_id"] == user_id:
                    item["is_default"] = False

        record = {
            "id": w_id,
            "user_id": user_id,
            "name": name,
            "description": description,
            "is_default": is_default,
            "created_at": now,
            "updated_at": now
        }
        db.watchlists[w_id] = record
        return record

    def update(self, watchlist_id: str, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        w = self.get_by_id(watchlist_id, user_id)
        if not w:
            return None
        now = datetime.now(timezone.utc)
        for k, v in updates.items():
            if v is not None:
                w[k] = v
        w["updated_at"] = now
        return w

    def delete(self, watchlist_id: str, user_id: str) -> bool:
        w = self.get_by_id(watchlist_id, user_id)
        if not w:
            return False
        # Remove items
        items_to_del = [item_id for item_id, item in db.watchlist_items.items() if item["watchlist_id"] == watchlist_id]
        for item_id in items_to_del:
            del db.watchlist_items[item_id]
        del db.watchlists[watchlist_id]
        return True

    def get_items(self, watchlist_id: str) -> List[Dict[str, Any]]:
        return [item for item in db.watchlist_items.values() if item["watchlist_id"] == watchlist_id]

    def add_item(self, watchlist_id: str, base_currency: str, target_currency: str) -> Dict[str, Any]:
        base = base_currency.upper()
        target = target_currency.upper()
        # Check duplicate
        for item in self.get_items(watchlist_id):
            if item["base_currency"] == base and item["target_currency"] == target:
                return item

        item_id = str(uuid.uuid4())
        record = {
            "id": item_id,
            "watchlist_id": watchlist_id,
            "base_currency": base,
            "target_currency": target,
            "added_at": datetime.now(timezone.utc)
        }
        db.watchlist_items[item_id] = record
        return record

    def remove_item(self, watchlist_id: str, item_id: str) -> bool:
        item = db.watchlist_items.get(item_id)
        if item and item["watchlist_id"] == watchlist_id:
            del db.watchlist_items[item_id]
            return True
        return False

watchlist_repo = WatchlistRepository()
