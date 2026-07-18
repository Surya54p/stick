from pydantic import BaseModel
from typing import Any, List
from uuid import UUID
from datetime import datetime

class AduanServiceBase(BaseModel):
    name: str
    slug: str
    description: str | None = None
    is_open: bool = True
    fields_schema: List[Any] | None = None
    require_login: bool = False

class AduanServiceCreate(AduanServiceBase):
    pass

class AduanServiceUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    is_open: bool | None = None
    fields_schema: List[Any] | None = None
    require_login: bool | None = None

class AduanServiceInDBBase(AduanServiceBase):
    id: UUID
    workspace_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AduanService(AduanServiceInDBBase):
    complaint_count: int = 0

class AduanServicePublic(BaseModel):
    name: str
    description: str | None = None
    is_open: bool
    fields_schema: List[Any] | None = None
    require_login: bool = False

    class Config:
        from_attributes = True
