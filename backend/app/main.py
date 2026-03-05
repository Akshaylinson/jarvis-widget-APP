import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db
from app.api import auth_routes, assistant_routes, agent_routes, knowledge_routes
from app.admin import routes as admin_routes

logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 CodelessAI Backend starting up...")
    os.makedirs(settings.upload_dir, exist_ok=True)
    await init_db()
    logger.info("✅ Database initialized")
    yield
    logger.info("🛑 CodelessAI Backend shutting down...")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="CodelessAI – Multi-Tenant SaaS Backend",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────────────────
origins = settings.allowed_origins.split(",") if settings.allowed_origins != "*" else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Static Files ─────────────────────────────────────────────────────────────
os.makedirs("uploads/avatars", exist_ok=True)
app.mount("/static/avatars", StaticFiles(directory="uploads/avatars"), name="avatars")

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth_routes.router)
app.include_router(assistant_routes.router)
app.include_router(agent_routes.router)
app.include_router(knowledge_routes.router)
app.include_router(admin_routes.router)  # Admin Dashboard


@app.get("/", tags=["Health"])
async def root():
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "online",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
