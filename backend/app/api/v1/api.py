from fastapi import APIRouter
from app.api.v1.endpoints import auth, workspaces, tickets, comments, aduan

api_router = APIRouter()

# Include sub-routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(workspaces.router, prefix="/workspaces", tags=["workspaces"])
api_router.include_router(tickets.router, tags=["tickets"])
api_router.include_router(comments.router, tags=["comments"])
api_router.include_router(aduan.router, tags=["aduan"])
