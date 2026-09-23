from typing import List

import asyncpg
from models.membership_model import Membership

from decorator import with_db_connection


class MembershipRepository:

    @with_db_connection
    async def save(self, conn: asyncpg.Connection, membership: Membership):
        query = """
        INSERT INTO membership
        VALUES ($1,$2,$3)
        """

        await conn.execute(query, membership.groupid, membership.userid, membership.userrole)

    @with_db_connection
    async def delete(self, conn, user_id: str, group_id: str):
        query = """
            DELETE 
            FROM membership
            WHERE groupId = $1 AND userId = $2
        """

        await conn.execute(query, group_id, user_id)

    @with_db_connection
    async def update_role(self, conn: asyncpg.Connection, group_id: str, user_id: str, new_role: str):
        """
        Aggiorna il ruolo di un utente specifico all'interno di un gruppo.
        """
        query = """
        UPDATE membership
        SET userRole = $3
        WHERE groupId = $1 AND userId = $2
        """
        await conn.execute(query, group_id, user_id, new_role)

    @with_db_connection
    async def search_by_groupid(self, conn: asyncpg.Connection, group_id: str) -> List[Membership]:
        """
        Cerca tutti i membri (e i loro ruoli) per un dato gruppo.
        Restituisce una lista di record (convertiti in dict) per la mappatura DTO.
        """
        query = """
        SELECT groupId, userId, userRole 
        FROM membership
        WHERE groupId = $1
        """
        records = await conn.fetch(query, group_id)
        # Converte i record asyncpg in list di dict per il Service Layer
        return [Membership.model_validate(dict(record)) for record in records]

    @with_db_connection
    async def get_group_size(self, conn: asyncpg.Connection, group_id: str) -> int:
        """
        Cerca tutti i membri (e i loro ruoli) per un dato gruppo.
        Restituisce una lista di record (convertiti in dict) per la mappatura DTO.
        """
        query = """
        SELECT COUNT (*)
        FROM membership
        WHERE groupId = $1
        """
        count = await conn.fetchval(query, group_id)
        # Converte i record asyncpg in list di dict per il Service Layer
        return count

    @with_db_connection
    async def search_by_userid(self, conn: asyncpg.Connection, user_id: str) -> List[dict]:
        """
        Cerca tutte le membership e i ruoli per un dato utente in tutti i gruppi.
        """
        query = """
        SELECT group_table.groupid,
        group_table.groupName,
        membership.userRole,
        group_table.creatorId,
        group_table.maxMember,
        group_table.createdAt,
        group_table.description,
        group_table.memberCount,
        group_table.isPrivate,
        group_table.category
        FROM membership
        INNER JOIN group_table on membership.groupid=group_table.groupid
        WHERE userId = $1
        """
        records = await conn.fetch(query, user_id)
        # Converte i record asyncpg in list di dict per il Service Layer
        return [dict(record) for record in records]

    @with_db_connection
    async def search_role(self, conn: asyncpg.Connection, group_id: str, user_id: str) -> Membership | None:
        """
        Cerca il ruolo di un utente in un determinato gruppo.
        """
        query = """
        SELECT * 
        FROM membership
        WHERE groupId = $1 AND userId = $2
        """
        record = await conn.fetchrow(query, group_id, user_id)

        if record is None:
            return None
        # Converte i record asyncpg in list di dict per il Service Layer
        return Membership.model_validate(dict(record))


