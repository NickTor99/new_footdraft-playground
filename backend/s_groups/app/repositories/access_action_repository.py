from typing import List

import asyncpg
from models.access_action_model import AccessAction

from decorator import with_db_connection


class AccessActionRepository:
    """
    Repository per la gestione delle richieste di accesso e degli inviti (access_action).
    """

    @with_db_connection
    async def save(self, conn: asyncpg.Connection, action: AccessAction):
        """
        Salva una nuova richiesta di accesso o un invito.
        """
        query = """
        INSERT INTO access_action 
            (actionId, groupId, targetUserId, creatorUserId, expire, status, actionType)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING actionId;
        """
        # Il ritorno di actionId è utile per il Service Layer
        action_id = await conn.fetchval(
            query,
            action.actionid,
            action.groupid,
            action.targetuserid,
            action.creatoruserid,
            action.expire,
            action.status,
            action.actiontype
        )
        return action_id

    @with_db_connection
    async def find_by_id(self, conn: asyncpg.Connection, action_id: str) -> AccessAction | None:
        """
        Cerca un'azione specifica tramite ID.
        """
        query = """
        SELECT actionId, groupId, targetUserId, creatorUserId, expire, status, actionType
        FROM access_action
        WHERE actionId = $1
        """
        record = await conn.fetchrow(query, action_id)
        return AccessAction.model_validate(dict(record)) if record else None

    @with_db_connection
    async def find_pending_requests_by_group(self, conn: asyncpg.Connection, group_id: str) -> List[dict]:
        """
        Cerca tutte le richieste di accesso pendenti per un gruppo specifico (UC-G04).
        """
        query = """
        SELECT actionId, targetUserId, creatorUserId, expire
        FROM access_action
        WHERE groupId = $1 
          AND status = 'PENDING' 
          AND actionType = 'REQUEST'
          AND expire > CURRENT_TIMESTAMP;
        """
        records = await conn.fetch(query, group_id)
        return [dict(record) for record in records]

    @with_db_connection
    async def find_pending_requests_by_group_and_user(self, conn: asyncpg.Connection, group_id: str, user_id: str) -> List[dict]:
        """
        Cerca tutte le richieste di accesso pendenti per un gruppo specifico (UC-G04).
        """
        query = """
        SELECT actionId, targetUserId, creatorUserId, expire
        FROM access_action
        WHERE groupId = $1 
          AND creatorUserId = $2
          AND status = 'PENDING' 
          AND actionType = 'REQUEST'
          AND expire > CURRENT_TIMESTAMP;
        """
        records = await conn.fetch(query, group_id, user_id)
        return [dict(record) for record in records]

    @with_db_connection
    async def find_received_invites_by_user(self, conn: asyncpg.Connection, user_id: str) -> List[dict]:
        """
        Cerca tutti gli inviti ricevuti e pendenti per un utente specifico (UC-G04).
        """
        query = """
        SELECT actionId, groupId, creatorUserId, expire
        FROM access_action
        WHERE targetUserId = $1 
          AND status = 'PENDING' 
          AND actionType = 'INVITE'
          AND expire > CURRENT_TIMESTAMP;
        """
        records = await conn.fetch(query, user_id)
        return [dict(record) for record in records]

    @with_db_connection
    async def update_status(self, conn: asyncpg.Connection, action_id: str, new_status: str):
        """
        Aggiorna lo stato di un'azione (es. da 'pending' a 'accepted' o 'rejected').
        """
        query = """
        UPDATE access_action
        SET status = $2
        WHERE actionId = $1
        """
        await conn.execute(query, action_id, new_status)