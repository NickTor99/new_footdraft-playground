from datetime import datetime
from pydantic import BaseModel, Field
from models.MoveType import MoveType
from models.EvensOddsChoice import EvensOddsChoice


class DraftMove(BaseModel):
    captainId: str
    type: MoveType
    value: int | str | EvensOddsChoice = Field(default='')
    timestamp: datetime = Field(default=datetime.now().isoformat())
