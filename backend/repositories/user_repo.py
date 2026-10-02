import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from backend.repositories.database import db


class UserRepository:
    def get_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        # Check cache first
        if user_id in db.users:
            return db.users[user_id]
        # Try Supabase
        rows = db.sb_select("users", {"id": user_id})
        if rows:
            db.users[user_id] = rows[0]
            return rows[0]
        return None

    def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        target = email.lower().strip()
        # Check cache
        for u in db.users.values():
            if u["email"].lower().strip() == target:
                return u
        # Try Supabase
        client = db._client()
        if client:
            try:
                res = client.table("users").select("*").eq("email", target).execute()
                if res.data:
                    user = res.data[0]
                    db.users[user["id"]] = user
                    return user
            except Exception as e:
                print(f"[UserRepo.get_by_email] {e}")
        return None

    def create_user(self, email: str, hashed_password: str, full_name: str, role: str = "trader") -> Dict[str, Any]:
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        user = {
            "id": user_id,
            "email": email.lower().strip(),
            "hashed_password": hashed_password,
            "full_name": full_name,
            "role": role,
            "is_active": True,
            "created_at": now.isoformat()
        }
        # Persist to Supabase
        db.sb_upsert("users", user)
        # Cache locally
        db.users[user_id] = {**user, "created_at": now}

        # Create default preferences
        prefs = {
            "user_id": user_id,
            "base_currency": "USD",
            "theme": "dark",
            "refresh_interval_seconds": 15,
            "notification_email": True,
            "notification_in_app": True
        }
        db.sb_upsert("user_preferences", prefs)
        db.user_preferences[user_id] = prefs
        return db.users[user_id]

    def get_preferences(self, user_id: str) -> Dict[str, Any]:
        if user_id in db.user_preferences:
            return db.user_preferences[user_id]
        # Try Supabase
        rows = db.sb_select("user_preferences", {"user_id": user_id})
        if rows:
            db.user_preferences[user_id] = rows[0]
            return rows[0]
        # Create defaults
        prefs = {
            "user_id": user_id,
            "base_currency": "USD",
            "theme": "dark",
            "refresh_interval_seconds": 15,
            "notification_email": True,
            "notification_in_app": True
        }
        db.sb_upsert("user_preferences", prefs)
        db.user_preferences[user_id] = prefs
        return prefs

    def update_preferences(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        current = self.get_preferences(user_id)
        current.update({k: v for k, v in updates.items() if v is not None})
        db.sb_upsert("user_preferences", current)
        db.user_preferences[user_id] = current
        return current

    def get_all_users(self) -> List[Dict[str, Any]]:
        # Refresh from Supabase
        rows = db.sb_select("users")
        if rows:
            for row in rows:
                db.users[row["id"]] = row
        return list(db.users.values())


user_repo = UserRepository()
