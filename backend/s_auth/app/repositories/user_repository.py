from exceptions.exceptions import *
from models.user_model import User
from typing import Optional, List

from decorator import with_db_connection


class UserRepository:

    @with_db_connection
    async def save(self, conn, user: User):
        query = """
            INSERT INTO user_table
            VALUES ($1,$2,$3,$4)
        """

        await conn.execute(query, user.userid, user.username, user.email, user.passwordhash)

    @with_db_connection
    async def update(self, conn, field: str, value: str, user_id: str):
        query = f"""
            UPDATE user_table
            SET {field} = $1
            WHERE userid = $2
        """

        await conn.execute(query, value, user_id)

    @with_db_connection
    async def find_user_by_username(self, conn, username: str) -> Optional[User]:
        query = """
            SELECT * FROM user_table WHERE username=$1
        """

        user = await conn.fetchrow(query, username)

        if user is not None:
            data = dict(user)
            return User.model_validate(data)

        return None

    @with_db_connection
    async def find_user_by_email(self, conn, email: str) -> Optional[User]:
        query = """
            SELECT * FROM user_table WHERE email=$1
        """

        user = await conn.fetchrow(query, email)

        if user is not None:
            data_dict = dict(user)
            return User.model_validate(data_dict)

        return None

    @with_db_connection
    async def find_user_by_id(self, conn, user_id: str) -> Optional[User]:
        query = """
            SELECT * FROM user_table WHERE userid=$1
        """
        user = await conn.fetchrow(query, user_id)

        if user is not None:
            data_dict = dict(user)
            return User.model_validate(data_dict)

        return None

    async def username_exists(self, username: str):
        user = await self.find_user_by_username(username)

        if user:
            raise DuplicateUserError(detail="Username già registrato")

    async def email_exists(self, email: str):
        user = await self.find_user_by_email(email)

        if user:
            raise DuplicateUserError(detail="Email già registrata")

    @with_db_connection
    async def find_public_info_by_ids(self, conn, user_ids: List[str]) -> List[dict]:
        """
        Recupera le informazioni pubbliche (id, username) per una lista di ID utente.

        Args:
            user_ids: Lista di UUID da cercare.

        Returns:
            Lista di dizionari con i campi richiesti (id e username).
        """
        if not user_ids:
            return []

        # La query WHERE IN con $1 è il modo sicuro in asyncpg per passare una lista.
        # asyncpg mappa la lista Python (user_ids) a un array SQL (text[])
        query = """
        SELECT userid, username, imageurl
        FROM user_table 
        WHERE userid = ANY($1::text[])
        """

        # Esegue la query, passando user_ids come singolo parametro
        records = await conn.fetch(query, user_ids)

        # Converte i record asyncpg in list di dict per il Service Layer
        return [dict(record) for record in records]
