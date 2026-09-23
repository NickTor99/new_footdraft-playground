from fastapi import status

from common_exceptions import ServiceException


class DuplicateGroupNameError(ServiceException):
    """
    Sollevata quando un utente tenta di registrarsi con un'email
    o un username già esistente (Violazione di unicità).
    Corrisponde a HTTP 409 Conflict.
    """
    def __init__(self, detail: str = "Nome del gruppo già esistente."):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class UserAlreadyInGroup(ServiceException):
    """
    Sollevata quando un utente invia una richiesta ad un gruppo a cui già appartiene.
    Corrisponde a HTTP 409 Conflict.
    """
    def __init__(self, detail: str = "Utente già nel gruppo."):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class UserNotAdmin(ServiceException):
    """
    Sollevata quando un utente invia una richiesta che richiede privilegi da admin ma non lo è.
    Corrisponde a HTTP 401 UNAUTHORIZED.
    """
    def __init__(self, detail: str = "Utente non ha i permessi per effettuare questa operazione."):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


class UserNotMember(ServiceException):
    """
    Sollevata quando un utente invia una richiesta ad un gruppo di cui non è membro.
    Corrisponde a HTTP 401 UNAUTHORIZED.
    """
    def __init__(self, detail: str = "Utente non è membro del gruppo."):
        super().__init__(status_code=status.HTTP_405_METHOD_NOT_ALLOWED, detail=detail)


class RequestNotFound(ServiceException):
    """
    Sollevata quando un utente invia una richiesta ad un gruppo di cui non è membro.
    Corrisponde a HTTP 404 Not Found.
    """
    def __init__(self, detail: str = "Richiesta di accesso non trovata o scaduta."):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class RequestAlreadySent(ServiceException):
    """
    Sollevata quando un utente invia una richiesta ad un gruppo a cui l'ha già inviata.
    Corrisponde a HTTP 409 Conflict.
    """
    def __init__(self, detail: str = "Hai già inviato una richista di accesso a questo gruppo"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class GroupNotExists(ServiceException):
    """
    Sollevata quando un utente invia una richiesta ad un gruppo che non esiste.
    Corrisponde a HTTP 404 Not Found.
    """
    def __init__(self, detail: str = "Il gruppo specificato non esiste più."):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class GroupIsFull(ServiceException):
    """
    Sollevata quando si tenta di superare il limite massimo di utenti in un gruppo.
    Corrisponde a HTTP 406 NOT ACCEPTABLE.
    """
    def __init__(self, detail: str = "Limite massimo di utenti del gruppo raggiunto."):
        super().__init__(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail=detail)


class PlayerNotFound(ServiceException):
    """Eccezione sollevata quando il giocatore non esiste."""
    def __init__(self, detail: str = "Player non trovato."):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class PlayerAlreadyExists(ServiceException):
    """Eccezione sollevata quando il giocatore non esiste."""
    def __init__(self, detail: str = "Player esiste già."):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class AssociationError(ServiceException):
    """Eccezione per errori di associazione (es. slot occupato)."""
    def __init__(self, detail: str = "Il gruppo specificato non esiste più."):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)
