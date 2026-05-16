from beanie import init_beanie
import dns.resolver
from motor.motor_asyncio import AsyncIOMotorClient

from config import get_settings
from models.comment import Comment
from models.project import Project
from models.task import Task
from models.user import User

client: AsyncIOMotorClient | None = None


def configure_dns_resolver() -> None:
    resolver = dns.resolver.Resolver(configure=False)
    resolver.nameservers = ["1.1.1.1", "8.8.8.8"]
    resolver.timeout = 5
    resolver.lifetime = 10
    dns.resolver.default_resolver = resolver


async def init_db() -> None:
    global client

    settings = get_settings()

    if settings.mongo_uri.startswith("mongodb+srv://"):
        configure_dns_resolver()

    client = AsyncIOMotorClient(settings.mongo_uri, serverSelectionTimeoutMS=15000)

    database = client["team_task_manager"]

    await init_beanie(
        database=database,
        document_models=[User, Project, Task, Comment]
    )

    print("MongoDB Connected Successfully")
