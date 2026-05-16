from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_current_user, hash_password, require_admin
from models.user import User
from schemas.user import UserRead, UserRoleUpdate, UserUpdate


router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserRead)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserRead)
async def update_me(payload: UserUpdate, current_user: User = Depends(get_current_user)):
    data = payload.model_dump(exclude_unset=True)
    if "email" in data and await User.find_one(User.email == data["email"]):
        existing = await User.find_one(User.email == data["email"])
        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=400, detail="Email already registered")
    if "username" in data:
        existing = await User.find_one(User.username == data["username"])
        if existing and existing.id != current_user.id:
            raise HTTPException(status_code=400, detail="Username already taken")
    if password := data.pop("password", None):
        current_user.hashed_password = hash_password(password)
    for key, value in data.items():
        setattr(current_user, key, value)
    await current_user.save()
    return current_user


@router.get("", response_model=list[UserRead])
async def list_users(_: User = Depends(require_admin)):
    return await User.find_all().sort("username").to_list()


@router.put("/{user_id}/role", response_model=UserRead)
async def change_role(user_id: str, payload: UserRoleUpdate, admin: User = Depends(require_admin)):
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id and payload.role != "admin":
        raise HTTPException(status_code=400, detail="You cannot remove your own admin role")
    user.role = payload.role
    await user.save()
    return user
