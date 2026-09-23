from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, EmailStr, field_validator, ValidationError, model_validator, Field
from typing import Optional, Any, List


# Definizione del DTO per la richiesta di registrazione utente
class UserRegistrationDTO(BaseModel):
    """
    DTO per la richiesta POST /auth/register.
    Contiene le regole di validazione per i campi.
    """
    email: EmailStr  # Pydantic verifica automaticamente il formato email
    username: str
    password: str

    # =================================================================
    # Validatori Personalizzati (Logica di Business per la Sicurezza)
    # =================================================================

    @field_validator('username')
    @classmethod
    def validate_username_length(cls, v: str) -> str:
        """
        Assicura che lo username abbia una lunghezza accettabile.
        """
        if not (3 <= len(v) <= 30):
            raise RequestValidationError('Lo username deve essere tra 3 e 30 caratteri.')
        return v

    @field_validator('password')
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        """
        Assicura che la password sia sufficientemente complessa (regola RFN-S01).
        Requisiti minimi: 8 caratteri, una maiuscola, una minuscola, un numero e un simbolo.
        """
        if len(v) < 8:
            raise RequestValidationError('La password deve essere lunga almeno 8 caratteri.')
        if not any(char.isupper() for char in v):
            raise RequestValidationError('La password deve contenere almeno una lettera maiuscola.')
        if not any(char.islower() for char in v):
            raise RequestValidationError('La password deve contenere almeno una lettera minuscola.')
        if not any(char.isdigit() for char in v):
            raise RequestValidationError('La password deve contenere almeno un numero.')
        if not any(char in '!@#$%^&*()-_+=<>?/[]{}|' for char in v):
            raise RequestValidationError('La password deve contenere almeno un simbolo (!@#$...).')

        return v

# DTO di input per il Login
class UserLoginDTO(BaseModel):
    # Rendi entrambi i campi opzionali
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    password: str

    @model_validator(mode='before')
    @classmethod
    def check_required_fields(cls, data: Any) -> Any:
        """
        Garantisce che almeno uno tra 'username' e 'email' sia presente nel payload.
        """
        # Se 'data' è un oggetto, convertilo in un dizionario per la verifica
        if not isinstance(data, dict):
            # Questa conversione può variare a seconda dell'input (es. JSON vs FormData)
            data = dict(data)

            # Estrarre i valori, default a None se non presenti
        username_present = data.get('username')
        email_present = data.get('email')

        # Controlla la condizione
        if not (username_present or email_present):
            raise ValueError('È richiesto almeno uno tra "username" e "email" per il login.')

        return data


class UsernameUpdateDTO(BaseModel):
    new_username: str

    @field_validator('new_username')
    @classmethod
    def validate_username_length(cls, v: str) -> str:
        """
        Assicura che lo username abbia una lunghezza accettabile.
        """
        if not (3 <= len(v) <= 30):
            raise ValueError('Lo username deve essere tra 3 e 30 caratteri.')
        return v


class UserImageUpdateDTO(BaseModel):
    user_image_base64: str


class PasswordUpdateDTO(BaseModel):
    current_password: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        """
        Assicura che la password sia sufficientemente complessa (regola RFN-S01).
        Requisiti minimi: 8 caratteri, una maiuscola, una minuscola, un numero e un simbolo.
        """
        if len(v) < 8:
            raise ValueError('La password deve essere lunga almeno 8 caratteri.')
        if not any(char.isupper() for char in v):
            raise ValueError('La password deve contenere almeno una lettera maiuscola.')
        if not any(char.islower() for char in v):
            raise ValueError('La password deve contenere almeno una lettera minuscola.')
        if not any(char.isdigit() for char in v):
            raise ValueError('La password deve contenere almeno un numero.')
        if not any(char in '!@#$%^&*()-_+=<>?/[]{}|' for char in v):
            raise ValueError('La password deve contenere almeno un simbolo (!@#$...).')

        return v


# DTO di output per il Token di Autenticazione
class AuthTokenDTO(BaseModel):
    access_token: str
    token_type: str = "Bearer"


# --- DTO di Output per le Informazioni Pubbliche (Batch) ---
class UserPublicInfoDTO(BaseModel):
    """
    Informazioni essenziali dell'utente da esporre agli altri microservizi
    (es. S_GROUP).
    """
    userid: str = Field(..., alias="id", description="UUID dell'utente.")
    username: str
    imageurl: Optional[str] = Field(default='http://localhost:9000/users/placeholder')

    # Aggiungi qui qualsiasi altra informazione pubblica necessaria,
    # es. avatar_url: Optional[str] = None

    class Config:
        # Permette di mappare i campi del DB (es. 'id') ai campi Pydantic (es. 'user_id')
        populate_by_name = True

# --- DTO di Input per l'Endpoint Batch ---
class UserIdListDTO(BaseModel):
    """
    DTO per ricevere una lista di ID utente nell'endpoint batch POST.
    """
    user_ids: List[str]

