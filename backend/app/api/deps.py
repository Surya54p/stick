from typing import Generator, Optional
from fastapi import Depends, HTTPException, status, Query, Header
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from pydantic import ValidationError

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User, WorkspaceMember
from app.models.workspace import Workspace, WorkspaceShareToken
from app.schemas.user import TokenPayload

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Dependency to check workspace membership
def get_current_workspace_member(
    workspace_slug: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> WorkspaceMember:
    workspace = db.query(Workspace).filter(Workspace.slug == workspace_slug).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == workspace.id,
        WorkspaceMember.user_id == current_user.id
    ).first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this workspace"
        )
    return member

# Read-only permission helper that allows EITHER workspace member OR valid share token
def verify_workspace_read_access(
    workspace_slug: str,
    db: Session = Depends(get_db),
    share_token: Optional[str] = Query(None, alias="token"),
    x_share_token: Optional[str] = Header(None, alias="X-Share-Token"),
    token: Optional[str] = Depends(OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False))
) -> Optional[Workspace]:
    # 1. Check if workspace exists
    workspace = db.query(Workspace).filter(Workspace.slug == workspace_slug).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    # 2. Check if a valid share token is provided
    actual_share_token = share_token or x_share_token
    if actual_share_token:
        valid_share = db.query(WorkspaceShareToken).filter(
            WorkspaceShareToken.workspace_id == workspace.id,
            WorkspaceShareToken.token == actual_share_token,
            WorkspaceShareToken.is_active == True
        ).first()
        if valid_share:
            return workspace  # Access granted as Guest

    # 3. Otherwise, check if user is logged in and is a workspace member
    if token:
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            token_data = TokenPayload(**payload)
            user = db.query(User).filter(User.id == token_data.sub).first()
            if user and user.is_active:
                member = db.query(WorkspaceMember).filter(
                    WorkspaceMember.workspace_id == workspace.id,
                    WorkspaceMember.user_id == user.id
                ).first()
                if member:
                    return workspace
        except (JWTError, ValidationError):
            pass

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied. Workspace is private and no valid credentials or share tokens were provided."
    )
