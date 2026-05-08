from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.database import connect_db, close_db
from app.api.v1.routes import auth, tasks, users

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="TaskFlow API",
    description=(
        "## TaskFlow REST API\n\n"
        "Scalable task management with JWT authentication and role-based access control.\n\n"
        "### Roles\n"
        "- **user** – manage own tasks\n"
        "- **admin** – manage all tasks and users\n\n"
        "### Quick Start\n"
        "1. `POST /api/v1/auth/register` – create account\n"
        "2. Copy `access_token` from response\n"
        "3. Click **Authorize** 🔒 and paste token\n"
        "4. Start using task endpoints"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Lifecycle ─────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    await connect_db()


@app.on_event("shutdown")
async def shutdown():
    await close_db()

# ── Global error handler ──────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

# ── Routes ────────────────────────────────────────────────────────────────────
PREFIX = "/api/v1"
app.include_router(auth.router, prefix=PREFIX)
app.include_router(tasks.router, prefix=PREFIX)
app.include_router(users.router, prefix=PREFIX)


@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "message": "TaskFlow API is running 🚀", "docs": "/docs"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
