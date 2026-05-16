from collections import defaultdict

from fastapi import APIRouter, Depends

from dependencies import get_current_user
from models.task import Task
from models.user import User
from routers.dashboard import as_aware_datetime, get_accessible_projects


router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("")
async def analytics(current_user: User = Depends(get_current_user)):
    projects = await get_accessible_projects(current_user)
    project_ids = [project.id for project in projects]
    tasks = await Task.find({"project_id": {"$in": project_ids}}).to_list() if project_ids else []

    status = {"todo": 0, "in_progress": 0, "done": 0}
    over_time = defaultdict(int)
    for task in tasks:
        if task.status in status:
            status[task.status] += 1
        created_at = as_aware_datetime(task.created_at)
        if created_at:
            over_time[created_at.date().isoformat()] += 1

    progress = []
    for project in projects:
        project_tasks = [task for task in tasks if task.project_id == project.id]
        done = len([task for task in project_tasks if task.status == "done"])
        progress.append({
            "project_id": str(project.id),
            "name": project.name or "Untitled project",
            "total": len(project_tasks),
            "completed": done,
            "percent": round((done / len(project_tasks)) * 100) if project_tasks else 0,
        })

    total = len(tasks)
    completed = status["done"]
    return {
        "tasks_by_status": status,
        "tasks_over_time": [{"date": key, "count": over_time[key]} for key in sorted(over_time.keys())],
        "completion_rate": round((completed / total) * 100) if total else 0,
        "projects_progress": progress,
    }
