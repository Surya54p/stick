import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api import deps
from app.models.user import User, WorkspaceMember
from app.models.workspace import Workspace, WorkspaceInvitation, WorkspaceShareToken
from app.schemas.workspace import (
    Workspace as WorkspaceSchema,
    WorkspaceCreate,
    WorkspaceUpdate,
    WorkspaceInvitation as WorkspaceInvitationSchema,
    WorkspaceInvitationCreate,
    WorkspaceShareToken as WorkspaceShareTokenSchema,
    WorkspaceShareTokenCreate,
    WorkspaceMember as WorkspaceMemberSchema
)

router = APIRouter()

@router.post("/", response_model=WorkspaceSchema)
def create_workspace(
    *,
    db: Session = Depends(get_db),
    workspace_in: WorkspaceCreate,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    # Check if slug is unique
    workspace = db.query(Workspace).filter(Workspace.slug == workspace_in.slug).first()
    if workspace:
        raise HTTPException(
            status_code=400,
            detail="Workspace with this slug already exists."
        )
    
    db_workspace = Workspace(
        name=workspace_in.name,
        slug=workspace_in.slug,
        owner_id=current_user.id
    )
    db.add(db_workspace)
    db.flush()

    # Make current user Admin member
    db_member = WorkspaceMember(
        workspace_id=db_workspace.id,
        user_id=current_user.id,
        role="Admin"
    )
    db.add(db_member)
    db.commit()
    db.refresh(db_workspace)
    return db_workspace

@router.get("/", response_model=List[Any])
def get_user_workspaces(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    workspaces = []
    for member in current_user.workspaces:
        workspaces.append({
            "id": member.workspace.id,
            "name": member.workspace.name,
            "slug": member.workspace.slug,
            "role": member.role
        })
    return workspaces

@router.get("/{slug}", response_model=WorkspaceSchema)
def get_workspace_by_slug(
    slug: str,
    db: Session = Depends(get_db),
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member)
) -> Any:
    return current_member.workspace

# Accept invitation endpoint (global endpoint, doesn't require workspace scope in URL)
@router.post("/accept-invitation", response_model=Any)
def accept_invitation(
    *,
    db: Session = Depends(get_db),
    token: str,
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    invitation = db.query(WorkspaceInvitation).filter(WorkspaceInvitation.token == token).first()
    if not invitation:
        raise HTTPException(
            status_code=404,
            detail="Invitation not found."
        )
    
    if invitation.status != "Pending":
        raise HTTPException(
            status_code=400,
            detail=f"Invitation has already been {invitation.status.lower()}."
        )
    
    if invitation.expires_at < datetime.now(timezone.utc):
        invitation.status = "Expired"
        db.commit()
        raise HTTPException(
            status_code=400,
            detail="Invitation has expired."
        )
    
    # Optional check: verify if the logged in user matches the invited email
    # Let's enforce that or at least allow it if they are logging in. Let's make sure it matches!
    if invitation.email.lower() != current_user.email.lower():
        raise HTTPException(
            status_code=400,
            detail=f"This invitation was sent to {invitation.email}, but you are logged in as {current_user.email}."
        )

    # Check if already a member
    existing_member = db.query(WorkspaceMember).filter(
        WorkspaceMember.workspace_id == invitation.workspace_id,
        WorkspaceMember.user_id == current_user.id
    ).first()
    if existing_member:
        # Just mark the invite as accepted and return success
        invitation.status = "Accepted"
        db.commit()
        return {"status": "success", "message": "Already a member", "workspace_slug": invitation.workspace.slug}

    # Add member
    new_member = WorkspaceMember(
        workspace_id=invitation.workspace_id,
        user_id=current_user.id,
        role=invitation.role
    )
    db.add(new_member)
    invitation.status = "Accepted"
    db.commit()

    return {
        "status": "success",
        "workspace_slug": invitation.workspace.slug,
        "role": invitation.role
    }

# Invitation management (scoped to workspace, Admin-only)
@router.post("/{slug}/invitations", response_model=WorkspaceInvitationSchema)
def invite_member(
    slug: str,
    *,
    db: Session = Depends(get_db),
    invite_in: WorkspaceInvitationCreate,
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member)
) -> Any:
    # Ensure current user is an Admin
    if current_member.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Only Admins can invite new members to this workspace."
        )
    
    # Check if already invited and pending
    existing_invite = db.query(WorkspaceInvitation).filter(
        WorkspaceInvitation.workspace_id == current_member.workspace_id,
        WorkspaceInvitation.email == invite_in.email,
        WorkspaceInvitation.status == "Pending"
    ).first()
    if existing_invite:
        # Check if expired. If not, raise error
        if existing_invite.expires_at > datetime.now(timezone.utc):
            raise HTTPException(
                status_code=400,
                detail="A pending invitation already exists for this email."
            )
        else:
            existing_invite.status = "Expired"
            db.commit()

    # Generate secure random token
    invite_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    db_invite = WorkspaceInvitation(
        workspace_id=current_member.workspace_id,
        email=invite_in.email,
        role=invite_in.role,
        token=invite_token,
        status="Pending",
        expires_at=expires_at
    )
    db.add(db_invite)
    db.commit()
    db.refresh(db_invite)
    return db_invite

