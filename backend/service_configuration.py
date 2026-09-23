from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
from contextlib import asynccontextmanager
import os
from pathlib import Path
import redis.asyncio as redis
from redis import Redis
from fastapi.exceptions import RequestValidationError
from httpx import AsyncClient
from fastapi import Request
from fastapi import status
from starlette.responses import JSONResponse
from elastic_manager import AsyncElasticManager

from common_exceptions import ServiceException
from postgres_manager import PostgresManager
from storage_client import StorageClient


class AppState:
    http_client: AsyncClient
    postgres_manager: PostgresManager
    redis_client: Redis
    storage_client: StorageClient
    elastic_manager: AsyncElasticManager
    service_auth_host: str


def service_configuration(title: str, routers: list[APIRouter], storage_bucket_name: str = None, debug_mode=False):
    current_file_dir = Path(os.path.dirname(os.path.abspath(__file__)))
    print(current_file_dir)

    if debug_mode:
        load_dotenv(os.getcwd()+'/.env_debug')
        AppState.service_auth_host = "http://localhost:8000/auth/validate"
    else:
        AppState.service_auth_host = "http://auth_service:8000/auth/validate"
        load_dotenv(os.getcwd()+'/.env')

    AppState.debug_mode = debug_mode

    # --- Estrazione delle Variabili d'Ambiente ---
    database_url = os.getenv('DATABASE_URL',"")
    master_url = os.getenv('MASTER_DATABASE_URL',"")
    redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
    db_name = os.getenv("DB_NAME", "")
    storage_access_key = os.getenv("STORAGE_ACCESS_KEY", "")
    storage_secret_key = os.getenv("STORAGE_SECRET_KEY", "")
    storage_hostname = os.getenv("STORAGE_HOSTNAME", "minio:9000")
    elastic_url = os.getenv("ELASTIC_SEARCH_URL", "")

    if not database_url or not master_url:
        # Errore critico se non trova le URL del DB
        raise EnvironmentError("Variabili DATABASE_URL o MASTER_DATABASE_URL non configurate.")

    # Inizializzazione delle risorse che verranno usate nel lifespan
    # Vengono inizializzate qui perché sono oggetti 'pesanti' che devono esistere prima del ciclo di vita.
    postgres_manager = PostgresManager()

    # --------------------------------------------------------------------------
    # --- Definizione del Lifespan (Async Context Manager) ---
    # --------------------------------------------------------------------------
    @asynccontextmanager
    async def lifespan(app: FastAPI):

        # --- Fase di Startup ---
        print(f"[{title}] Avvio configurazione...")

        # Eseguito prima di stabilire il pool principale (se necessario)
        await postgres_manager.create_database_if_not_exists(
            db_name=db_name, # Nota: 'user_db' dovrebbe essere dinamico se usi la funzione per più servizi
            master_url=master_url,
            database_url=database_url
        )

        # 1. Stabilisce il pool di connessioni DB
        await postgres_manager.connect_to_db(database_url=database_url)

        AppState.postgres_manager = postgres_manager

        # 2. Crea l'istanza del client HTTP (una sola volta)
        AppState.http_client = AsyncClient(timeout=15.0)

        # 3. Inizializza il client Redis
        redis_client = redis.from_url(redis_url, decode_responses=True)

        AppState.redis_client = redis_client
        # Inietta le risorse nello stato dell'app
        # Le risorse sono ora disponibili tramite app.state

        # 4. Inizializza il client Minio
        if storage_bucket_name is not None:
            storage_client = StorageClient(
                hostname=storage_hostname,
                access_key=storage_access_key,
                secret_key=storage_secret_key,
                bucket_name=storage_bucket_name
            )
            AppState.storage_client = storage_client

        # 5. Inizializza il manager di ElasticSearch
        es_mgr = AsyncElasticManager(elastic_url)
        AppState.elastic_manager = es_mgr
        yield

        # --- Fase di Shutdown ---

        # Chiude l'AsyncClient
        await AppState.http_client.aclose()
        print("AsyncClient chiuso.")

        # Chiude il pool di connessioni DB
        await AppState.postgres_manager.close_db_connection()
        print(f"Postgres Client chiuso.")

        # Chiudi correttamente la connessione redis
        await redis_client.close()
        print(f"Redis Client chiuso.")
        print(f"[{title}] Shutdown completato.")

    # --------------------------------------------------------------------------
    # --- Creazione dell'App ---
    # --------------------------------------------------------------------------
    app = FastAPI(title=title, lifespan=lifespan)

    # ----------------------------------------------------
    # 📌 Global Exception Handler per ServiceException
    # ----------------------------------------------------
    @app.exception_handler(ServiceException)
    async def service_exception_handler(request: Request, exc: ServiceException):
        # Logga l'errore completo internamente per il debugging
        print(f"[{exc.error_code}] Errore del Servizio Intercettato: {exc.detail}")

        # Restituisce il payload JSON standardizzato al client
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "status_code": exc.status_code,
                "error_code": exc.error_code,
                "message": exc.detail,
                # Utile includere il path o il timestamp
                "path": str(request.url.path)
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        """
        Sovrascrive il comportamento predefinito dell'errore 422.
        Formatta l'errore in modo che il frontend riceva un campo 'detail' pulito.
        """
        # exc.errors() contiene una lista di errori. Prendiamo il primo per semplicità
        # o uniamoli in una stringa leggibile.
        errors = exc.errors()

        # Esempio di formattazione: "campo_mancante: questo campo è richiesto"
        error_messages = []
        if type(errors) == str:
            error_messages.append(errors)
        else:
            for error in errors:
                location = " -> ".join([str(loc) for loc in error["loc"] if loc != "body"])
                msg = error["msg"]
                error_messages.append(f"{location}: {msg}")

        # Uniamo i messaggi o prendiamo il primo per una visualizzazione immediata
        friendly_message = "Errore di validazione: " + ", ".join(error_messages)

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "message": friendly_message,
                "errors": errors  # Inviamo comunque i dettagli tecnici se necessari per debug
            },
        )


    for router in routers:
        app.include_router(router)

    return app

