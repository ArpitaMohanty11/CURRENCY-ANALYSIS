import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.repositories.database import db


class WatchlistRepository:
    def get_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        rows = db.sb_select("watchlists", {"user_id": user_id})
        if rows:
            for row in rows:
                db.watchlists[row["id"]] = row
            return rows
        return [w for w in db.watchlists.values() if w["user_id"] == user_id]

    def get_by_id(self, watchlist_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        w = db.watchlists.get(watchlist_id)
        if w and w["user_id"] == user_id:
            return w
        rows = db.sb_select("watchlists", {"id": watchlist_id})
        if rows and rows[0]["user_id"] == user_id:
            db.watchlists[watchlist_id] = rows[0]
            return rows[0]
        return None

    def create(self, user_id: str, name: str, description: Optional[str], is_default: bool) -> Dict[str, Any]:
        w_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)

        if is_default:
            # Unset existing defaults in Supabase
            db.sb_update("watchlists", {"user_id": user_id, "is_default": True}, {"is_default": False})
            for item in db.watchlists.values():
                if item["user_id"] == user_id:
                    item["is_default"] = False

        record = {
            "id": w_id,
            "user_id": user_id,
            "name": name,
            "description": description,
            "is_default": is_default,
            "created_at": now.isoformat(),
            "updated_at": now.isoformat()
        }
        db.sb_upsert("watchlists", record)
        db.watchlists[w_id] = {**record, "created_at": now, "updated_at": now}
        return db.watchlists[w_id]

    def update(self, watchlist_id: str, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        w = self.get_by_id(watchlist_id, user_id)
        if not w:
            return None
        now = datetime.now(timezone.utc)
        for k, v in updates.items():
            if v is not None:
                w[k] = v
        w["updated_at"] = now
        db.sb_update("watchlists", {"id": watchlist_id}, {**updates, "updated_at": now.isoformat()})
        db.watchlists[watchlist_id] = w
        return w

    def delete(self, watchlist_id: str, user_id: str) -> bool:
        w = self.get_by_id(watchlist_id, user_id)
        if not w:
            return False
        # Delete items first
        db.sb_delete("watchlist_items", {"watchlist_id": watchlist_id})
        db.sb_delete("watchlists", {"id": watchlist_id})
        items_to_del = [iid for iid, item in db.watchlist_items.items() if item["watchlist_id"] == watchlist_id]
        for iid in items_to_del:
            del db.watchlist_items[iid]
        del db.watchlists[watchlist_id]
        return True

    def get_items(self, watchlist_id: str) -> List[Dict[str, Any]]:
        rows = db.sb_select("watchlist_items", {"watchlist_id": watchlist_id})
        if rows:
            for row in rows:
                db.watchlist_items[row["id"]] = row
            return rows
        return [item for item in db.watchlist_items.values() if item["watchlist_id"] == watchlist_id]

    def add_item(self, watchlist_id: str, base_currency: str, target_currency: str) -> Dict[str, Any]:
        base = base_currency.upper()
        target = target_currency.upper()
        # Check duplicate in cache
        for item in self.get_items(watchlist_id):
            if item["base_currency"] == base and item["target_currency"] == target:
                return item

        item_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        record = {
            "id": item_id,
            "watchlist_id": watchlist_id,
            "base_currency": base,
            "target_currency": target,
            "added_at": now.isoformat()
        }
        db.sb_upsert("watchlist_items", record)
        db.watchlist_items[item_id] = {**record, "added_at": now}
        return db.watchlist_items[item_id]

    def remove_item(self, watchlist_id: str, item_id: str) -> bool:
        item = db.watchlist_items.get(item_id)
        if item and item["watchlist_id"] == watchlist_id:
            db.sb_delete("watchlist_items", {"id": item_id})
            del db.watchlist_items[item_id]
            return True
        return False


watchlist_repo = WatchlistRepository()
