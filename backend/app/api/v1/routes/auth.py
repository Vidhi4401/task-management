from fastapi import APIRouter, Depends
from app.db.database import get_db
from app.schemas.user import UserRegister, UserLogin, TokenResponse
from app.api.v1.controllers import auth_controller

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201,
             summary="Register a new user")
async def register(data: UserRegister, db=Depends(get_db)):
    """Register with name, email, password. Returns JWT token."""
    return await auth_controller.register_user(data, db)


@router.post("/login", response_model=TokenResponse,
             summary="Login and receive JWT")
async def login(data: UserLogin, db=Depends(get_db)):
    """Login with email and password. Returns JWT token."""
    return await auth_controller.login_user(data, db)
