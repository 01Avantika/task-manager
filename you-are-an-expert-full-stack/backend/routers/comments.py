from fastapi import APIRouter, Depends, HTTPException

from dependencies import get_current_user
from models.comment import Comment
from models.task import Task
from models.user import User
from routers.tasks import require_project
from schemas.comment import CommentCreate, CommentRead


router = APIRouter(tags=["comments"])


async def serialize_comment(comment: Comment) -> dict:
    author = await User.get(comment.author_id)
    return {
        "_id": comment.id,
        "body": comment.body,
        "task_id": comment.task_id,
        "author_id": comment.author_id,
        "author_username": author.username if author else None,
        "created_at": comment.created_at,
    }


@router.get("/api/tasks/{task_id}/comments", response_model=list[CommentRead])
async def list_comments(task_id: str, current_user: User = Depends(get_current_user)):
    task = await Task.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await require_project(str(task.project_id), current_user)
    comments = await Comment.find(Comment.task_id == task.id).sort("created_at").to_list()
    return [await serialize_comment(comment) for comment in comments]


@router.post("/api/tasks/{task_id}/comments", response_model=CommentRead)
async def create_comment(task_id: str, payload: CommentCreate, current_user: User = Depends(get_current_user)):
    task = await Task.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await require_project(str(task.project_id), current_user)
    comment = Comment(body=payload.body, task_id=task.id, author_id=current_user.id)
    await comment.insert()
    return await serialize_comment(comment)


@router.delete("/api/comments/{comment_id}")
async def delete_comment(comment_id: str, current_user: User = Depends(get_current_user)):
    comment = await Comment.get(comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.author_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only comment authors can delete comments")
    await comment.delete()
    return {"detail": "Comment deleted"}
