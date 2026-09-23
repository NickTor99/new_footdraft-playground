import asyncio
import datetime
import uuid
from typing import List, Optional
from fastapi import HTTPException

from models.History import *
from services.RedisDraftPublisher import RedisDraftPublisher
from models.Captain import Captain
from models.DraftMove import DraftMove
from models.DraftSession import DraftSession
from models.DraftStatus import DraftStatus
from models.EvensOddsChoice import EvensOddsChoice
from models.MoveType import MoveType
from repositories.RedisDraftRepository import RedisDraftRepository
from draft_client import DraftServiceClient


class DraftService:
    def __init__(self):
        self.repository = RedisDraftRepository()
        self.publisher = RedisDraftPublisher()
        self.draftClient = DraftServiceClient()

    async def get_session(self, session_id, user_id) -> Optional[DraftSession]:
        session = await self._get_session(session_id)
        await self._is_member(group_id=session.groupId, user_id=user_id)
        return session

    async def get_sessions(self, group_id, user_id) -> Optional[List[DraftSession]]:
        await self._is_member(group_id=group_id, user_id=user_id)
        sessions = await self.repository.get_sessions_by_group(group_id=group_id)
        return sessions

    async def create_session(self, group_id: str, captain_id: str, name: str,
                             availablePlayers: List[str]) -> Optional[DraftSession]:
        await self._is_member(group_id=group_id, user_id=captain_id)

        captain1 = await self._create_captain(captain_id)

        session = DraftSession(
            sessionId=str(uuid.uuid4()),
            groupId=group_id,
            name=name,
            availablePlayers=availablePlayers,
            captain1=captain1
        )

        await self.repository.save_to_cache(session)

        return session

    async def join_session(self, session_id, user_id) -> Optional[DraftSession]:
        session = await self._get_session(session_id)

        if session.status != DraftStatus.WAITING_FOR_CAPTAIN2:
            return session

        if session.captain1.userId == user_id:
            return session

        await self._is_member(group_id=session.groupId, user_id=user_id)

        captain2 = await self._create_captain(user_id)
        move = DraftMove(captainId=user_id, type=MoveType.JOIN_SESSION)

        session.joinCaptain(captain2=captain2)
        session.lastMove = move

        await self.repository.save_to_cache(session)

        await self.publisher.broadcast_event(session)

        return session

    async def captain1_evens_odds_choice(self, session_id, captain_id, choice: EvensOddsChoice) -> Optional[DraftSession]:
        session = await self._get_session(session_id)
        if session.status != DraftStatus.WAIT_EVENS_ODDS_CHOICE_CAP1:
            raise Exception()

        if session.isCaptain1(captain_id):
            session.getCaptain(captain_id).initialChoice = choice
            session.status = DraftStatus.WAIT_EVENS_ODDS_CHOICE_CAP2
            move = DraftMove(captainId=captain_id, type=MoveType.EVENS_ODDS_CHOICE_CAP1, value=choice.number)
            session.lastMove = move
            await self.repository.save_to_cache(session)

            # hide choice to the client
            session.captain1.initialChoice.choice = ''
            await self.publisher.broadcast_event(session)

            return session
        else:
            raise Exception()

    async def captain2_evens_odds_choice(self, session_id, captain_id, choice: EvensOddsChoice) -> Optional[DraftSession]:
        session = await self._get_session(session_id)
        if session.status != DraftStatus.WAIT_EVENS_ODDS_CHOICE_CAP2:
            raise Exception()

        if session.isCaptain2(captain_id):
            session.getCaptain(captain_id).initialChoice = choice

            session.createTurnOrder()

            move = DraftMove(captainId=captain_id, type=MoveType.EVENS_ODDS_CHOICE_CAP2, value=choice)
            session.lastMove = move

            await self.repository.save_to_cache(session)

            await self.publisher.broadcast_event(session)

            return session
        else:
            raise Exception()

    async def select_player(self, session_id: str, user_id: str, player_id: str) -> Optional[DraftSession]:
        """
        Gestisce la selezione del giocatore.
        """
        # 1. Recupero stato come Oggetto DraftSession
        session = await self._get_session(session_id)

        # 2. LOGICA DI BUSINESS
        session.pickPlayer(playerId=player_id, userId=user_id)

        session.nextTurn()

        # 3. Creazione oggetto Mossa
        move_details = DraftMove(
            captainId=session.getCaptain(userId=user_id).username,
            type=MoveType.SELECT_PLAYER,
            value=player_id,
        )

        # 4. AGGIORNAMENTO STATO OGGETTO
        session.lastMove = move_details
        # Qui rimuoveresti il player da session.availablePlayers, ecc.

        # 5. PERSISTENZA
        # await self.repository.save_move(move_details.__dict__)

        # Serializzazione per salvataggio DB (se il repo vuole dict)
        # await self.repository.save_session_state(session.__dict__)

        if session.status == 'FINISHED':
            team1 = TeamHistory(
                team_id=str(uuid.uuid4()),
                name=f"{session.captain1.username}'s Team",
                players=session.captain1.pickedPlayers
            )
            team2 = TeamHistory(
                team_id=str(uuid.uuid4()),
                name=f"{session.captain2.username}'s Team",
                players=session.captain2.pickedPlayers
            )

            captain1_history = CaptainHistory(
                captain_id=str(uuid.uuid4()),
                captain_username=session.captain1.username,
                user_id=session.captain1.userId,
                team=team1
            )

            captain2_history = CaptainHistory(
                captain_id=str(uuid.uuid4()),
                captain_username=session.captain2.username,
                user_id=session.captain2.userId,
                team=team2
            )

            draft_history = DraftHistory(
                name=session.name,
                session_id=session_id,
                group_id=session.groupId,
                captain1=captain1_history,
                captain2=captain2_history,
                timestamp=datetime.now()
            )
            await self.repository.save_history(session=draft_history)

        # Aggiornamento Cache Redis
        await self.repository.save_to_cache(session)

        # 6. NOTIFICA
        await self.publisher.broadcast_event(session)

        return session

    async def _get_session(self, session_id) -> Optional[DraftSession]:
        session = await self.repository.get_from_cache(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Sessione non trovata")

        return session

    async def _is_member(self, group_id, user_id):
        is_member = await self.draftClient.is_member(group_id=group_id, user_id=user_id)
        if not is_member:
            raise Exception()

    async def _create_captain(self, user_id) -> Captain:
        user = await self.draftClient.get_user_public_info(user_id=user_id)
        return Captain(username=user['username'], userId=user_id)


"""team1 = TeamHistory(
    team_id=str(uuid.uuid4()),
    name=f"Team",
    players=[]
)
team2 = TeamHistory(
    team_id=str(uuid.uuid4()),
    name=f"Team",
    players=[]
)

captain1_history = CaptainHistory(
    captain_id=str(uuid.uuid4()),
    captain_username='session.captain1.username',
    user_id='session.captain1.userId',
    team=team1
)

captain2_history = CaptainHistory(
    captain_id=str(uuid.uuid4()),
    captain_username='session.captain2.username',
    user_id='session.captain2.userId',
    team=team2
)

draft_history = DraftHistory(
    name='session.name',
    session_id='session_id',
    group_id='session.groupId',
    captain1=captain1_history,
    captain2=captain2_history,
    timestamp=datetime.now()
)

ds = DraftService()


asyncio.run(ds.draftClient.send_draft_history(draft_history))"""