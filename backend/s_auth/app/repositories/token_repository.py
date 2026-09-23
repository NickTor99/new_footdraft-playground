from datetime import datetime
from decorator import with_db_connection


class TokenRepository:

    @with_db_connection
    async def add_to_blacklist(self, conn, token: str, exp: int):
        date = datetime.fromtimestamp(exp)

        query = """
            INSERT INTO blacklist
            VALUES ($1,$2)
            """

        await conn.execute(query, token, date)

    @with_db_connection
    async def is_blacklisted(self, conn, token: str) -> bool:
        query = """
        SELECT * FROM blacklist WHERE token = $1
        """

        token = await conn.fetchrow(query, token)

        if token is not None:
            return True
        else:
            return False
