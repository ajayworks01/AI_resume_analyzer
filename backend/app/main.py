from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.database.db import init_db
from app.api.routes import router
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield
    # Shutdown (cleanup if needed)


app = FastAPI(
    title="AI Resume Analyzer API",
    description="Intelligent resume parsing, matching, and ranking platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for uploads
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Routes
app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "AI Resume Analyzer API", "docs": "/docs", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
