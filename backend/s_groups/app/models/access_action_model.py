from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AccessAction(BaseModel):
    """
    Entità che rappresenta una richiesta di accesso o un invito (access_action).
    """
    actionid: str = Field(..., description="UUID dell'azione.")
    groupid: Optional[str] = Field(..., description="ID del gruppo associato all'azione.")

    # Utente target dell'azione (es. l'invitato)
    targetuserid: str = Field(..., description="ID dell'utente che è il target (FK logica).")

    # Utente che ha creato l'azione (es. l'amministratore che invita)
    creatoruserid: str = Field(..., description="ID dell'utente che ha creato l'azione (FK logica).")

    expire: datetime = Field(..., description="Timestamp di scadenza dell'azione.")
    status: Optional[str] = Field(..., max_length=20, description="Stato dell'azione (es. 'pending', 'accepted', 'rejected').")
    actiontype: Optional[str] = Field(..., max_length=20, description="Tipo di azione (es. 'invite', 'request_join').")

    class Config:
        from_attributes = True