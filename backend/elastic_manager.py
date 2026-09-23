from elasticsearch import Elasticsearch, helpers, AsyncElasticsearch
from elasticsearch.helpers import async_bulk
import logging

# Configurazione base del logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class ElasticManager:
    """
    Classe driver per gestire tutte le interazioni con Elasticsearch.
    """
    def __init__(self, host: str = "http://localhost:9200"):
        self.es = Elasticsearch(host)

        if self.check_connection():
            logging.info("Connessione a Elasticsearch stabilita con successo.")
        else:
            logging.error("Impossibile connettersi a Elasticsearch.")

    def check_connection(self) -> bool:
        """Verifica se il cluster Elasticsearch è raggiungibile."""
        return self.es.ping()

    def create_index(self, index_name: str, mapping: dict = None):
        """
        Crea un nuovo indice, opzionalmente con un mapping specifico.
        Il mapping serve a definire i tipi di dato (es. text, keyword, date).
        """
        if self.es.indices.exists(index=index_name):
            logging.warning(f"L'indice '{index_name}' esiste già.")
            return False

        body = {"mappings": mapping} if mapping else {}
        response = self.es.indices.create(index=index_name, body=body)
        logging.info(f"Indice '{index_name}' creato: {response}")
        return True

    def delete_index(self, index_name: str):
        """Elimina un intero indice."""
        if self.es.indices.exists(index=index_name):
            self.es.indices.delete(index=index_name)
            logging.info(f"Indice '{index_name}' eliminato.")

    def index_document(self, index_name: str, doc_id: str, document: dict):
        """
        Inserisce o aggiorna un singolo documento (Utile per la Doppia Scrittura).
        Se il doc_id esiste già, l'intero documento viene sovrascritto.
        """
        response = self.es.index(index=index_name, id=doc_id, document=document)
        logging.info(f"Documento {doc_id} indicizzato in '{index_name}'. Risultato: {response['result']}")
        return response

    def update_document(self, index_name: str, doc_id: str, partial_doc: dict):
        """Aggiorna solo alcuni campi di un documento esistente."""
        response = self.es.update(index=index_name, id=doc_id, doc=partial_doc)
        logging.info(f"Documento {doc_id} aggiornato.")
        return response

    def delete_document(self, index_name: str, doc_id: str):
        """Elimina un singolo documento."""
        try:
            response = self.es.delete(index=index_name, id=doc_id)
            logging.info(f"Documento {doc_id} eliminato.")
            return response
        except Exception as e:
            logging.error(f"Errore nell'eliminazione del doc {doc_id}: {e}")
            return None

    def bulk_index(self, index_name: str, documents: list, id_field: str = "id"):
        """
        Inserisce massivamente una lista di dizionari in Elasticsearch.
        Essenziale per la sincronizzazione iniziale da PostgreSQL.
        """
        actions = []
        for doc in documents:
            action = {
                "_index": index_name,
                "_id": doc.get(id_field), # Usa il campo ID specificato come ID di Elasticsearch
                "_source": doc
            }
            actions.append(action)

        success, failed = helpers.bulk(self.es, actions, stats_only=True)
        logging.info(f"Bulk index completato. Successi: {success}, Fallimenti: {failed}")
        return success

    def search(self, index_name: str, keyword: str, search_fields: list = None):
        """
        Ricerca full-text su tutti i campi o su campi specifici.
        """
        if search_fields:
            # Ricerca multi-match (cerca la parola in campi specifici)
            query = {
                "multi_match": {
                    "query": keyword,
                    "fields": search_fields,
                    "fuzziness": "AUTO" # Permette errori di battitura
                }
            }
        else:
            # Ricerca generica (query_string su tutti i campi)
            query = {
                "query_string": {
                    "query": f"*{keyword}*"
                }
            }

        response = self.es.search(index=index_name, query=query)
        hits = response['hits']['hits']

        results = [{"score": hit['_score'], "data": hit['_source']} for hit in hits]
        return results


