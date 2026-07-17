from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class WorkspaceBase(BaseModel):
    name: str
    slug: str

class WorkspaceCreate(WorkspaceBase):
    pass

class WorkspaceUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None

class WorkspaceInDBBase(WorkspaceBase):
    id: UUID
    owner_id: UUID | None = None

    class Config:
        from_attributes = True

class Workspace(WorkspaceInDBBase):
    pass

class WorkspaceMemberBase(BaseModel):
    role: str

class WorkspaceMemberCreate(WorkspaceMemberBase):
    user_id: UUID

class WorkspaceMemberUpdate(WorkspaceMemberBase):
    pass

class WorkspaceMember(WorkspaceMemberBase):
    workspace_id: UUID
    user_id: UUID
    
    class Config:
        from_attributes = True

class WorkspaceInvitationBase(BaseModel):
    email: str
    role: str # Admin | Agent | Customer

class WorkspaceInvitationCreate(WorkspaceInvitationBase):
    pass

class WorkspaceInvitationUpdate(BaseModel):
    status: str # Pending | Accepted | Expired

class WorkspaceInvitation(WorkspaceInvitationBase):
    id: UUID
    workspace_id: UUID
    token: str
    status: str
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True

class WorkspaceShareTokenBase(BaseModel):
    label: str | None = None

class WorkspaceShareTokenCreate(WorkspaceShareTokenBase):
    pass

class WorkspaceShareToken(WorkspaceShareTokenBase):
    id: UUID
    workspace_id: UUID
    token: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

