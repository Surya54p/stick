from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.api import deps
from app.models.user import User, WorkspaceMember
from app.models.workspace import Workspace
from app.models.aduan import AduanService
from app.models.ticket import Ticket
from app.schemas.aduan import (
    AduanService as AduanServiceSchema,
    AduanServiceCreate,
    AduanServiceUpdate,
    AduanServicePublic
)
from app.schemas.ticket import Ticket as TicketSchema
from pydantic import BaseModel

router = APIRouter()

# ----------------- MEMBER ENDPOINTS -----------------

@router.post("/workspaces/{workspace_slug}/aduan-services", response_model=AduanServiceSchema)
def create_aduan_service(
    workspace_slug: str,
    *,
    db: Session = Depends(get_db),
    service_in: AduanServiceCreate,
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member)
) -> Any:
    # Check if current member is Admin
    if current_member.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Only Admins can manage complaint services."
        )

    # Check if slug is unique generally
    existing = db.query(AduanService).filter(AduanService.slug == service_in.slug).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Aduan service with this slug already exists."
        )

    db_service = AduanService(
        workspace_id=current_member.workspace_id,
        name=service_in.name,
        slug=service_in.slug,
        description=service_in.description,
        is_open=service_in.is_open,
        fields_schema=service_in.fields_schema,
        require_login=service_in.require_login
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


@router.get("/workspaces/{workspace_slug}/aduan-services", response_model=List[AduanServiceSchema])
def list_aduan_services(
    workspace_slug: str,
    db: Session = Depends(get_db),
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member)
) -> Any:
    # Query all aduan services in the workspace
    services = db.query(AduanService).filter(AduanService.workspace_id == current_member.workspace_id).all()
    
    # Calculate complaint count for each service
    for service in services:
        count = db.query(func.count(Ticket.id)).filter(
            Ticket.aduan_service_id == service.id
        ).scalar()
        service.complaint_count = count
        
    return services


@router.get("/workspaces/{workspace_slug}/aduan-services/{service_id}", response_model=AduanServiceSchema)
def get_aduan_service(
    workspace_slug: str,
    service_id: str,
    db: Session = Depends(get_db),
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member)
) -> Any:
    service = db.query(AduanService).filter(
        AduanService.id == service_id,
        AduanService.workspace_id == current_member.workspace_id
    ).first()
    if not service:
        raise HTTPException(status_code=404, detail="Aduan service not found")

    count = db.query(func.count(Ticket.id)).filter(
        Ticket.aduan_service_id == service.id
    ).scalar()
    service.complaint_count = count

    return service


@router.put("/workspaces/{workspace_slug}/aduan-services/{service_id}", response_model=AduanServiceSchema)
def update_aduan_service(
    workspace_slug: str,
    service_id: str,
    *,
    db: Session = Depends(get_db),
    service_in: AduanServiceUpdate,
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member)
) -> Any:
    if current_member.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Only Admins can manage complaint services."
        )

    service = db.query(AduanService).filter(
        AduanService.id == service_id,
        AduanService.workspace_id == current_member.workspace_id
    ).first()
    if not service:
        raise HTTPException(status_code=404, detail="Aduan service not found")

    # If slug is changing, verify uniqueness
    if service_in.slug is not None and service_in.slug != service.slug:
        existing = db.query(AduanService).filter(AduanService.slug == service_in.slug).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Aduan service with this slug already exists."
            )

    update_data = service_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)

    db.commit()
    db.refresh(service)

    count = db.query(func.count(Ticket.id)).filter(
        Ticket.aduan_service_id == service.id
    ).scalar()
    service.complaint_count = count

    return service


@router.delete("/workspaces/{workspace_slug}/aduan-services/{service_id}", response_model=Any)
def delete_aduan_service(
    workspace_slug: str,
    service_id: str,
    db: Session = Depends(get_db),
    current_member: WorkspaceMember = Depends(deps.get_current_workspace_member)
) -> Any:
    if current_member.role != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Only Admins can manage complaint services."
        )

    service = db.query(AduanService).filter(
        AduanService.id == service_id,
        AduanService.workspace_id == current_member.workspace_id
    ).first()
    if not service:
        raise HTTPException(status_code=404, detail="Aduan service not found")

    db.delete(service)
    db.commit()
    return {"status": "success", "message": "Aduan service deleted successfully"}

# ----------------- PUBLIC ENDPOINTS -----------------

class PublicComplaintSubmit(BaseModel):
    email: str | None = None
    title: str | None = None
    priority: str = "Medium" # Low | Medium | High | Urgent
    description: str | None = None
    custom_responses: dict[str, Any] | None = None

@router.get("/public/aduan-services/{slug}", response_model=AduanServicePublic)
def get_public_aduan_service(
    slug: str,
    db: Session = Depends(get_db)
) -> Any:
    service = db.query(AduanService).filter(AduanService.slug == slug).first()
    if not service:
        raise HTTPException(status_code=404, detail="Aduan service not found")
    return service

@router.post("/public/aduan-services/{slug}/submit", response_model=TicketSchema)
def submit_public_complaint(
    slug: str,
    *,
    db: Session = Depends(get_db),
    complaint_in: PublicComplaintSubmit,
    current_user_token: Optional[str] = Depends(deps.OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False))
) -> Any:
    service = db.query(AduanService).filter(AduanService.slug == slug).first()
    if not service:
        raise HTTPException(status_code=404, detail="Aduan service not found")
        
    if not service.is_open:
        raise HTTPException(
            status_code=400,
            detail="This complaint service is currently closed."
        )

    # Decode authenticated user if token is present
    logged_in_user = None
    if current_user_token:
        from jose import jwt
        from app.core.config import settings
        from app.schemas.user import TokenPayload
        try:
            payload = jwt.decode(current_user_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            token_data = TokenPayload(**payload)
            logged_in_user = db.query(User).filter(User.id == token_data.sub).first()
        except Exception:
            pass

    # Enforce authentication if required by the complaint service
    if service.require_login and not logged_in_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication is required to submit complaints on this service."
        )

    # Get max ticket number in this workspace
    max_num = db.query(func.max(Ticket.number)).filter(
        Ticket.workspace_id == service.workspace_id
    ).scalar() or 0
    new_number = max_num + 1

    # Auto-generate title and description from custom_responses if not provided
    final_title = complaint_in.title
    final_description = complaint_in.description
    final_email = logged_in_user.email if logged_in_user else complaint_in.email

    if not final_title:
        if complaint_in.custom_responses:
            # Use first non-empty text response as title
            for val in complaint_in.custom_responses.values():
                if isinstance(val, str) and val.strip() and not val.startswith("data:"):
                    final_title = val.strip()[:120]
                    break
        if not final_title:
            final_title = f"Aduan #{new_number} - {service.name}"

    if not final_description and complaint_in.custom_responses:
        # Build description summary from all custom responses
        parts = []
        for key, val in complaint_in.custom_responses.items():
            if isinstance(val, str) and not val.startswith("data:"):
                parts.append(val)
            elif isinstance(val, list):
                parts.append(", ".join(val))
        final_description = "\n".join(parts) if parts else None

    db_ticket = Ticket(
        workspace_id=service.workspace_id,
        number=new_number,
        title=final_title,
        description=final_description,
        status="Open",
        priority=complaint_in.priority,
        creator_id=logged_in_user.id if logged_in_user else None,
        assignee_id=None,
        aduan_service_id=service.id,
        creator_email=final_email,
        custom_responses=complaint_in.custom_responses
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket
