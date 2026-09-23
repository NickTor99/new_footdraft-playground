from typing import Annotated, List

from fastapi import APIRouter, Depends
from fastapi import Path
from fastapi import status
from fastapi.security import OAuth2PasswordBearer
from models.player_profile_model import PlayerProfile
from services.group_service import GroupService
from services.player_service import PlayerService

from dependencies import authenticate_and_get_userId_from_JWT
from router.schemas import *

router = APIRouter(prefix="/players", tags=["Players"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

group_service = GroupService()

player_service = PlayerService(group_service=group_service)

@router.get(
    "/{group_id}",
    response_model=List[PlayerProfile]
)
async def get_players_in_group(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],
        group_id: str = Path(..., description="ID del gruppo target.")
):
    """
    UC-S03: Restituisce la lista di tutti i giocatori virtuali presenti in un gruppo.
    Richiede membership verificata tramite GroupService.
    """
    return await player_service.get_group_players(group_id, user_id)

@router.get(
    "/{group_id}/{player_id}",
    response_model=PlayerProfile
)
async def get_player_details(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],
        group_id: str = Path(..., description="ID del gruppo."),
        player_id: str = Path(..., description="ID del giocatore.")
):
    """
    UC-S03: Restituisce i dettagli di un singolo giocatore virtuale.
    Richiede membership verificata tramite GroupService.
    """
    return await player_service.get_player_detail(group_id, player_id, user_id)


@router.post(
    "/info/{group_id}",
    response_model=List[PlayerProfile]
)
async def get_players_info(
        player_ids: List[str],
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],
        group_id: str = Path(..., description="ID del gruppo."),
):
    """
    UC-S03: Restituisce i dettagli di un singolo giocatore virtuale.
    Richiede membership verificata tramite GroupService.
    """
    print('jooooo')
    return await player_service.get_players_detail(group_id=group_id, player_ids=player_ids, current_user_id=user_id)


@router.post(
    "/{group_id}",
    status_code=status.HTTP_201_CREATED,
    response_model=PlayerProfile
)
async def create_player_slot(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],
        player_data: PlayerCreateDTO,
        group_id: str = Path(..., description="ID del gruppo in cui creare il giocatore.")
):
    """
    UC-S01: Crea un nuovo slot di Giocatore Virtuale nel gruppo.
    Richiede permessi Admin verificati tramite GroupService.
    """
    return await player_service.create_player(group_id, player_data, user_id)

@router.put(
    "/{group_id}/{player_id}/stats",
    response_model=PlayerProfile
)
async def update_player_statistics(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],
        stats_data: PlayerStatsUpdateDTO,
        group_id: str = Path(..., description="ID del gruppo."),
        player_id: str = Path(..., description="ID del giocatore.")
):
    """
    UC-S02: Aggiorna le statistiche di un giocatore esistente.
    Richiede permessi Admin verificati tramite GroupService.
    """
    return await player_service.update_player_stats(group_id, player_id, stats_data, user_id)


class AvatarImageUpdateDTO(BaseModel):
    user_image_base64: str


@router.put(
    "/{group_id}/{player_id}/avatar",
    response_model=PlayerProfile
)
async def update_player_avatar(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],
        dto: AvatarImageUpdateDTO,
        group_id: str = Path(..., description="ID del gruppo."),
        player_id: str = Path(..., description="ID del giocatore."),
):
    return await player_service.save_avatar(user_image_base64=dto.user_image_base64, player_id=player_id, group_id=group_id)


@router.delete(
    "/{group_id}/{player_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_player(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],
        group_id: str = Path(..., description="ID del gruppo."),
        player_id: str = Path(..., description="ID del giocatore.")
):
    """
    UC-S01: Elimina un Giocatore Virtuale dal gruppo.
    Richiede permessi Admin verificati tramite GroupService.
    """
    await player_service.delete_player(group_id, player_id, user_id)

@router.post(
    "/{group_id}/{player_id}/associate",
    status_code=status.HTTP_200_OK
)
async def associate_user_to_player(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],
        payload: AssociationDTO,
        group_id: str = Path(..., description="ID del gruppo."),
        player_id: str = Path(..., description="ID del giocatore.")
):
    """
    UC-S01: Gestione Associazioni Utente-Giocatore.
    Associa un userId a un playerId libero. Richiede permessi Admin.
    """
    await player_service.associate_user(group_id, player_id, payload.user_id, user_id)
    return {"message": "Association successful"}

@router.delete(
    "/{group_id}/{player_id}/associate",
    status_code=status.HTTP_200_OK
)
async def remove_association(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],
        group_id: str = Path(..., description="ID del gruppo."),
        player_id: str = Path(..., description="ID del giocatore.")
):
    """
    UC-S01: Rimuove l’associazione, liberando lo slot del giocatore virtuale.
    Richiede permessi Admin.
    """
    await player_service.dissociate_user(group_id, player_id, user_id)
    return {"message": "Association removed, slot free"}

@router.get(
    "/check-association"
)
async def check_association_internal(
        user_id_to_check: str,
        player_id_to_check: str
):
    """
    Verifica Autorizzazione (Inter-Servizio).
    Endpoint interno, non richiede necessariamente JWT se protetto in altro modo,
    ma manteniamo la logica semplice per ora.
    """
    is_associated = await player_service.verify_association_internal(user_id_to_check, player_id_to_check)
    return {"associated": is_associated}