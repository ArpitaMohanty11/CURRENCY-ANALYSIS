import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from backend.repositories.database import db

class UserRepository:
    def get_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        return db.users.get(user_id)

    def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        target = email.lower().strip()
        for u in db.users.values():
            if u["email"].lower().strip() == target:
                return u
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
            "created_at": now
        }
        db.users[user_id] = user
        db.user_preferences[user_id] = {
            "base_currency": "USD",
            "theme": "dark",
            "refresh_interval_seconds": 15,
            "notification_email": True,
            "notification_in_app": True
        }
        return user

    def get_preferences(self, user_id: str) -> Dict[str, Any]:
        if user_id not in db.user_preferences:
            db.user_preferences[user_id] = {
                "base_currency": "USD",
                "theme": "dark",
                "refresh_interval_seconds": 15,
                "notification_email": True,
                "notification_in_app": True
            }
        return db.user_preferences[user_id]

    def update_preferences(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        current = self.get_preferences(user_id)
        current.update({k: v for k, v in updates.items() if v is not None})
        db.user_preferences[user_id] = current
        return current

    def get_all_users(self) -> List[Dict[str, Any]]:
        return list(db.users.values())

user_repo = UserRepository()
