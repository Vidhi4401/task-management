from bson import ObjectId
from fastapi import HTTPException

from app.schemas.user import UserOut, RoleUpdate


def _serialize(doc: dict) -> UserOut:
    return UserOut(
        id=str(doc["_id"]),
        name=doc["name"],
        email=doc["email"],
        role=doc["role"],
        created_at=doc["created_at"],
    )


async def list_users(db) -> list:
    users = []
    async for doc in db.users.find().sort("created_at", -1):
        users.append(_serialize(doc))
    return users


async def update_user_role(user_id: str, data: RoleUpdate, db) -> UserOut:
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    doc = await db.users.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="User not found")

    await db.users.update_one({"_id": oid}, {"$set": {"role": data.role}})
    doc["role"] = data.role
    return _serialize(doc)


async def delete_user(user_id: str, db) -> dict:
    try:
        oid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    result = await db.users.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted"}
