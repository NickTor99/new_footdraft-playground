from typing import List

from pydantic import BaseModel, Field


class CreateDraftDTO(BaseModel):
    availablePlayers: List[str] = Field(max_length=22)
    name: str = Field(min_length=3, max_length=30)
