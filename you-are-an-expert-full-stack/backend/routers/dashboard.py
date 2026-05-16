from collections import defaultdict
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pymongo.errors import PyMongoError

from dependencies import get_current_user
from models.project import Project
from models.task import Task
from models.user import User


router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


async def get_accessible_projects(current_user: User) -> list[Project]:
    if current_user.role == "admin":
        return await Project.find_all().sort("-created_at").to_list()
    return await Project.find({"$or": [{"owner_id": current_user.id}, {"member_ids": current_user.id}]}).sort("-created_at").to_list()


def as_aware_datetime(value: datetime | None) -> datetime | None:
    if not value:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def is_overdue(task: Task, now: datetime) -> bool:
    due_date = as_aware_datetime(task.due_date)
    return bool(due_date and due_date < now and task.status != "done")


@router.get("")
async def dashboard(current_user: User = Depends(get_current_user)):
    try:
        projects = await get_accessible_projects(current_user)
        project_ids = [project.id for project in projects]
        tasks = await Task.find({"project_id": {"$in": project_ids}}).to_list() if project_ids else []
        now = datetime.now(timezone.utc)

        total = len(tasks)
        done = len([task for task in tasks if task.status == "done"])
        in_progress = len([task for task in tasks if task.status == "in_progress"])
        todo = len([task for task in tasks if task.status == "todo"])
        pending = len([task for task in tasks if task.status != "done"])
        overdue = len([task for task in tasks if is_overdue(task, now)])

        tasks_per_project = []
        for project in projects:
            project_tasks = [task for task in tasks if task.project_id == project.id]
            tasks_per_project.append({
                "project_id": str(project.id),
                "name": project.name or "Untitled project",
                "total": len(project_tasks),
                "completed": len([task for task in project_tasks if task.status == "done"]),
                "pending": len([task for task in project_tasks if task.status != "done"]),
            })

        assignee_ids = list({task.assigned_to for task in tasks if task.assigned_to})
        users = await User.find({"_id": {"$in": assignee_ids}}).to_list() if assignee_ids else []
        username_by_id = {user.id: user.username for user in users}
        per_user_counts = defaultdict(lambda: {"total": 0, "completed": 0, "pending": 0})
        for task in tasks:
            key = task.assigned_to or "unassigned"
            per_user_counts[key]["total"] += 1
            if task.status == "done":
                per_user_counts[key]["completed"] += 1
            else:
                per_user_counts[key]["pending"] += 1
        tasks_per_user = [
            {
                "user_id": str(user_id) if user_id != "unassigned" else None,
                "name": username_by_id.get(user_id, "Unassigned") if user_id != "unassigned" else "Unassigned",
                **counts,
            }
            for user_id, counts in per_user_counts.items()
        ]

        progress_by_day = defaultdict(lambda: {"created": 0, "completed": 0})
        for task in tasks:
            created_at = as_aware_datetime(task.created_at)
            if created_at:
                progress_by_day[created_at.date().isoformat()]["created"] += 1
            if task.status == "done":
                updated_at = as_aware_datetime(task.updated_at)
                if updated_at:
                    progress_by_day[updated_at.date().isoformat()]["completed"] += 1

        return {
            "total_projects": len(projects),
            "total_tasks": total,
            "completed_tasks": done,
            "pending_tasks": pending,
            "completed_percent": round((done / total) * 100) if total else 0,
            "overdue_tasks": overdue,
            "tasks_by_status": {
                "todo": todo,
                "in_progress": in_progress,
                "done": done,
            },
            "tasks_per_project": tasks_per_project,
            "tasks_per_user": tasks_per_user,
            "progress_over_time": [
                {"date": date, **progress_by_day[date]}
                for date in sorted(progress_by_day.keys())
            ],
            "recent_projects": [
                {
                    "id": str(project.id),
                    "name": project.name or "Untitled project",
                    "description": project.description or "",
                    "member_count": len(project.member_ids or []),
                    "created_at": project.created_at,
                }
                for project in projects[:5]
            ],
        }
    except PyMongoError as exc:
        raise HTTPException(status_code=500, detail="Could not load dashboard data. Please try again.") from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Could not load dashboard data. Please try again.") from exc
