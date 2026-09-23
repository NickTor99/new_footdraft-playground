from typing import Optional

from pydantic import BaseModel, Field


class AuthTokenDTO(BaseModel):
    access_token: str
    token_type: str = "Bearer"


class GroupDetailDTO(BaseModel):
    """
    DTO per la visualizzazione di un gruppo specifico.
    Include i dettagli base del gruppo e la lista dei membri.
    """
    group_name: str = Field(min_length=3, max_length=30)
    max_member: int = Field(ge=4, le=50)
    description: str = Field(min_length=0, max_length=500)
    category: str
    is_private: bool


class ActionConfirmationDTO(BaseModel):
    """
    DTO di risposta per la creazione di richieste/inviti.
    """
    message: str
    action_id: Optional[str]
    user: Optional[dict] = None

# ====================================================================
# INPUT DTOs (Usati per le richieste HTTP)
# ====================================================================


class UserIdDTO(BaseModel):
    """
    Input per POST /groups/{groupId}/invite.
    Contiene l'ID dell'utente target.
    """
    user_id: str = Field(..., description="ID dell'utente target (FK logica a S_AUTH).")


class MembershipRoleUpdateDTO(BaseModel):
    """
    Input per PUT /groups/{groupId}/members/{userId}/role.
    """
    new_role: str = Field(..., pattern="^(MEMBER|ADMIN)$", description="Il nuovo ruolo deve essere 'MEMBER' o 'ADMIN'.")


class ActionStatusDTO(BaseModel):
    """
    Input per PUT /request/{requestId} e PUT /invite/{inviteId}.
    """
    status: str = Field(..., pattern="^(ACCEPTED|REJECTED)$", description="Lo stato deve essere 'accepted' o 'rejected'.")


class RefreshTokenDTO(BaseModel):
    """
    Input per POST /auth/refresh (se necessario, ma definito in S_AUTH).
    """
    refresh_token: str


class PlayerCreateDTO(BaseModel):
    """DTO per la creazione di un giocatore."""
    nickname: str
    velocita: int
    attacco: int
    difesa: int
    tecnica: int


class PlayerStatsUpdateDTO(BaseModel):
    """DTO per l'aggiornamento delle statistiche."""
    velocita: int
    attacco: int
    difesa: int
    tecnica: int


class AssociationDTO(BaseModel):
    """DTO per l'associazione utente."""
    user_id: str