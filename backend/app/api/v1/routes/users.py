from typing import List
from fastapi import APIRouter, Depends
from app.db.database import get_db
from app.core.security import require_admin
from app.schemas.user import UserOut, RoleUpdate
from app.api.v1.controllers import user_controller

router = APIRouter(prefix="/users", tags=["Users (Admin)"])


@router.get("", response_model=List[UserOut], summary="List all users [Admin]")
async def list_users(db=Depends(get_db), _=Depends(require_admin)):
    return await user_controller.list_users(db)


@router.patch("/{user_id}/role", response_model=UserOut, summary="Update user role [Admin]")
async def update_role(
    user_id: str,
    data: RoleUpdate,
    db=Depends(get_db),
    _=Depends(require_admin),
):
    return await user_controller.update_user_role(user_id, data, db)


@router.delete("/{user_id}", summary="Delete a user [Admin]")
async def delete_user(
    user_id: str,
    db=Depends(get_db),
    _=Depends(require_admin),
):
    return await user_controller.delete_user(user_id, db)
