from typing import Optional

from pydantic import BaseModel, EmailStr, Field

# Definizione della struttura dell'entità 'User' come viene archiviata nel DB.
# Questa classe viene usata nel Repository e nel Service Layer.


class User(BaseModel):
    """
    Rappresentazione Pydantic della riga del DB (Entity/Model).
    """
    # Campi obbligatori e PK
    userid: str = Field(..., description="UUID dell'utente, generato dal DB.")
    email: EmailStr
    username: str
    passwordhash: str # L'hash della password (non la password in chiaro)
    imageurl: Optional[str] = Field(default='http://localhost:9000/users/placeholder')

    # Configurazione essenziale per mappare i record del DB (Raw SQL)
    # Questa configurazione indica a Pydantic di leggere i dati dagli attributi
    # (o chiavi di dict, come nel caso di asyncpg.Record)
    class Config:
        from_attributes = True # Pydantic v2
        # orm_mode = True # Pydantic v1