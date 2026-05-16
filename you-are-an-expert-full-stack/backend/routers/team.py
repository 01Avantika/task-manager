from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query

from dependencies import get_current_user
from models.project import Project
from models.task import Task
from models.user import User
from routers.projects import can_access, is_project_admin


router = APIRouter(prefix="/api/team", tags=["team"])


def as_aware_datetime(value: datetime | None) -> datetime | None:
    if not value:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def serialize_project(project: Project) -> dict:
    member_ids = list(dict.fromkeys([project.owner_id, *project.member_ids, *getattr(project, "admin_ids", [])]))
    return {
        "id": str(project.id),
        "name": project.name,
        "description": project.description,
        "owner_id": str(project.owner_id),
        "member_ids": [str(member_id) for member_id in member_ids],
        "admin_ids": [str(admin_id) for admin_id in getattr(project, "admin_ids", [])],
    }


async def accessible_projects(current_user: User) -> list[Project]:
    if current_user.role == "admin":
        return await Project.find_all().sort("-created_at").to_list()
    return await Project.find(
        {"$or": [{"owner_id": current_user.id}, {"member_ids": current_user.id}, {"admin_ids": current_user.id}]}
    ).sort("-created_at").to_list()


async def normalize_project_members(project: Project) -> Project:
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


def member_status(total: int, completed: int) -> str:
    if total == 0:
        return "No tasks"
    if completed == total:
        return "Complete"
    if completed > 0:
        return "In progress"
    return "Pending"


@router.get("")
async def team_overview(project_id: str | None = Query(default=None), current_user: User = Depends(get_current_user)):
    projects = await accessible_projects(current_user)
    selected_project = None

    if project_id:
        selected_project = await Project.get(project_id)
        if not selected_project:
            raise HTTPException(status_code=404, detail="Project not found")
        if not can_access(selected_project, current_user):
            raise HTTPException(status_code=403, detail="Project access denied")
        if all(project.id != selected_project.id for project in projects):
            projects.insert(0, selected_project)
    elif projects:
        selected_project = projects[0]

    if not selected_project:
        return {"projects": [], "selected_project": None, "members": [], "can_manage": False}

    selected_project = await normalize_project_members(selected_project)
    member_ids = list(dict.fromkeys([selected_project.owner_id, *selected_project.member_ids, *getattr(selected_project, "admin_ids", [])]))
    members = await User.find({"_id": {"$in": member_ids}}).sort("username").to_list() if member_ids else []
    tasks = await Task.find(Task.project_id == selected_project.id).to_list()

    member_rows = []
    for member in members:
        assigned = [task for task in tasks if task.assigned_to == member.id]
        completed = [task for task in assigned if task.status == "done"]
        pending = [task for task in assigned if task.status != "done"]
        completion_dates = [as_aware_datetime(task.updated_at) for task in completed if as_aware_datetime(task.updated_at)]
        completion_rate = round((len(completed) / len(assigned)) * 100) if assigned else 0
        member_rows.append({
            "id": str(member.id),
            "username": member.username,
            "email": member.email,
            "role": member.role,
            "project_role": "admin" if is_project_admin(selected_project, member) else "member",
            "assigned_tasks": len(assigned),
            "completed_tasks": len(completed),
            "pending_tasks": len(pending),
            "completion_rate": completion_rate,
            "status": member_status(len(assigned), len(completed)),
            "last_completion_date": max(completion_dates, default=None),
        })

    return {
        "projects": [serialize_project(project) for project in projects],
        "selected_project": serialize_project(selected_project),
        "members": member_rows,
        "can_manage": is_project_admin(selected_project, current_user),
    }
