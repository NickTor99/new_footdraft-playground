import json
from datetime import time, datetime
from enum import Enum

from redis_singleton import RedisClient
from repositories.IDraftRepository import *
from draft_client import DraftServiceClient
from models.Captain import Captain
from models.DraftMove import DraftMove
from models.DraftStatus import DraftStatus
from models.History import *
from service_configuration import AppState as state


class RedisDraftRepository(IDraftRepository):
    def __init__(self):
        self.redis = RedisClient()
        self.client = DraftServiceClient()
        self.SESSION_TTL = 3600  # 1 ora di TTL per la cache

    async def save_history(self, session: DraftHistory):
        await self.client.send_draft_history(session)

    async def save_to_cache(self, session: DraftSession):
        """Salva lo stato serializzato in Redis con scadenza."""
        session_key = f"draft:state:{session.sessionId}"
        group_index_key = f"draft:group:{session.groupId}"

        # Usiamo una transazione (Multi/Exec) per garantire coerenza
        async with self.redis.redis_client.pipeline(transaction=True) as pipe:
            # Salva la sessione
            await pipe.set(session_key, json.dumps(session, default=json_serializer))
            # Aggiunge il sessionId all'indice del gruppo
            await pipe.sadd(group_index_key, session.sessionId)
            # Imposta una scadenza (opzionale)
            await pipe.expire(session_key, 3600)
            await pipe.expire(group_index_key, 3600)
            await pipe.execute()

    async def get_sessions_by_group(self, group_id: str) -> Optional[List[DraftSession]]:
        group_index_key = f"draft:group:{group_id}"
        session_ids = await self.redis.redis_client.smembers(group_index_key)

        if not session_ids:
            return []

        # Recupera tutte le chiavi in un colpo solo
        keys = [f"draft:state:{s_id}" for s_id in session_ids]
        raw_sessions = await self.redis.redis_client.mget(keys)
        try:
            # Filtra eventuali sessioni scadute (mget restituisce None se la chiave non esiste)
            return [recreate_session(s) for s in raw_sessions if s]
        except Exception as e:
            print(f"Errore deserializzazione cache: {e}")
            return None

    async def get_from_cache(self, session_id) -> Optional[DraftSession]:
        """Tenta di recuperare lo stato dalla cache Redis e lo deserializza in DraftSession."""
        key = f"draft:state:{session_id}"
        data = await self.redis.redis_client.get(key)

        if not data:
            return None

        try:
            return recreate_session(data)
        except Exception as e:
            print(f"Errore deserializzazione cache: {e}")
            return None


def recreate_session(raw_session_data) -> DraftSession:
    d = json.loads(raw_session_data)

    # Ricostruzione oggetti annidati (Captain)
    captain1 = Captain(**d['captain1']) if d.get('captain1') else None
    captain2 = Captain(**d['captain2']) if d.get('captain2') else None

    # Ricostruzione oggetti annidati (DraftMove)
    last_move = DraftMove(**d['lastMove']) if d.get('lastMove') else None

    # Ricostruzione Enum
    status = DraftStatus(d['status']) if d.get('status') else DraftStatus.WAITING_FOR_CAPTAIN2

    # Creazione istanza DraftSession
    session = DraftSession(
        sessionId=d.get('sessionId'),
        name=d.get('name'),
        availablePlayers=d.get('availablePlayers', []),
        captain1=captain1,
        captain2=captain2,
        status=status,
        turnOrder=d.get('turnOrder'),
        lastMove=last_move,
        currentTurnIndex=d.get('currentTurnIndex', 0),
        groupId=d.get('groupId')
    )
    return session

def json_serializer(obj):
    if isinstance(obj, Enum):
        return obj.value
    if hasattr(obj, "__dict__"):
        return obj.__dict__
    return str(obj)
