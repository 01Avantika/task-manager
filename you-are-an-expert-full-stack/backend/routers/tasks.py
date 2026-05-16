from datetime import datetime, timezone

from pymongo.errors import PyMongoError
from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_current_user
from models.project import Project
from models.task import Task
from models.user import User
from routers.dashboard import get_accessible_projects
from routers.projects import can_access, is_project_admin
from schemas.task import TaskCreate, TaskRead, TaskUpdate


router = APIRouter(tags=["tasks"])


async def require_project(project_id: str, user: User) -> Project:
    project = await Project.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if not can_access(project, user):
        raise HTTPException(status_code=403, detail="Project access denied")
    return project


def validate_assignee(project: Project, user_id):
    if user_id and user_id not in project.member_ids and user_id != project.owner_id:
        raise HTTPException(status_code=400, detail="assigned_to must belong to project")


def ensure_task_admin(project: Project, user: User) -> None:
    if not is_project_admin(project, user):
        raise HTTPException(status_code=403, detail="Project admin access required")


def ensure_member_can_update_task(task: Task, data: dict, user: User, project: Project) -> None:
    if is_project_admin(project, user):
        return
    if task.assigned_to != user.id:
        raise HTTPException(status_code=403, detail="Members can only update their assigned tasks")
    if set(data.keys()) != {"status"}:
        raise HTTPException(status_code=403, detail="Members can only update task status")


@router.get("/api/tasks", response_model=list[TaskRead])
async def list_all_tasks(current_user: User = Depends(get_current_user)):
    projects = await get_accessible_projects(current_user)
    project_ids = [project.id for project in projects]
    if not project_ids:
        return []
    return await Task.find({"project_id": {"$in": project_ids}}).sort("-created_at").to_list()


@router.get("/api/projects/{project_id}/tasks", response_model=list[TaskRead])
async def list_tasks(project_id: str, current_user: User = Depends(get_current_user)):
    project = await require_project(project_id, current_user)
    return await Task.find(Task.project_id == project.id).sort("-created_at").to_list()


@router.post("/api/projects/{project_id}/tasks", response_model=TaskRead)
async def create_task(project_id: str, payload: TaskCreate, current_user: User = Depends(get_current_user)):
    project = await require_project(project_id, current_user)
    ensure_task_admin(project, current_user)
    validate_assignee(project, payload.assigned_to)
    try:
        task = Task(project_id=project.id, created_by=current_user.id, **payload.model_dump())
        await task.insert()
        return task
    except PyMongoError as exc:
        raise HTTPException(status_code=500, detail="Could not create task. Please try again.") from exc


@router.get("/api/tasks/{task_id}", response_model=TaskRead)
async def get_task(task_id: str, current_user: User = Depends(get_current_user)):
    task = await Task.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await require_project(str(task.project_id), current_user)
    return task


@router.put("/api/tasks/{task_id}", response_model=TaskRead)
async def update_task(task_id: str, payload: TaskUpdate, current_user: User = Depends(get_current_user)):
    task = await get_task(task_id, current_user)
    project = await require_project(str(task.project_id), current_user)
    data = payload.model_dump(exclude_unset=True)
    ensure_member_can_update_task(task, data, current_user, project)
    validate_assignee(project, data.get("assigned_to"))
    for key, value in data.items():
        setattr(task, key, value)
    task.updated_at = datetime.now(timezone.utc)
    await task.save()
    return task


@router.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str, current_user: User = Depends(get_current_user)):
    task = await get_task(task_id, current_user)
    project = await require_project(str(task.project_id), current_user)
    ensure_task_admin(project, current_user)
    await task.delete()
    return {"detail": "Task deleted"}
