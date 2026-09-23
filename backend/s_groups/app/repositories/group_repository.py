from typing import Optional, List, Any, Dict

from models.group_model import Group

from decorator import with_db_connection, with_elastic_search_connection
from elastic_manager import AsyncElasticManager
from router.schemas import GroupDetailDTO


class GroupRepository:
    @with_db_connection
    async def save(self, conn, group: Group):
        query = """
            INSERT INTO group_table(groupId, creatorId, groupName, maxMember, createdAt, isPrivate, membercount, description, category)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        """

        await conn.execute(query, group.groupid, group.creatorid, group.groupname, group.maxmember, group.createdat, group.isprivate, group.membercount, group.description, group.category)

    @with_db_connection
    async def update(self, conn, update_data: GroupDetailDTO, group_id: str):

        query = """
        UPDATE group_table
        SET groupName = $1, maxPeople = $2, description = $3, isPrivate = $4
        WHERE groupId = $5
        """

        await conn.execute(query, update_data.group_name, update_data.max_member, update_data.description, update_data.is_private, group_id)

    @with_db_connection
    async def delete(self, conn, group_id):
        query = """
            DELETE 
            FROM group_table
            WHERE groupId = $1
        """

        await conn.execute(query, group_id)

    @with_db_connection
    async def find_group_by_groupName(self, conn, groupName: str) -> Optional[Group]:
        query = """
            SELECT * FROM group_table WHERE groupName=$1
        """

        user = await conn.fetchrow(query, groupName)

        if user is not None:
            data = dict(user)
            return Group.model_validate(data)

        return None

    @with_db_connection
    async def find_group_by_id(self, conn, group_id: str) -> Optional[Group]:
        query = """
            SELECT * 
            FROM group_table 
            WHERE groupId=$1
        """
        group = await conn.fetchrow(query, group_id)

        if group is not None:
            data_dict = dict(group)
            return Group.model_validate(data_dict)

        return None

    @with_db_connection
    async def search_by_name(self, conn, search_term: str, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Cerca gruppi il cui nome contiene il termine di ricerca (case-insensitive).

        Args:
            search_term: Il nome del gruppo o parte di esso.
            limit: Limite di risultati da restituire per la paginazione/prestazioni.

        Returns:
            Lista di dizionari con i dati dei gruppi.
            :param limit:
            :param search_term:
            :param conn:
        """
        # Creiamo il pattern di ricerca con % (wildcard) per ILIKE
        # $1 sarà '%termine_di_ricerca%'
        search_pattern = f"%{search_term}%"

        # Usiamo ILIKE per la ricerca case-insensitive
        query = """
        SELECT *
        FROM group_table
        WHERE groupName ILIKE $1
        LIMIT $2
        """

        records = await conn.fetch(query, search_pattern, limit)

        return [dict(record) for record in records]

    async def groupName_exists(self, groupName: str) -> bool:
        name = await self.find_group_by_groupName(groupName)

        if name:
            return True
        return False

    async def groupId_exists(self, groupId: str) -> bool:
        id = await self.find_group_by_id(groupId)

        if id:
            return True
        return False

    @with_elastic_search_connection
    async def elastic_search(self, conn:AsyncElasticManager, search_term: str, limit: int = 20) -> list[Dict[str, Any]]:
        results = await conn.search(index_name="group_search", keyword=search_term, search_fields=["groupname", "description", "creatorid"])
        return results

