import asyncio

from database import init_db
from dependencies import hash_password
from models.user import User


async def main() -> None:
    await init_db()
    user = await User.find_one(User.email == "admin@example.com")
    if user:
        print("Admin user already exists")
        return
    await User(
        email="admin@example.com",
        username="admin",
        hashed_password=hash_password("admin123"),
        role="admin",
    ).insert()
    print("Created admin@example.com with password admin123")


if __name__ == "__main__":
    asyncio.run(main())
