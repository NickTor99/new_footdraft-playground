from fastapi import status

# ====================================================================
# BASE EXCEPTION (Eccezione generica per il Service Layer)
# ====================================================================


class ServiceException(Exception):
    def __init__(self, status_code: int, detail: str, error_code: str = "SERVICE_ERROR"):
        self.status_code = status_code
        self.detail = detail
        self.error_code = error_code
        super().__init__(self.detail)


class InternalServerError(ServiceException):
    """
    Errore generico del server (non dipende dallo user)
    """
    def __init__(self, detail: str = "Errore interno al server"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)