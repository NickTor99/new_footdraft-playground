from typing import Optional, List

import asyncpg
from models.player_profile_model import PlayerProfile

from decorator import with_db_connection
from router.schemas import PlayerStatsUpdateDTO


class PlayerRepository:

    @with_db_connection
    async def save(self, conn: asyncpg.Connection, player: PlayerProfile) -> PlayerProfile:
        """
        Crea un nuovo profilo giocatore.
        """
        query = """
            INSERT INTO player_profile (nickname, groupId, linckedUserId, velocita, attacco, difesa, tecnica, avatar)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING playerId, nickname, groupId, linckedUserId, velocita, attacco, difesa, tecnica, avatar
        """
        # Nota: linked_user_id è opzionale o stringa vuota a seconda delle regole di business.
        # Assumiamo stringa vuota o NULL se non associato inizialmente.
        linked_uid = player.linckeduserid if player.linckeduserid else ""

        row = await conn.fetchrow(
            query,
            player.nickname,
            player.groupid,
            linked_uid,
            player.velocita,
            player.attacco,
            player.difesa,
            player.tecnica,
            player.avatar
        )
        return PlayerProfile(**dict(row))

    @with_db_connection
    async def update(self, conn, field: str, value: str, player_id: str) -> Optional[PlayerProfile]:
        query = f"""
            UPDATE player_profile
            SET {field} = $1
            WHERE playerid = $2
            RETURNING playerId, nickname, groupId, linckedUserId, velocita, attacco, difesa, tecnica, avatar
        """

        row = await conn.fetchrow(query, value, player_id)
        return PlayerProfile(**dict(row))

    @with_db_connection
    async def get_by_group(self, conn: asyncpg.Connection, group_id: str) -> List[PlayerProfile]:
        """Recupera tutti i giocatori di un gruppo."""
        query = """
            SELECT playerId, nickname, groupId, linckedUserId, velocita, attacco, difesa, tecnica, avatar
            FROM player_profile
            WHERE groupId = $1
        """
        rows = await conn.fetch(query, group_id)
        return [PlayerProfile(**dict(row)) for row in rows]

    @with_db_connection
    async def get_by_id(self, conn: asyncpg.Connection, group_id: str, player_id: str) -> Optional[PlayerProfile]:
        """Recupera un singolo giocatore per ID e Gruppo."""
        query = """
            SELECT playerId, nickname, groupId, linckedUserId, velocita, attacco, difesa, tecnica, avatar
            FROM player_profile
            WHERE groupId = $1 AND playerId = $2
        """
        row = await conn.fetchrow(query, group_id, player_id)
        if row:
            return PlayerProfile(**dict(row))
        return None

    @with_db_connection
    async def get_by_ids(self, conn: asyncpg.Connection, group_id: str, player_ids: str) -> List[PlayerProfile]:
        """Recupera un singolo giocatore per ID e Gruppo."""
        query = """
            SELECT playerId, nickname, groupId, linckedUserId, velocita, attacco, difesa, tecnica, avatar
            FROM player_profile
            WHERE groupId = $1 AND playerId = ANY($2::text[])
        """
        records = await conn.fetch(query, group_id, player_ids)
        return [PlayerProfile.model_validate(dict(record)) for record in records]

    @with_db_connection
    async def get_by_nickname(self, conn: asyncpg.Connection, group_id: str, player_nickname: str) -> Optional[PlayerProfile]:
        """Recupera un singolo giocatore per ID e Gruppo."""
        query = """
            SELECT playerId, nickname, groupId, linckedUserId, velocita, attacco, difesa, tecnica, avatar
            FROM player_profile
            WHERE groupId = $1 AND nickname = $2
        """
        row = await conn.fetchrow(query, group_id, player_nickname)
        if row:
            return PlayerProfile(**dict(row))
        return None

    @with_db_connection
    async def update_stats(self, conn: asyncpg.Connection, group_id: str, player_id: str, stats: PlayerStatsUpdateDTO) -> Optional[PlayerProfile]:
        """Aggiorna solo le statistiche."""
        query = """
            UPDATE player_profile
            SET velocita = $1, attacco = $2, difesa = $3, tecnica = $4
            WHERE groupId = $5 AND playerId = $6
            RETURNING playerId, nickname, groupId, linckedUserId, velocita, attacco, difesa, tecnica, avatar
        """
        row = await conn.fetchrow(
            query,
            stats.velocita, stats.attacco, stats.difesa, stats.tecnica,
            group_id, player_id
        )
        if row:
            return PlayerProfile(**dict(row))
        return None

    @with_db_connection
    async def delete(self, conn: asyncpg.Connection, group_id: str, player_id: str) -> bool:
        """Elimina un giocatore."""
        query = "DELETE FROM player_profile WHERE groupId = $1 AND playerId = $2"
        result = await conn.execute(query, group_id, player_id)
        # result ritorna es. "DELETE 1"
        return result != "DELETE 0"

    @with_db_connection
    async def update_association(self, conn: asyncpg.Connection, group_id: str, player_id: str, user_id: str) -> bool:
        """Aggiorna il campo linckedUserId."""
        query = """
            UPDATE player_profile
            SET linckedUserId = $1
            WHERE groupId = $2 AND playerId = $3
        """
        result = await conn.execute(query, user_id, group_id, player_id)
        return result == "UPDATE 1"

    @with_db_connection
    async def check_user_association(self, conn: asyncpg.Connection, user_id: str, player_id: str) -> bool:
        """Verifica interna."""
        query = "SELECT 1 FROM player_profile WHERE linckedUserId = $1 AND playerId = $2"
        val = await conn.fetchval(query, user_id, player_id)
        return val is not None