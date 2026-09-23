from typing import Optional

from pydantic import BaseModel, Field


class PlayerProfile(BaseModel):
    """
    Rappresentazione dell'Entity Database 'player_profile'.
    """
    playerid: Optional[str] = None
    nickname: str
    groupid: str = None
    linckeduserid: Optional[str] = None
    velocita: int
    attacco: int
    difesa: int
    tecnica: int
    avatar: Optional[str] = None

    class Config:
        populate_by_name = True