@router.get("/{slug}/invitations", response_model=List[WorkspaceInvitationSchema])
def list_invitations(
    slug: str,
    db: Session = Depends(get_db),
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member)
) -> Any:
    if current_member.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Only Admins can view invitations."
        )
    
    return db.query(WorkspaceInvitation).filter(
        WorkspaceInvitation.workspace_id == current_member.workspace_id
    ).all()

# Share Tokens for View-Only Guest Access (Admin-only)
@router.post("/{slug}/share-tokens", response_model=WorkspaceShareTokenSchema)
def generate_share_token(
    slug: str,
    *,
    db: Session = Depends(get_db),
    token_in: WorkspaceShareTokenCreate,
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member)
) -> Any:
    if current_member.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Only Admins can generate public share links."
        )
    
    share_token = secrets.token_urlsafe(32)
    db_token = WorkspaceShareToken(
        workspace_id=current_member.workspace_id,
        token=share_token,
        label=token_in.label,
        is_active=True
    )
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token

@router.get("/{slug}/share-tokens", response_model=List[WorkspaceShareTokenSchema])
def list_share_tokens(
    slug: str,
    db: Session = Depends(get_db),
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member)
) -> Any:
    if current_member.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Only Admins can view share tokens."
        )
    
    return db.query(WorkspaceShareToken).filter(
        WorkspaceShareToken.workspace_id == current_member.workspace_id
    ).all()

@router.put("/{slug}", response_model=WorkspaceSchema)
def update_workspace(
    slug: str,
    *,
    db: Session = Depends(get_db),
    workspace_in: WorkspaceUpdate,
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member)
) -> Any:
    # Ensure current user is Admin of workspace
    if current_member.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Only workspace Admins can modify settings."
        )
    
    workspace = current_member.workspace
    
    # If changing slug, verify uniqueness
    if workspace_in.slug is not None and workspace_in.slug != workspace.slug:
        existing = db.query(Workspace).filter(Workspace.slug == workspace_in.slug).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Workspace with this slug already exists."
            )
            
    update_data = workspace_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(workspace, field, value)
        
    db.commit()
    db.refresh(workspace)
    return workspace

@router.delete("/{slug}", response_model=Any)
def delete_workspace(
    slug: str,
    db: Session = Depends(get_db),
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member)
) -> Any:
    # Ensure current user is Admin of workspace
    if current_member.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Only workspace Admins can delete the workspace."
        )
    
    workspace = current_member.workspace
    db.delete(workspace)
    db.commit()
    return {"status": "success", "message": "Workspace deleted successfully"}

@router.get("/{slug}/members", response_model=List[Any])
def list_workspace_members(
    slug: str,
    db: Session = Depends(get_db),
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member)
) -> Any:
    members = db.query(WorkspaceMember).filter(WorkspaceMember.workspace_id == current_member.workspace_id).all()
    result = []
    for m in members:
        result.append({
            "id": str(m.user_id),
            "name": m.user.full_name or m.user.email,
            "email": m.user.email,
            "role": m.role,
            "status": "Active"
        })
    return result
