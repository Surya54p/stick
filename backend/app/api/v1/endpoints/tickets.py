from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api import deps
from app.models.user import User, WorkspaceMember
from app.models.workspace import Workspace
from app.models.ticket import Ticket
from app.schemas.ticket import Ticket as TicketSchema, TicketCreate, TicketUpdate

router = APIRouter()

@router.get("/workspaces/{workspace_slug}/tickets", response_model=List[TicketSchema])
def list_tickets(
    workspace_slug: str,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(deps.verify_workspace_read_access),
    current_user: Optional[User] = Depends(deps.OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False))
) -> Any:
    # 1. Determine if the user is a logged-in member and get their role
    is_customer = False
    logged_in_user_id = None
    
    if current_user:
        # Decode user safely to check membership role
        from jose import jwt
        from app.core.config import settings
        from app.schemas.user import TokenPayload
        try:
            payload = jwt.decode(current_user, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            token_data = TokenPayload(**payload)
            user = db.query(User).filter(User.id == token_data.sub).first()
            if user:
                logged_in_user_id = user.id
                member = db.query(WorkspaceMember).filter(
                    WorkspaceMember.workspace_id == workspace.id,
                    WorkspaceMember.user_id == user.id
                ).first()
                if member and member.role == "Customer":
                    is_customer = True
        except Exception:
            pass

    # 2. Query tickets
    query = db.query(Ticket).filter(Ticket.workspace_id == workspace.id).order_by(Ticket.position.asc())
    
    # 3. If the user is a Customer, filter to only tickets they created
    if is_customer and logged_in_user_id:
        query = query.filter(Ticket.creator_id == logged_in_user_id)
        
    return query.all()

@router.get("/workspaces/{workspace_slug}/tickets/{ticket_id}", response_model=TicketSchema)
def get_ticket(
    workspace_slug: str,
    ticket_id: str,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(deps.verify_workspace_read_access),
    current_user: Optional[User] = Depends(deps.OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False))
) -> Any:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.workspace_id == workspace.id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found in this workspace")

    # If member is Customer, ensure they created the ticket
    if current_user:
        from jose import jwt
        from app.core.config import settings
        from app.schemas.user import TokenPayload
        try:
            payload = jwt.decode(current_user, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            token_data = TokenPayload(**payload)
            user = db.query(User).filter(User.id == token_data.sub).first()
            if user:
                member = db.query(WorkspaceMember).filter(
                    WorkspaceMember.workspace_id == workspace.id,
                    WorkspaceMember.user_id == user.id
                ).first()
                if member and member.role == "Customer" and ticket.creator_id != user.id:
                    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
        except HTTPException:
            raise
        except Exception:
            pass

    return ticket

@router.post("/workspaces/{workspace_slug}/tickets", response_model=TicketSchema)
def create_ticket(
    workspace_slug: str,
    *,
    db: Session = Depends(get_db),
    ticket_in: TicketCreate,
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    # Get max ticket number in this workspace
    from sqlalchemy import func
    max_num = db.query(func.max(Ticket.number)).filter(
        Ticket.workspace_id == current_member.workspace_id
    ).scalar() or 0
    new_number = max_num + 1

    db_ticket = Ticket(
        workspace_id=current_member.workspace_id,
        number=new_number,
        title=ticket_in.title,
        description=ticket_in.description,
        status=ticket_in.status,
        priority=ticket_in.priority,
        creator_id=current_user.id,
        assignee_id=ticket_in.assignee_id
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


from pydantic import BaseModel
from uuid import UUID

class TicketReorder(BaseModel):
    status: str
    ticket_ids: List[UUID]

@router.put("/workspaces/{workspace_slug}/tickets/reorder", response_model=Any)
def reorder_tickets(
    workspace_slug: str,
    *,
    db: Session = Depends(get_db),
    reorder_in: TicketReorder,
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member)
) -> Any:
    # Verify current member role
    if current_member.role not in ["Admin", "Agent"]:
        raise HTTPException(
            status_code=403,
            detail="Only Admins or Agents can reorder tickets."
        )
    
    # Bulk update ticket positions
    tickets = db.query(Ticket).filter(
        Ticket.workspace_id == current_member.workspace_id,
        Ticket.id.in_(reorder_in.ticket_ids)
    ).all()
    
    ticket_map = {ticket.id: ticket for ticket in tickets}
    
    for index, ticket_id in enumerate(reorder_in.ticket_ids):
        if ticket_id in ticket_map:
            ticket = ticket_map[ticket_id]
            ticket.status = reorder_in.status
            ticket.position = index
            
    db.commit()
    return {"status": "success", "message": "Tickets reordered successfully"}


@router.put("/workspaces/{workspace_slug}/tickets/{ticket_id}", response_model=TicketSchema)
def update_ticket(
    workspace_slug: str,
    ticket_id: str,
    *,
    db: Session = Depends(get_db),
    ticket_in: TicketUpdate,
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.workspace_id == current_member.workspace_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Authorization checks based on roles
    if current_member.role == "Customer":
        # Customers can only update their own tickets
        if ticket.creator_id != current_user.id:
            raise HTTPException(status_code=403, detail="Customers can only update their own tickets.")
        # Customers cannot change assignee, priority or set arbitrary status
        if ticket_in.assignee_id is not None and ticket_in.assignee_id != ticket.assignee_id:
            raise HTTPException(status_code=403, detail="Customers cannot change the ticket assignee.")
        if ticket_in.priority is not None and ticket_in.priority != ticket.priority:
            raise HTTPException(status_code=403, detail="Customers cannot change the ticket priority.")
        if ticket_in.status is not None and ticket_in.status not in ["Closed", "Open", ticket.status]:
            # Customers are only allowed to Open or Close their ticket
            raise HTTPException(status_code=403, detail="Customers can only set status to Open or Closed.")


    # Apply updates
    update_data = ticket_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ticket, field, value)

    db.commit()
    db.refresh(ticket)
    return ticket

@router.delete("/workspaces/{workspace_slug}/tickets/{ticket_id}", response_model=Any)
def delete_ticket(
    workspace_slug: str,
    ticket_id: str,
    db: Session = Depends(get_db),
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member)
) -> Any:
    if current_member.role != "Admin":
        raise HTTPException(status_code=403, detail="Only workspace Admins can delete tickets.")
        
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.workspace_id == current_member.workspace_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    db.delete(ticket)
    db.commit()
    return {"status": "success", "message": "Ticket deleted successfully"}


