from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Literal["low", "medium", "high"] = "medium"
    status: Literal["todo", "in_progress", "done"] = "todo"
    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[Literal["low", "medium", "high"]] = None
    status: Optional[Literal["todo", "in_progress", "done"]] = None
    due_date: Optional[datetime] = None


class TaskOut(BaseModel):
    id: str
    title: str
    description: Optional[str]
    priority: str
    status: str
    due_date: Optional[datetime]
    owner_id: str
    owner_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
