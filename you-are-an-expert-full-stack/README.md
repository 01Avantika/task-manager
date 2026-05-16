# Team Task Manager

A full-stack team task management app with authentication, projects, Kanban task tracking, comments, dashboard stats, SVG analytics, a collapsible sidebar, settings/admin user management, and an animated startup-style landing page.

## Stack

- Frontend: React 18, Vite, plain CSS, TanStack Query v5, Axios, `@dnd-kit/core`
- Backend: FastAPI, MongoDB, Motor, Beanie ODM, Pydantic v2
- Auth: JWT access/refresh tokens with `python-jose`, password hashing with `passlib[bcrypt]`
- Deployment target: Railway, with frontend and backend as separate services

## Project Structure

```text
backend/
  main.py
  config.py
  database.py
  models/
  schemas/
  routers/
  dependencies.py
  seed.py
  requirements.txt
frontend/
  src/
    api/
    components/
    context/
    hooks/
    pages/
    utils/
```

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload
```

API docs are available at `http://localhost:8000/docs`.

### Backend Environment Variables

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/team_task_manager
SECRET_KEY=change-me-in-production
CORS_ORIGINS=http://localhost:5173
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Seed Admin User

```bash
cd backend
python seed.py
```

Seeded credentials:

- Email: `admin@example.com`
- Password: `admin123`
- Role: `admin`

## Frontend Setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The frontend runs at `http://localhost:5173`.

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:8000
```

## MongoDB Atlas

1. Create a free MongoDB Atlas cluster.
2. Create a database user and password.
3. Allow your current IP address or Railway egress access in Network Access.
4. Copy the connection string into `MONGO_URI`.
5. Use a database name in the URI, for example `/team_task_manager`.

## API Overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/users/me`
- `PUT /api/users/me`
- `GET /api/users` admin only
- `PUT /api/users/{id}/role` admin only
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/{id}`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`
- `POST /api/projects/{id}/members`
- `GET /api/projects/{id}/tasks`
- `POST /api/projects/{id}/tasks`
- `GET /api/tasks/{id}`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
- `GET /api/tasks/{id}/comments`
- `POST /api/tasks/{id}/comments`
- `DELETE /api/comments/{id}`
- `GET /api/dashboard`
- `GET /api/analytics`

## Architecture

The FastAPI backend owns authentication, authorization, validation, and persistence. Beanie document models map directly to MongoDB collections for users, projects, tasks, and comments. Routers keep domain behavior separate, while shared dependencies handle JWT validation and role checks.

The React frontend uses TanStack Query for server state and Axios for authenticated requests. A global auth context keeps the current user available across protected routes. The post-login app uses a collapsible sidebar layout, with Kanban drag/drop updating task status through the API. Analytics are rendered with hand-built SVG charts, without chart libraries.

## Railway Deployment

Create two Railway services.

Backend service:

- Root directory: `backend`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Add backend environment variables from `.env.example`

Frontend service:

- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Start command: `npm run preview -- --host 0.0.0.0 --port $PORT`
- Set `VITE_API_URL` to the deployed backend URL

After deployment, add the frontend URL to backend `CORS_ORIGINS`.

## Live URLs

- Frontend URL: add your Railway frontend URL here
- Backend URL: add your Railway backend URL here
