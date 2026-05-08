from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException, status

from app.core.security import hash_password, verify_password, create_access_token
from app.schemas.user import UserRegister, UserLogin, UserOut, TokenResponse


def _serialize_user(doc: dict) -> UserOut:
    return UserOut(
        id=str(doc["_id"]),
        name=doc["name"],
        email=doc["email"],
        role=doc["role"],
        created_at=doc["created_at"],
    )


async def register_user(data: UserRegister, db) -> TokenResponse:
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    doc = {
        "name": data.name,
        "email": data.email,
        "password_hash": hash_password(data.password),
        "role": "user",
        "created_at": datetime.utcnow(),
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id

    user_out = _serialize_user(doc)
    token = create_access_token({"sub": str(doc["_id"]), "role": "user", "name": data.name})
    return TokenResponse(access_token=token, user=user_out)


async def login_user(data: UserLogin, db) -> TokenResponse:
    doc = await db.users.find_one({"email": data.email})
    if not doc or not verify_password(data.password, doc["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_out = _serialize_user(doc)
    token = create_access_token({
        "sub": str(doc["_id"]),
        "role": doc["role"],
        "name": doc["name"],
    })
    return TokenResponse(access_token=token, user=user_out)
