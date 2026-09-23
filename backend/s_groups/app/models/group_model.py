from datetime import datetime

from pydantic import BaseModel, Field


# Definizione della struttura dell'entità 'User' come viene archiviata nel DB.
# Questa classe viene usata nel Repository e nel Service Layer.


class Group(BaseModel):
    """
    Rappresentazione Pydantic della riga del DB (Entity/Model).
    """
    # Campi obbligatori e PK
    groupid: str = Field(max_length=50, description="UUID del gruppo.")
    creatorid: str = Field(max_length=50, description="UUID dell'utente creatore.")
    groupname: str = Field(min_length=3, max_length=30)
    description: str = Field(min_length=0, max_length=500)
    category: str
    maxmember: int = Field(ge=4, le=50)
    membercount: int = Field(ge=0, le=50)
    isprivate: bool
    createdat: datetime

    # Configurazione essenziale per mappare i record del DB (Raw SQL)
    # Questa configurazione indica a Pydantic di leggere i dati dagli attributi
    # (o chiavi di dict, come nel caso di asyncpg.Record)
    class Config:
        from_attributes = True # Pydantic v2
        # orm_mode = True # Pydantic v1