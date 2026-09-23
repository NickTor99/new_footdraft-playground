from pydantic import BaseModel, Field


class Membership(BaseModel):
    """
    Entità che rappresenta l'associazione utente-gruppo nella tabella 'membership'.
    Nota: userId è una Foreign Key logica al DB S_AUTH.
    """
    groupid: str = Field(..., description="ID del gruppo (FK a group_table).")
    userid: str = Field(..., description="ID dell'utente (FK logica a S_AUTH).")
    userrole: str = Field(..., max_length=20, description="Ruolo dell'utente nel gruppo (es. 'admin', 'member').")

    class Config:
        from_attributes = True