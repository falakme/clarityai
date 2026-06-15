"""ClearAid FastAPI application entrypoint."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.config import get_settings
from app.database import Base, engine
from app.routers import alerts, health, translate
from app.seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables and seed non-PII demo alerts on startup.
    Base.metadata.create_all(bind=engine)
    try:
        seed()
    except Exception:  # noqa: BLE001 - never block startup on seed failure
        pass
    yield


settings = get_settings()

app = FastAPI(
    title="ClearAid API",
    description=(
        "Crisis-to-Action translator backend. Stores only non-PII disaster "
        "alerts; user profile data lives exclusively in the browser."
    ),
    version=__version__,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(alerts.router)
app.include_router(translate.router)


@app.get("/", tags=["system"])
def root() -> dict[str, str]:
    return {"service": "clearaid-backend", "docs": "/docs"}
