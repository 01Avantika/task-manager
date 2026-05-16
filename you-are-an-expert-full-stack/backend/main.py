from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import get_settings
from database import init_db
from routers import analytics, auth, comments, dashboard, projects, tasks, team, users


app = FastAPI(title="Team Task Manager API", version="1.0.0")
settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError):
    first = exc.errors()[0] if exc.errors() else {}
    message = first.get("msg", "Validation error").replace("Value error, ", "")
    return JSONResponse(status_code=422, content={"detail": message})


@app.on_event("startup")
async def startup_event():
    await init_db()


@app.get("/api/health")
async def health():
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(team.router)
app.include_router(comments.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)
