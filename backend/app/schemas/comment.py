from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    pass

class CommentInDBBase(CommentBase):
    id: UUID
    ticket_id: UUID
    user_id: UUID | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class Comment(CommentInDBBase):
    pass
