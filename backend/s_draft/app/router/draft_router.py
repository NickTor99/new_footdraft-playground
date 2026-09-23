import json
from enum import Enum
from typing import Annotated, List

from fastapi import APIRouter, Depends, Path, HTTPException
from fastapi.websockets import WebSocket
from fastapi.websockets import WebSocketDisconnect

from dependencies import authenticate_and_get_userId_from_JWT
from models.DraftSession import DraftSession
from models.EvensOddsChoice import EvensOddsChoice
from models.create_draft_dto import CreateDraftDTO
from services.RedisDraftPublisher import RedisDraftPublisher
from services.DraftService import DraftService

router = APIRouter(prefix='/draft')

draftService = DraftService()
publisher = RedisDraftPublisher()


def json_serializer_session(obj):
    if hasattr(obj, "userId"):
        obj.userId = ''
    if isinstance(obj, Enum):
        return obj.value
    if hasattr(obj, "__dict__"):
        return obj.__dict__
    return str(obj)


@router.websocket("/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str = Path(..., description="ID della session target.")):
    await websocket.accept()
    await publisher.subscribe_local(session_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await publisher.unsubscribe_local(session_id, websocket)


@router.post(
    "/{group_id}/create",
    response_model=str
)
async def create_session(
        create_draft_dto: CreateDraftDTO,
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],  # L'utente da verificare
        group_id: str = Path(..., description="ID del gruppo target."),

):
    session = await draftService.create_session(
        group_id=group_id,
        captain_id=user_id,
        availablePlayers=create_draft_dto.availablePlayers,
        name=create_draft_dto.name
    )
    return session.sessionId


@router.get(
    "/{session_id}",
    response_model=str
)
async def get_session(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],  # L'utente da verificare
        session_id: str = Path(..., description="ID della session target."),
):
    session = await draftService.get_session(user_id=user_id, session_id=session_id)
    return json.dumps(session, default=json_serializer_session)


@router.get(
    "/group/{group_id}",
    response_model=List[str]
)
async def get_sessions_by_group(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],  # L'utente da verificare
        group_id: str = Path(..., description="ID del gruppo target."),
):
    sessions = await draftService.get_sessions(group_id=group_id, user_id=user_id)
    return [json.dumps(s, default=json_serializer_session) for s in sessions]


@router.post(
    "/{session_id}/join",
    response_model=str
)
async def join_session(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],
        session_id: str = Path(..., description="ID della session target."),
):
    session = await draftService.join_session(session_id=session_id, user_id=user_id)
    return json.dumps(session, default=json_serializer_session)


@router.post(
    "/{session_id}/evens-odds",
    response_model=str
)
async def handle_evens_odds_choice(
        choiceDTO: EvensOddsChoice,
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],
        session_id: str = Path(..., description="ID della session target."),
):
    if choiceDTO.choice is None or choiceDTO.choice == "":
        session = await draftService.captain2_evens_odds_choice(
            session_id=session_id,
            captain_id=user_id,
            choice=choiceDTO
        )
    else:
        session = await draftService.captain1_evens_odds_choice(
            session_id=session_id,
            captain_id=user_id,
            choice=choiceDTO
        )
    return json.dumps(session, default=json_serializer_session)


@router.post(
    "/{session_id}/{player_id}/select-player",
    response_model=str
)
async def select_player(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],
        player_id: str = Path(..., description="ID della session target."),
        session_id: str = Path(..., description="ID della session target."),
):
    session = await draftService.select_player(
        session_id=session_id,
        player_id=player_id,
        user_id=user_id
    )

    return json.dumps(session, default=json_serializer_session)
