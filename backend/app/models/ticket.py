import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    number = Column(Integer, nullable=False, default=1)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="Open") # Open | In Progress | Resolved | Closed
    priority = Column(String, nullable=False, default="Medium") # Low | Medium | High | Urgent
    position = Column(Integer, nullable=False, default=0)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assignee_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    aduan_service_id = Column(UUID(as_uuid=True), ForeignKey("aduan_services.id", ondelete="SET NULL"), nullable=True)
    creator_email = Column(String, nullable=True)
    custom_responses = Column(JSON, nullable=True)  # Answers to custom form fields
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    workspace = relationship("Workspace", back_populates="tickets")
    creator = relationship("User", foreign_keys=[creator_id], back_populates="created_tickets")
    assignee = relationship("User", foreign_keys=[assignee_id], back_populates="assigned_tickets")
    comments = relationship("Comment", back_populates="ticket", cascade="all, delete-orphan")
    aduan_service = relationship("AduanService", back_populates="tickets")

    @property
    def creator_name(self) -> str | None:
        if self.creator:
            return self.creator.full_name or self.creator.email
        return self.creator_email or "Anonim"

    @property
    def assignee_name(self) -> str | None:
        if self.assignee:
            return self.assignee.full_name or self.assignee.email
        return None
