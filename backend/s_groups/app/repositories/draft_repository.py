from models.draft_history import *

from decorator import with_db_connection


class DraftRepository():

    @with_db_connection
    async def save(self, conn, draft_history: DraftHistory):
        q3 = """
        INSERT INTO team(team_id, name)
        VALUES ($1,$2)
        """

        await conn.execute(
            q3,
            draft_history.captain1.team.team_id,
            draft_history.captain1.team.name
        )
        await conn.execute(
            q3,
            draft_history.captain2.team.team_id,
            draft_history.captain2.team.name
        )

        q4 = """
        INSERT INTO team_association(team_id, player_id)
        VALUES ($1,$2)
        """

        for p in draft_history.captain1.team.players:
            await conn.execute(
                q4,
                draft_history.captain1.team.team_id,
                p
            )

        for p in draft_history.captain2.team.players:
            await conn.execute(
                q4,
                draft_history.captain2.team.team_id,
                p
            )


        q2 = """
        INSERT INTO captain(captain_id, captain_username, user_id, team_id)
        VALUES ($1,$2,$3,$4)
        """

        await conn.execute(
            q2,
            draft_history.captain1.captain_id,
            draft_history.captain1.captain_username,
            draft_history.captain1.user_id,
            draft_history.captain1.team.team_id
        )
        await conn.execute(
            q2,
            draft_history.captain2.captain_id,
            draft_history.captain2.captain_username,
            draft_history.captain2.user_id,
            draft_history.captain2.team.team_id
        )

        q1 = """
        INSERT INTO draft(session_id, group_id, captain1_id, captain2_id, finished_at)
        VALUES ($1,$2,$3,$4,$5)
        """

        await conn.execute(
            q1,
            draft_history.session_id,
            draft_history.group_id,
            draft_history.captain1.captain_id,
            draft_history.captain2.captain_id,
            draft_history.timestamp
        )

    @with_db_connection
    async def get_by_id(self, conn, draft_id) -> Optional[DraftHistory]:
        q1 = """
        SELECT *
        FROM draft
        WHERE session_id = $1
        """

        return await self.create_draft_history(dict(await conn.fatchrow(q1, draft_id)))

    @with_db_connection
    async def get_by_group(self, conn, group_id) -> List[Optional[DraftHistory]]:
        q = """
        SELECT *
        FROM draft
        WHERE group_id = $1
        """

        drafts = await conn.fetch(q, group_id)

        return [await self.create_draft_history(d) for d in drafts]

    @with_db_connection
    async def create_draft_history(self, conn, draft):
        q2 = """"
        SELECT *
        FROM captain
        WHERE captain_id = $1
        """

        cap1 = dict(await conn.fatchrow(q2, draft['captain1_id']))
        cap2 = dict(await conn.fatchrow(q2, draft['captain2_id']))

        q3 = """
        SELECT name
        FROM team
        WHERE team_id = $1
        """

        team1_name = str(await conn.fatchrow(q3, cap1['team_id']))
        team2_name = str(await conn.fatchrow(q3, cap2['team_id']))

        q4 = """
        SELECT player_id
        FROM team_association
        WHERE team_id = $1
        """

        players1 = await conn.fatch(q4, cap1['team_id'])
        players2 = await conn.fatch(q4, cap2['team_id'])

        team1 = TeamHistory(
            name=team1_name,
            players=[p for p in players1]
        )
        team2 = TeamHistory(
            name=team2_name,
            players=[p for p in players2]
        )
        captain1 = CaptainHistory(
            captain_id=cap1['captain_id'],
            user_id=cap1['user_id'],
            captain_username=cap1['captain_username'],
            team=team1
        )
        captain2 = CaptainHistory(
            captain_id=cap2['captain_id'],
            user_id=cap2['user_id'],
            captain_username=cap2['captain_username'],
            team=team2
        )

        draft_history = DraftHistory(
            name=draft['name'],
            session_id=draft['session_id'],
            group_id=draft['group_id'],
            captain1=captain1,
            captain2=captain2,
            timestamp=draft['finished_at']
        )
