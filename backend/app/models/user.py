import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class WorkspaceMember(Base):
    __tablename__ = "workspace_members"
    
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role = Column(String, nullable=False, default="Customer") # Admin | Agent | Customer
    
    workspace = relationship("Workspace", back_populates="members")
    user = relationship("User", back_populates="workspaces")

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    workspaces = relationship("WorkspaceMember", back_populates="user", cascade="all, delete-orphan")
    created_tickets = relationship("Ticket", back_populates="creator", foreign_keys="[Ticket.creator_id]")
    assigned_tickets = relationship("Ticket", back_populates="assignee", foreign_keys="[Ticket.assignee_id]")
    comments = relationship("Comment", back_populates="user")
