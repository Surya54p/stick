from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api import deps
from app.models.user import User, WorkspaceMember
from app.models.workspace import Workspace
from app.models.ticket import Ticket
from app.models.comment import Comment
from app.schemas.comment import Comment as CommentSchema, CommentCreate

router = APIRouter()

@router.get("/workspaces/{slug}/tickets/{ticket_id}/comments", response_model=List[CommentSchema])
def list_comments(
    slug: str,
    ticket_id: str,
    db: Session = Depends(get_db),
    workspace: Workspace = Depends(deps.verify_workspace_read_access),
    current_user: Optional[User] = Depends(deps.OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False))
) -> Any:
    # Verify ticket exists in this workspace
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

    return db.query(Comment).filter(Comment.ticket_id == ticket.id).order_by(Comment.created_at.asc()).all()

@router.post("/workspaces/{slug}/tickets/{ticket_id}/comments", response_model=CommentSchema)
def create_comment(
    slug: str,
    ticket_id: str,
    *,
    db: Session = Depends(get_db),
    comment_in: CommentCreate,
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member),
    current_user: User = Depends(deps.get_current_active_user)
) -> Any:
    # Verify ticket exists in this workspace
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id, Ticket.workspace_id == current_member.workspace_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # If Customer, ensure they created the ticket
    if current_member.role == "Customer" and ticket.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Customers can only comment on their own tickets.")

    db_comment = Comment(
        ticket_id=ticket.id,
        user_id=current_user.id,
        content=comment_in.content
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment
