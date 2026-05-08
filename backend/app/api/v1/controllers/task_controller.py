from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from fastapi import HTTPException, status

from app.schemas.task import TaskCreate, TaskUpdate, TaskOut


def _serialize(doc: dict, owner_name: str = None) -> TaskOut:
    return TaskOut(
        id=str(doc["_id"]),
        title=doc["title"],
        description=doc.get("description"),
        priority=doc["priority"],
        status=doc["status"],
        due_date=doc.get("due_date"),
        owner_id=str(doc["owner_id"]),
        owner_name=owner_name,
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


async def create_task(data: TaskCreate, current_user: dict, db) -> TaskOut:
    doc = {
        **data.model_dump(),
        "owner_id": ObjectId(current_user["sub"]),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    result = await db.tasks.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc, owner_name=current_user.get("name"))


async def get_tasks(
    current_user: dict,
    db,
    status_filter: Optional[str] = None,
    priority_filter: Optional[str] = None,
) -> List[TaskOut]:
    query = {}
    # Admins see all tasks; users only see their own
    if current_user.get("role") != "admin":
        query["owner_id"] = ObjectId(current_user["sub"])
    if status_filter:
        query["status"] = status_filter
    if priority_filter:
        query["priority"] = priority_filter

    tasks = []
    async for doc in db.tasks.find(query).sort("created_at", -1):
        # Fetch owner name
        owner = await db.users.find_one({"_id": doc["owner_id"]})
        owner_name = owner["name"] if owner else "Unknown"
        tasks.append(_serialize(doc, owner_name))
    return tasks


async def get_task(task_id: str, current_user: dict, db) -> TaskOut:
    try:
        oid = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")

    doc = await db.tasks.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Task not found")

    # Only owner or admin can view
    if current_user.get("role") != "admin" and str(doc["owner_id"]) != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")

    owner = await db.users.find_one({"_id": doc["owner_id"]})
    return _serialize(doc, owner["name"] if owner else "Unknown")


async def update_task(task_id: str, data: TaskUpdate, current_user: dict, db) -> TaskOut:
    try:
        oid = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")

    doc = await db.tasks.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.get("role") != "admin" and str(doc["owner_id"]) != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")

    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    updates["updated_at"] = datetime.utcnow()
    await db.tasks.update_one({"_id": oid}, {"$set": updates})

    updated = await db.tasks.find_one({"_id": oid})
    owner = await db.users.find_one({"_id": updated["owner_id"]})
    return _serialize(updated, owner["name"] if owner else "Unknown")


async def delete_task(task_id: str, current_user: dict, db) -> dict:
    try:
        oid = ObjectId(task_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid task ID")

    doc = await db.tasks.find_one({"_id": oid})
    if not doc:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.get("role") != "admin" and str(doc["owner_id"]) != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")

    await db.tasks.delete_one({"_id": oid})
    return {"message": "Task deleted successfully"}
