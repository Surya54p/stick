from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class TicketBase(BaseModel):
    title: str
    description: str | None = None
    status: str = "Open"  # Open | In Progress | Resolved | Closed
    priority: str = "Medium"  # Low | Medium | High | Urgent

class TicketCreate(TicketBase):
    assignee_id: UUID | None = None

class TicketUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: str | None = None
    assignee_id: UUID | None = None

class TicketInDBBase(TicketBase):
    id: UUID
    workspace_id: UUID
    number: int
    creator_id: UUID | None = None
    assignee_id: UUID | None = None
    aduan_service_id: UUID | None = None
    creator_email: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Ticket(TicketInDBBase):
    pass
