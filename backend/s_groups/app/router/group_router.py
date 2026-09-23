from typing import Annotated, List

from fastapi import APIRouter, Depends
from fastapi import Path, Query
from fastapi import status
from fastapi.security import OAuth2PasswordBearer

from models.draft_history import DraftHistory
from models.group_model import Group
from models.membership_model import Membership
from services.group_service import GroupService

# Dependency che permette di validare il JWT ed estrarne l'user id -> Chimata al microservizio Auth
from dependencies import authenticate_and_get_userId_from_JWT
from router.schemas import *

router = APIRouter(prefix="/groups")

# Group Service riceve il client per comunicare con microservizi esterni
group_service = GroupService()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    response_model=Group
)
async def create_group_endpoint(
        group_data: GroupDetailDTO,
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],  # Utente Creatore
):
    """
    RF-G01.1: Crea un nuovo gruppo e assegna il ruolo di Admin all'utente creatore.
    """
    new_group = await group_service.create_group(group_data, user_id)
    return new_group

@router.delete(
    "/{group_id}",
    status_code=status.HTTP_200_OK,
)
async def delete_group_endpoint(
        group_id: str,
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],  # Utente admin
):
    """
    RF-G01.1: Elimina il gruppo (Solo Admin)
    """
    await group_service.delete_group(group_id, user_id)
    return {'message': "Gruppo eliminato con successo"}


@router.put(
    "/{group_id}",
    status_code=status.HTTP_200_OK,
)
async def update_group_endpoint(
        update_data: GroupDetailDTO,
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],  # Utente admin
):
    """
    RF-G01.1: Aggiorna info del gruppo (Solo Admin)
    """
    await group_service.update_group(update_data=update_data, admin_id=user_id)
    return {'message': "Informazioni del gruppo aggiornate con successo"}

@router.get(
    "/search",
    response_model=List[Group]
)
async def search_groups_by_name(
        q: Annotated[str, Query(min_length=3, description="Termine di ricerca per il nome del gruppo.")],
):
    groups = await group_service.search_groups(search_query=q)

    return groups

@router.get(
    "/{group_id}/is-admin",
    response_model=bool
)
async def check_is_admin_endpoint(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],  # L'utente da verificare
        group_id: str = Path(..., description="ID del gruppo target."),
):
    is_admin = await group_service.is_admin(group_id=group_id, user_id=user_id)
    return is_admin


@router.get(
    "/{group_id}/{user_id}/is-member",
    response_model=bool
)
async def check_is_member_endpoint(
        user_id: str = Path(..., description="ID dell'utente target."),
        group_id: str = Path(..., description="ID del gruppo target."),
):
    try:
        await group_service.is_member(group_id=group_id, user_id=user_id)
    except Exception:
        return False

    return True


@router.get(
    "/{group_id}/me/role",
    response_model=str
)
async def check_is_admin_endpoint(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],  # L'utente da verificare
        group_id: str = Path(..., description="ID del gruppo target."),
):
    try:
        is_member: Membership = await group_service.is_member(group_id=group_id, user_id=user_id)
    except Exception:
        return "Not Member"

    return is_member.userrole


@router.get(
    "/me",
    response_model=list[dict]
)
async def get_my_groups_endpoint(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],
):
    """
    RF-G03.1: Restituisce tutti i gruppi a cui l'utente autenticato appartiene.
    """
    groups = await group_service.get_groups_for_user(user_id)
    return groups


@router.get(
    "/{group_id}",
    response_model=Group
)
async def get_group(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],
        group_id: str = Path(..., description="ID del gruppo target."),
):
    """
    RF-G03.1: Restituisce le informazioni relative ad un gruppo tramite group_id.
    """
    group = await group_service.get_group_by_id(group_id)
    return group


@router.delete(
    path="/{group_id}/{user_id}",
    status_code=status.HTTP_202_ACCEPTED
)
async def delete_user_from_group(
        admin_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)], #admin
        group_id: str = Path(..., description="ID del gruppo target."),
        user_id: str = Path(..., description="ID dello user target."),
):
    await group_service.delete_user(group_id=group_id, user_id=user_id, admin_id=admin_id)
    return {'message': "Utente eliminato con successo"}


@router.post(
    path="/{group_id}/leave",
    status_code=status.HTTP_202_ACCEPTED
)
async def leave_group(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)], #user che esce
        group_id: str = Path(..., description="ID del gruppo target."),
):
    await group_service.leave_group(user_id=user_id, group_id=group_id)
    return {'message': "Hai abbandonato il gruppo"}


@router.get(
    "/{group_id}/users",
    response_model=list[dict]
)
async def get_members_endpoint(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],
        group_id: str = Path(..., description="ID del gruppo target."),
):
    """
    RF-G03.1: Restituisce tutti gli utenti appartenenti ad un gruppo. Richiede membership.
    """
    users = await group_service.get_users_from_group(user_id=user_id, group_id=group_id)
    return users


@router.get(
    "/{group_id}/users",
    response_model=list[dict]
)
async def get_players_endpoint(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],
        group_id: str = Path(..., description="ID del gruppo target."),
):
    """
    RF-G03.1: Restituisce tutti gli utenti appartenenti ad un gruppo. Richiede membership.
    """
    users = await group_service.get_players_from_group(user_id=user_id, group_id=group_id)
    return users


@router.post(
    "/{group_id}/request",
    status_code=status.HTTP_202_ACCEPTED
)
async def request_join_group_endpoint(
        user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],  # L'utente che richiede l'ingresso
        group_id: str = Path(..., description="ID del gruppo target."),
):
    """
    RF-G02.5: Invia una richiesta di ingresso al gruppo (azione pending).
    """
    # Il service si occupa di verificare se l'utente non è già membro.
    action = await group_service.send_join_request(group_id, user_id)
    return action


@router.put(
    "/request/{request_id}",
    status_code=status.HTTP_202_ACCEPTED,
    response_model=ActionConfirmationDTO
)
async def process_join_request_endpoint(
        admin_action: ActionStatusDTO,
        admin_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],  # L'admin che deve gestire
        request_id: str = Path(..., description="ID della richiesta di accesso."),
):
    """
    RF-G02.6: Permette all'Admin di accettare o rifiutare una richiesta di accesso.
    Il service deve verificare il ruolo di admin_id prima di eseguire l'azione.
    """
    action = await group_service.process_request(request_id, admin_id, admin_action)
    return action


@router.get(
    "/{group_id}/request/pending",
    response_model=list[dict]
)
async def get_pending_requests_endpoint(
        admin_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)],  # Solo Admin può vedere
        group_id: str = Path(..., description="ID del gruppo."),
):
    """
    UC-G04: Permette di recuperare tutte le richieste di ingresso non gestite dall'admin.
    Il service deve verificare che admin_id sia un Admin del gruppo.
    """
    pending_requests = await group_service.get_pending_actions(group_id, admin_id)
    print(pending_requests)
    return pending_requests


@router.post(
    "/{group_id}/draft",
    status_code=status.HTTP_201_CREATED,
    response_model=DraftHistory
)
async def save_draft_history(
        draft: DraftHistory,
):
    await group_service.save_draft_history(draft)
    return draft
