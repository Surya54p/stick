from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.models.user import User, WorkspaceMember
from app.models.workspace import Workspace
from app.schemas.user import Token, UserRegister, UserLogin, User as UserSchema
from app.schemas.workspace import Workspace as WorkspaceSchema

router = APIRouter()

@router.post("/register", response_model=Any)
def register_user(
    *,
    db: Session = Depends(get_db),
    user_in: UserRegister
) -> Any:
    # 1. Check if user already exists
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # 2. Check if workspace slug is already taken
    workspace = db.query(Workspace).filter(Workspace.slug == user_in.workspace_slug).first()
    if workspace:
        raise HTTPException(
            status_code=400,
            detail="The workspace slug is already taken.",
        )

    # 3. Create User
    db_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_active=True
    )
    db.add(db_user)
    db.flush()  # Generate user ID

    # 4. Create Workspace
    db_workspace = Workspace(
        name=user_in.workspace_name,
        slug=user_in.workspace_slug,
        owner_id=db_user.id
    )
    db.add(db_workspace)
    db.flush()  # Generate workspace ID

    # 5. Create Workspace Member relation (Admin)
    db_member = WorkspaceMember(
        workspace_id=db_workspace.id,
        user_id=db_user.id,
        role="Admin"
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_user)
    db.refresh(db_workspace)

    # 6. Generate Token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        db_user.id, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "full_name": db_user.full_name
        },
        "workspace": {
            "id": db_workspace.id,
            "name": db_workspace.name,
            "slug": db_workspace.slug,
            "role": "Admin"
        }
    }

@router.post("/login", response_model=Any)
def login(
    db: Session = Depends(get_db),
    login_in: UserLogin = None
) -> Any:
    # Authenticate user
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Incorrect email or password"
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=400,
            detail="Inactive user"
        )

    # Get user's workspaces
    user_workspaces = []
    for member in user.workspaces:
        user_workspaces.append({
            "id": member.workspace.id,
            "name": member.workspace.name,
            "slug": member.workspace.slug,
            "role": member.role
        })

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        user.id, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name
        },
        "workspaces": user_workspaces
    }
