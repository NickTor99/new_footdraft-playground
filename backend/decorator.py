import functools
import logging

from common_exceptions import InternalServerError
from common_exceptions import ServiceException
from elastic_manager import ElasticManager
from service_configuration import AppState as state


def with_db_connection(func):
    """
    Decorator che gestisce l'acquisizione e il rilascio di una connessione
    dal pool prima e dopo l'esecuzione del metodo.
    La connessione (conn) viene passata come primo argomento al metodo decorato.
    """
    @functools.wraps(func)
    async def wrapper(self, *args, **kwargs):
        conn = None
        postgres_manager = state.postgres_manager
        try:
            conn = await postgres_manager.get_connection()
            result = await func(self, conn, *args, **kwargs)
            return result
        except Exception as e:
            raise ServiceException(status_code=500, detail=f"\n[ERRORE nel Decorator Asincrono]: {e}")
        finally:
            if conn:
                await postgres_manager.release_connection(conn)

    return wrapper


# Configurazione base del logging
logging.basicConfig(level=logging.ERROR)

def with_elastic_search_connection(func):
    @functools.wraps(func)
    def wrapper(self, *args, **kwargs) -> ElasticManager:
        conn = state.elastic_manager
        result = func(self, conn, *args, **kwargs)
        return result

    return wrapper

def service_exception_handler(*allowed_exceptions):
    """
    Decorator factory che crea il wrapper.
    Args:
        *allowed_exceptions: Tuple di classi di eccezioni di business da NON intercettare.
    """
    def decorator(func):
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                # Esegue il metodo del Service
                return await func(*args, **kwargs)

            # 1. Eccezione: Cattura TUTTE le eccezioni per prima
            except Exception as e:

                # 2. CONTROLLO: Se l'eccezione è di un tipo consentito (di business), la RILANCIA
                if isinstance(e, allowed_exceptions):
                    raise e # 👈 Questa riga fa passare l'errore di business al Controller

                # 3. GESTIONE SISTEMA: Se NON è di un tipo consentito, è un errore inaspettato (I/O, bug, DB)
                logging.error(f"Errore inaspettato nel Service '{func.__name__}': {e}", exc_info=True)

                # 4. Converte in Errore 500
                raise InternalServerError(detail="Si è verificato un errore inaspettato durante l'operazione.")

        return wrapper
    return decorator
