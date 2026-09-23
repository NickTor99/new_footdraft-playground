import time
import datetime
import psycopg2
import schedule
from psycopg2.extras import RealDictCursor
from elastic_manager import ElasticManager
from dotenv import load_dotenv
import os
import sys

INDEX_NAME = "group_search"
TRACKER_FILE = "data/last_sync.txt"

load_dotenv(os.getcwd()+'/.env')

PG_CONFIG_GROUP = {
    "dbname": "group_db",
    "user": "postgres",
    "password": os.getenv('POSTGRES_PASSWORD'),
    "host": "postgres",
    "port": "5432"
}

PG_CONFIG_USER = {
    "dbname": "user_db",
    "user": "postgres",
    "password": os.getenv('POSTGRES_PASSWORD'),
    "host": "postgres",
    "port": "5432"
}

def get_last_sync_time():
    """Legge l'orario dell'ultima sincronizzazione da un file locale."""
    if os.path.exists(TRACKER_FILE):
        with open(TRACKER_FILE, "r") as f:
            return f.read().strip()
    # Se il file non esiste, restituisce una data molto vecchia (forza un full sync iniziale)
    return "1970-01-01 00:00:00"

def save_last_sync_time(sync_time):
    """Salva l'orario della sincronizzazione appena completata."""
    with open(TRACKER_FILE, "w") as f:
        f.write(sync_time)

def fetch_data_from_postgres(last_sync):
    """Estrae i dati da PostgreSQL in formato Dizionario ottimizzando le query."""

    conn_group = psycopg2.connect(**PG_CONFIG_GROUP)
    conn_user = psycopg2.connect(**PG_CONFIG_USER)

    cur_group = conn_group.cursor(cursor_factory=RealDictCursor)
    cur_user = conn_user.cursor(cursor_factory=RealDictCursor)

    # Uso i nomi in minuscolo per allinearmi al comportamento di default di Postgres
    query_groups = """
                   SELECT *
                   FROM group_table
                   WHERE createdat >= %s; \
                   """
    cur_group.execute(query_groups, (last_sync,))
    records = cur_group.fetchall()

    groups = [dict(record) for record in records]

    if groups:
        # 1. Estraggo tutti i creatorid unici (usando un Set per evitare duplicati)
        creator_ids = list(set(g['creatorid'] for g in groups if g.get('creatorid')))

        if creator_ids:
            # 2. Faccio UNA SOLA query al database degli utenti per prendere tutti i creatori in un colpo solo.
            # psycopg2 gestisce in automatico il passaggio di una lista usando la sintassi = ANY(%s)
            query_users = """
                          SELECT userid, username
                          FROM user_table
                          WHERE userid = ANY(%s); \
                          """
            cur_user.execute(query_users, (creator_ids,))
            users_records = cur_user.fetchall()

            # 3. Creo una "mappa" in memoria (Dizionario) per un accesso istantaneo: { 1: "Mario", 2: "Luigi" }
            user_map = {u['userid']: u['username'] for u in users_records}

            # 4. Assegno gli username ai gruppi senza interrogare più il database
            for group in groups:
                c_id = group.get('creatorid')

                # Aggiungo un nuovo campo in modo pulito (uso .get() per sicurezza se l'utente è stato cancellato)
                group['creatorid'] = user_map.get(c_id, "Utente Sconosciuto")

                # Opzionale: puoi rimuovere creatorid se non ti serve in Elasticsearch
                # del group['creatorid']

    cur_group.close()
    conn_group.close()
    cur_user.close()
    conn_user.close()

    return groups


def main(full_sync: bool = False):
    last_sync = get_last_sync_time()

    if full_sync: last_sync = "1970-01-01 00:00:00"
    if last_sync == "1970-01-01 00:00:00": full_sync = True

    # 1. Inizializziamo il manager di Elasticsearch
    es_mgr = ElasticManager(os.getenv("ELASTIC_SEARCH_URL"))

    if full_sync:
        # Ripuliamo l'indice se esiste già (per test puliti)
        es_mgr.delete_index(INDEX_NAME)

        # Creiamo un mapping specifico per ottimizzare la ricerca
        mapping = {
            "dynamic": False,
            "properties": {
                "groupId": {"type": "integer"},
                "groupname": {"type": "text"},
                "description": {"type": "text"},
                "creator_username": {"type": "text"}
            }
        }
        es_mgr.create_index(INDEX_NAME, mapping)

    # 2. SINCRONIZZAZIONE (Batch Sync)
    print("\n--- INIZIO SINCRONIZZAZIONE DA POSTGRES A ELASTICSEARCH ---")

    pg_dati = fetch_data_from_postgres(last_sync)

    print(f"Estratti {len(pg_dati)} record da PostgreSQL.")

    es_mgr.bulk_index(index_name=INDEX_NAME, documents=pg_dati, id_field="groupId")
    print("Sincronizzazione completata.")

    # 3. Aggiorna il file con l'orario attuale per il prossimo ciclo
    # Formatto l'ora esatta di ADESSO per usarla al prossimo giro
    nuovo_tempo = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    save_last_sync_time(nuovo_tempo)

# Imposta ogni quanti minuti vuoi che venga eseguito
MINUTI_INTERVALLO = 1

if __name__ == "__main__":

    if len(sys.argv) > 1 and sys.argv[1] == "full":
        print("Avviato in modalità: FULL SYNC MANUALE")
        main(full_sync=True)

    else:
        print(f"Scheduler avviato. Controllo aggiornamenti ogni {MINUTI_INTERVALLO} minuti...")

        # Programmiamo il job passando il riferimento alla funzione (senza parentesi)
        schedule.every(MINUTI_INTERVALLO).minutes.do(main)

        # Facciamo una primissima esecuzione di partenza
        main()

        # Manteniamo in vita il processo
        while True:
            schedule.run_pending()
            time.sleep(1)