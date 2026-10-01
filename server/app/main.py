import random
import string
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine
from app.models import Base


def run_auto_migrations(sync_conn):
    """Safely apply schema additions to existing SQLite tables."""
    migrations = [
        ("book_clubs", "invite_code", "ALTER TABLE book_clubs ADD COLUMN invite_code VARCHAR(40)"),
        ("discussion_posts", "is_private", "ALTER TABLE discussion_posts ADD COLUMN is_private BOOLEAN DEFAULT 0"),
        ("discussion_posts", "club_id", "ALTER TABLE discussion_posts ADD COLUMN club_id VARCHAR(36)"),
    ]

    for table, col, alter_sql in migrations:
        try:
            cursor = sync_conn.exec_driver_sql(f"PRAGMA table_info({table})")
            cols = [row[1] for row in cursor.fetchall()]
            if cols and col not in cols:
                sync_conn.exec_driver_sql(alter_sql)
        except Exception as e:
            print(f"Auto-migration check for {table}.{col}: {e}")

    # Backfill any clubs missing an invite code
    try:
        cursor = sync_conn.exec_driver_sql("SELECT id FROM book_clubs WHERE invite_code IS NULL")
        for row in cursor.fetchall():
            club_id = row[0]
            code = "PAPYR-CLUB-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
            sync_conn.exec_driver_sql("UPDATE book_clubs SET invite_code = ? WHERE id = ?", (code, club_id))
    except Exception:
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(run_auto_migrations)
    yield
    # Cleanup on shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# CORS middleware for Tauri & web clients
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "docs": f"{settings.API_V1_STR}/docs",
        "health": f"{settings.API_V1_STR}/health",
    }
