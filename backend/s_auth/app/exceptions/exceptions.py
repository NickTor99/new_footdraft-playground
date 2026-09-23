from fastapi import status
from common_exceptions import ServiceException

# ====================================================================
# ECCEZIONI DI REGISTRAZIONE (UC-U01)
# ====================================================================


class DuplicateUserError(ServiceException):
    """
    Sollevata quando un utente tenta di registrarsi con un'email
    o un username già esistente (Violazione di unicità).
    Corrisponde a HTTP 409 Conflict.
    """
    def __init__(self, detail: str = "Email o username già registrato."):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class RegistrationValidationError(ServiceException):
    """
    Sollevata quando i dati di registrazione non passano la validazione
    (es. password troppo debole, non coperto da Pydantic, ma gestito nel Service).
    Corrisponde a HTTP 400 Bad Request.
    """
    def __init__(self, detail: str = "Dati di registrazione non validi."):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

# ====================================================================
# ECCEZIONI DI AUTENTICAZIONE/ACCESSO (UC-U02 e Validazione JWT)
# ====================================================================


class CredentialsError(ServiceException):
    """
    Sollevata quando l'autenticazione fallisce a causa di credenziali errate
    (email non trovata o password errata).
    Corrisponde a HTTP 401 Unauthorized.
    """
    def __init__(self, detail: str = "Credenziali non valide."):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class InvalidTokenError(ServiceException):
    """
    Sollevata quando la firma non è valida,
    Corrisponde a HTTP 401 Unauthorized.
    """
    def __init__(self, detail: str = "Token JWT non valido."):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class ExpiredTokenError(ServiceException):
    """
    Sollevata quando il token JWT è scaduto,
    Corrisponde a HTTP 401 Unauthorized.
    """
    def __init__(self, detail: str = "Token JWT scaduto."):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class UserNotFoundError(ServiceException):
    """
    Sollevata quando si cerca un utente (es. per ID) ma non viene trovato.
    Corrisponde a HTTP 404 Not Found.
    """
    def __init__(self, detail: str = "Utente non trovato."):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)