class AsyncElasticManager:
    """
    Classe driver ASINCRONA per gestire tutte le interazioni con Elasticsearch.
    Ottimizzata per framework asincroni come FastAPI.
    """
    def __init__(self, host: str = "http://localhost:9200"):
        # Inizializziamo il client asincrono
        self.es = AsyncElasticsearch(host)

    async def check_connection(self) -> bool:
        """Verifica se il cluster Elasticsearch è raggiungibile."""
        try:
            is_connected = await self.es.ping()
            if is_connected:
                logging.info("Connessione a Elasticsearch stabilita con successo.")
            else:
                logging.error("Impossibile connettersi a Elasticsearch.")
            return is_connected
        except Exception as e:
            logging.error(f"Errore durante il ping di Elasticsearch: {e}")
            return False

    async def create_index(self, index_name: str, mapping: dict = None):
        """Crea un nuovo indice, opzionalmente con un mapping specifico."""
        if await self.es.indices.exists(index=index_name):
            logging.warning(f"L'indice '{index_name}' esiste già.")
            return False

        body = {"mappings": mapping} if mapping else {}
        response = await self.es.indices.create(index=index_name, body=body)
        logging.info(f"Indice '{index_name}' creato: {response}")
        return True

    async def delete_index(self, index_name: str):
        """Elimina un intero indice."""
        if await self.es.indices.exists(index=index_name):
            await self.es.indices.delete(index=index_name)
            logging.info(f"Indice '{index_name}' eliminato.")

    async def index_document(self, index_name: str, doc_id: str, document: dict):
        """Inserisce o aggiorna un singolo documento (Doppia Scrittura)."""
        response = await self.es.index(index=index_name, id=str(doc_id), document=document)
        logging.info(f"Documento {doc_id} indicizzato. Risultato: {response['result']}")
        return response

    async def update_document(self, index_name: str, doc_id: str, partial_doc: dict):
        """Aggiorna solo alcuni campi di un documento esistente."""
        response = await self.es.update(index=index_name, id=str(doc_id), doc=partial_doc)
        logging.info(f"Documento {doc_id} aggiornato.")
        return response

    async def delete_document(self, index_name: str, doc_id: str):
        """Elimina un singolo documento (Utile per i Soft/Hard Delete)."""
        try:
            response = await self.es.delete(index=index_name, id=str(doc_id))
            logging.info(f"Documento {doc_id} eliminato.")
            return response
        except Exception as e:
            logging.error(f"Errore nell'eliminazione del doc {doc_id}: {e}")
            return None

    async def bulk_index(self, index_name: str, documents: list, id_field: str = "id"):
        """Inserisce massivamente una lista di dizionari (Sincronizzazione Batch)."""
        if not documents:
            return 0

        actions = []
        for doc in documents:
            action = {
                "_index": index_name,
                "_id": str(doc.get(id_field)),
                "_source": doc
            }
            actions.append(action)

        # Usiamo async_bulk al posto del classico helpers.bulk
        success, failed = await async_bulk(self.es, actions, stats_only=True)
        logging.info(f"Bulk index completato. Successi: {success}, Fallimenti: {failed}")
        return success

    async def search(self, index_name: str, keyword: str, search_fields: list = None):

        """Ricerca full-text su campi specifici o generica."""
        if search_fields:
            query = {
                "multi_match": {
                    "query": keyword,
                    "fields": search_fields,
                    "fuzziness": "AUTO"
                }
            }
        else:
            query = {
                "query_string": {
                    "query": f"*{keyword}*"
                }
            }

        response = await self.es.search(index=index_name, query=query)
        hits = response['hits']['hits']

        results = [hit['_source'] for hit in hits]
        return results

    async def close(self):
        """Chiude la connessione asincrona (buona pratica in FastAPI)."""
        await self.es.close()
        logging.info("Connessione a Elasticsearch chiusa.")