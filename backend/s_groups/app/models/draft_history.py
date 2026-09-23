from datetime import datetime

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class TeamHistory(BaseModel):
    """
    Rappresenta la squadra formata durante il draft.
    Contiene il nome del team (es. "Team Mario") e la lista dei giocatori.
    """
    team_id: str
    name: str
    # Usiamo List[Dict] per salvare uno snapshot completo del giocatore (id, nome, ruolo, valore)
    # al momento della selezione, indipendente da futuri cambiamenti nel DB giocatori.
    players: List[str] = Field(default_factory=list)


class CaptainHistory(BaseModel):
    """
    Rappresenta i dati storici di un capitano partecipante al draft.
    """
    captain_id: str
    captain_username: str
    user_id: str
    team: TeamHistory


class DraftHistory(BaseModel):
    """
    DTO finale che rappresenta l'intero storico di una sessione di Draft conclusa.
    Questo oggetto viene inviato al Group Service per l'archiviazione a lungo termine.
    """
    name: str
    session_id: str
    group_id: str
    captain1: CaptainHistory
    captain2: CaptainHistory
    timestamp: Optional[datetime] = None # Utile per ordinare lo storico