import asyncio
import asyncpg
from asyncpg import Connection


# --------------------------------------------------------------------
# CONFIGURAZIONE GENERICA E POOL MANAGER
# --------------------------------------------------------------------


class PostgresManager:
    """
    Gestisce il ciclo di vita del pool di connessioni asyncpg.
    Ogni microservizio istanzierà il proprio manager.
    L'istanza viene instanziata allo start del servizio e salvata nello suo stato, in modo da poter essere acceduta a qualsiasi livello.
    """

    def __init__(self):
        self.connection_pool = None

    async def connect_to_db(self, database_url: str, max_retries: int = 5, delay: int = 5):
        """
        Inizializza il pool di connessioni, con retry per robustezza.
        """
        print(f"Connecting to database at {database_url}...")

        for attempt in range(max_retries):
            try:
                self.connection_pool = await asyncpg.create_pool(
                    dsn=database_url,
                    min_size=5,
                    max_size=20,
                    timeout=5.0
                )
                print("Database connection pool created successfully.")
                return  # Successo, esci dalla funzione
            except Exception as e:
                if attempt < max_retries - 1:
                    print(
                        f"WARNING: Connessione DB fallita (Tentativo {attempt + 1}/{max_retries}). Retrying in {delay}s...")
                    await asyncio.sleep(delay)
                else:
                    print(f"FATAL ERROR: Connessione DB fallita dopo {max_retries} tentativi.")
                    raise  # Solleva l'errore fatale

    async def close_db_connection(self):
        """
        Chiude il pool di connessioni allo shutdown.
        """
        if self.connection_pool:
            print("Closing database connection pool.")
            await self.connection_pool.close()

    async def get_connection(self) -> asyncpg.Connection:
        if not self.connection_pool:
            raise asyncpg.exceptions.InterfaceError("Database pool is not initialized.")

        conn = await self.connection_pool.acquire()

        return conn

    async def release_connection(self, conn: asyncpg.Connection):
        await self.connection_pool.release(conn)

    async def execute_schema_ddl(self, sql_schema_content: str):
        """
        Esegue i comandi DDL (CREATE TABLE) sulla connessione del pool.

        Args:
            sql_schema_content: Il contenuto SQL per la creazione delle tabelle.
        """
        # Acquisisce una connessione temporanea dal pool per eseguire il DDL

        conn = None

        try:
            conn = await self.get_connection()

            await conn.execute(sql_schema_content)

            print("Database schema initialized successfully (tables created).")
        finally:
            await self.release_connection(conn)

    # Funzione per gestire la creazione del database (DB fisico)
    async def create_database_if_not_exists(self, master_url: str, db_name: str, database_url: str):
        """
        Si connette al master DB ('postgres') per creare un nuovo DB fisico.
        """
        print(f"Attempting to create database: {db_name}")

        # Connessione al master DB (di solito 'postgres')
        master_conn = None
        db_conn = None
        try:
            # La connessione master viene usata solo per questo comando
            master_conn = await asyncpg.connect(master_url)

            # Non è possibile parametrizzare il nome del DB, quindi si usa f-string (con cautela)
            await master_conn.execute(f"CREATE DATABASE {db_name}")
            print(f"Database '{db_name}' created successfully.")

            db_conn:Connection = await asyncpg.connect(database_url)

            with open('database/schema.sql') as schema:
                await db_conn.execute(schema.read())

        except asyncpg.exceptions.DuplicateDatabaseError:
            print(f"Database '{db_name}' already exists.")
        except Exception as e:
            print(f"ERROR creating database '{db_name}': {e}")
        finally:
            if master_conn:
                await master_conn.close()
