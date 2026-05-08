from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from app.db.database import get_db
from app.core.security import get_current_user
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut
from app.api.v1.controllers import task_controller

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("", response_model=TaskOut, status_code=201, summary="Create a task")
async def create(
    data: TaskCreate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await task_controller.create_task(data, current_user, db)


@router.get("", response_model=List[TaskOut], summary="List tasks")
async def list_tasks(
    status: Optional[str] = Query(None, description="Filter by status: todo|in_progress|done"),
    priority: Optional[str] = Query(None, description="Filter by priority: low|medium|high"),
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Users see own tasks; admins see all tasks."""
    return await task_controller.get_tasks(current_user, db, status, priority)


@router.get("/{task_id}", response_model=TaskOut, summary="Get a single task")
async def get_one(
    task_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await task_controller.get_task(task_id, current_user, db)


@router.put("/{task_id}", response_model=TaskOut, summary="Update a task")
async def update(
    task_id: str,
    data: TaskUpdate,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await task_controller.update_task(task_id, data, current_user, db)


@router.delete("/{task_id}", summary="Delete a task")
async def delete(
    task_id: str,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    return await task_controller.delete_task(task_id, current_user, db)
