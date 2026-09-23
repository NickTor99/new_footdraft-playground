from typing import List, Optional
import httpx
from httpx import AsyncClient

from service_configuration import AppState as state

GROUP_SERVICE_URL = "http://localhost:8001"


class SingletonMeta(type):
    """
    Metaclasse thread-safe per implementare il pattern Singleton.
    Ogni volta che si chiama MyClass(), questa metaclasse controlla se
    l'istanza esiste già. Se sì, la restituisce; altrimenti ne crea una nuova.
    """
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]


class ServiceClient(metaclass=SingletonMeta):
    """
    Client che permette la comunicazione tra i microservizi.
    Implementato come Singleton.
    """

    def __init__(self):
        # Variabile interna per cachare il client una volta recuperato
        self._http_client: Optional[httpx.AsyncClient] = AsyncClient(timeout=15.0)

    @property
    def http_client(self) -> httpx.AsyncClient:
        """
        Recupera il client HTTP.
        Logica:
        1. Se lo abbiamo già in memoria (self._http_client), usalo.
        2. Se non c'è, prova a prenderlo dallo stato globale (state.http_client).
        """
        if self._http_client is None:
            # Fallback sullo stato globale
            if hasattr(state, 'http_client') and state.http_client is not None:
                self._http_client = state.http_client
            else:
                # Opzionale: Inizializzane uno nuovo se manca quello globale
                # self._http_client = httpx.AsyncClient()
                raise RuntimeError("HTTP Client non inizializzato in AppState.")

        return self._http_client

    def set_override_client(self, client: httpx.AsyncClient):
        """
        Metodo utile per i TEST: permette di iniettare un client fittizio (Mock)
        ignorando lo stato globale.
        """
        self._http_client = client
