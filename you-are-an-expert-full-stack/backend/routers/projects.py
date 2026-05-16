from pymongo.errors import PyMongoError
from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_current_user
from models.project import Project
from models.task import Task
from models.user import User
from schemas.user import UserRead
from schemas.project import ProjectCreate, ProjectMemberAdd, ProjectRead, ProjectUpdate


router = APIRouter(prefix="/api/projects", tags=["projects"])


def can_access(project: Project, user: User) -> bool:
    return user.role == "admin" or project.owner_id == user.id or user.id in project.member_ids or user.id in getattr(project, "admin_ids", [])


def is_project_admin(project: Project, user: User) -> bool:
    return user.role == "admin" or project.owner_id == user.id or user.id in getattr(project, "admin_ids", [])


def ensure_project_admin(project: Project, user: User) -> None:
    if not is_project_admin(project, user):
        raise HTTPException(status_code=403, detail="Project admin access required")


async def require_project(project_id: str, current_user: User) -> Project:
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not can_access(project, current_user):
        raise HTTPException(status_code=403, detail="Project access denied")

    changed = False
    if project.owner_id not in project.member_ids:
        project.member_ids.append(project.owner_id)
        changed = True
    if project.owner_id not in getattr(project, "admin_ids", []):
        project.admin_ids.append(project.owner_id)
        changed = True
    if changed:
        await project.save()
    return project


async def resolve_member(payload: ProjectMemberAdd) -> User:
    user = None
    if payload.user_id:
        user = await User.get(payload.user_id)
    elif payload.email:
        user = await User.find_one(User.email == payload.email)
    elif payload.username:
        user = await User.find_one(User.username == payload.username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def serialize_project(project: Project) -> dict:
    owner = await User.get(project.owner_id)
    task_count = await Task.find(Task.project_id == project.id).count()
    return {
        "_id": project.id,
        "name": project.name,
        "description": project.description,
        "owner_id": project.owner_id,
        "member_ids": project.member_ids,
        "admin_ids": getattr(project, "admin_ids", []),
        "created_at": project.created_at,
        "owner_username": owner.username if owner else None,
        "task_count": task_count,
    }


@router.get("", response_model=list[ProjectRead])
async def list_projects(current_user: User = Depends(get_current_user)):
    if current_user.role == "admin":
        projects = await Project.find_all().sort("-created_at").to_list()
    else:
        projects = await Project.find({"$or": [{"owner_id": current_user.id}, {"member_ids": current_user.id}, {"admin_ids": current_user.id}]}).sort("-created_at").to_list()
    return [await serialize_project(project) for project in projects]


@router.post("", response_model=ProjectRead)
async def create_project(payload: ProjectCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create projects")
    try:
        project = Project(
            name=payload.name,
            description=payload.description,
            owner_id=current_user.id,
            member_ids=[current_user.id],
            admin_ids=[current_user.id],
        )
        await project.insert()
        return await serialize_project(project)
    except PyMongoError as exc:
        raise HTTPException(status_code=500, detail="Could not create project. Please try again.") from exc


@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(project_id: str, current_user: User = Depends(get_current_user)):
    project = await require_project(project_id, current_user)
    return await serialize_project(project)


@router.put("/{project_id}", response_model=ProjectRead)
async def update_project(project_id: str, payload: ProjectUpdate, current_user: User = Depends(get_current_user)):
    project = await require_project(project_id, current_user)
    ensure_project_admin(project, current_user)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, key, value)
    await project.save()
    return await serialize_project(project)


@router.delete("/{project_id}")
async def delete_project(project_id: str, current_user: User = Depends(get_current_user)):
    project = await require_project(project_id, current_user)
    ensure_project_admin(project, current_user)
    await project.delete()
    return {"detail": "Project deleted"}


@router.post("/{project_id}/members", response_model=ProjectRead)
async def add_member(project_id: str, payload: ProjectMemberAdd, current_user: User = Depends(get_current_user)):
    project = await require_project(project_id, current_user)
    ensure_project_admin(project, current_user)
    user = await resolve_member(payload)
    if user.id not in project.member_ids:
        project.member_ids.append(user.id)
        await project.save()
    return await serialize_project(project)


@router.get("/{project_id}/members", response_model=list[UserRead])
async def list_members(project_id: str, current_user: User = Depends(get_current_user)):
    project = await require_project(project_id, current_user)
    member_ids = list(dict.fromkeys([*project.member_ids, project.owner_id, *getattr(project, "admin_ids", [])]))
    if not member_ids:
        return []
    return await User.find({"_id": {"$in": member_ids}}).sort("username").to_list()


@router.delete("/{project_id}/members/{user_id}", response_model=ProjectRead)
async def remove_member(project_id: str, user_id: str, current_user: User = Depends(get_current_user)):
    project = await require_project(project_id, current_user)
    ensure_project_admin(project, current_user)
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == project.owner_id:
        raise HTTPException(status_code=400, detail="Project owner cannot be removed")
    project.member_ids = [member_id for member_id in project.member_ids if member_id != user.id]
    project.admin_ids = [admin_id for admin_id in getattr(project, "admin_ids", []) if admin_id != user.id]
    await project.save()
    return await serialize_project(project)
