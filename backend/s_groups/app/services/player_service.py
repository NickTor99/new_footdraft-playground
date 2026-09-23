import io
from typing import List

from models.player_profile_model import PlayerProfile
from repositories.player_profile_repository import PlayerRepository

from decorator import service_exception_handler
from exceptions.exceptions import UserNotAdmin, UserNotMember, AssociationError, PlayerNotFound, PlayerAlreadyExists
from services.group_service import GroupService
from router.schemas import PlayerStatsUpdateDTO, PlayerCreateDTO
from utils import decode_base64_image
from service_configuration import AppState as state


class PlayerService:
    def __init__(self, group_service: GroupService):
        self.playerRepository = PlayerRepository()
        self.group_service = group_service

    # --- LOGICA DI BUSINESS ---

    @service_exception_handler(UserNotAdmin, PlayerNotFound, UserNotMember)
    async def get_group_players(self, group_id: str, current_user_id: str) -> List[PlayerProfile]:
        """UC-S03: Lista giocatori (richiede membership)."""
        await self.group_service.is_member(user_id=current_user_id, group_id=group_id)
        return await self.playerRepository.get_by_group(group_id=group_id)

    @service_exception_handler(UserNotAdmin, PlayerNotFound, UserNotMember)
    async def get_player_detail(self, group_id: str, player_id: str, current_user_id: str) -> PlayerProfile:
        """UC-S03: Dettaglio giocatore (richiede membership)."""
        await self.group_service.is_member(user_id=current_user_id, group_id=group_id)
        player = await self.playerRepository.get_by_id(group_id=group_id, player_id=player_id)
        if not player:
            raise PlayerNotFound(f"Giocatore {player_id} non trovato.")
        return player

    @service_exception_handler(UserNotAdmin, PlayerNotFound, UserNotMember)
    async def get_players_detail(self, group_id: str, player_ids: List[str], current_user_id: str) -> List[
        PlayerProfile]:
        """UC-S03: Dettaglio giocatore (richiede membership)."""
        await self.group_service.is_member(user_id=current_user_id, group_id=group_id)
        players = await self.playerRepository.get_by_ids(group_id=group_id, player_ids=player_ids)
        if not players:
            raise PlayerNotFound(f"Giocatori {player_ids} non trovati.")
        return players

    @service_exception_handler(UserNotAdmin, PlayerAlreadyExists)
    async def create_player(self, group_id: str, player_data: PlayerCreateDTO, current_user_id: str) -> PlayerProfile:
        """UC-S01: Crea giocatore (Admin)."""
        is_admin = await self.group_service.is_admin(group_id=group_id, user_id=current_user_id)

        if not is_admin:
            raise UserNotAdmin()

        player = await self.playerRepository.get_by_nickname(group_id=group_id, player_nickname=player_data.nickname)

        if player:
            raise PlayerAlreadyExists()

        new_player = PlayerProfile(
            nickname=player_data.nickname,
            groupid=group_id,
            linckeduserid="",
            velocita=player_data.velocita,
            attacco=player_data.attacco,
            difesa=player_data.difesa,
            tecnica=player_data.tecnica
        )
        return await self.playerRepository.save(player=new_player)

    @service_exception_handler(UserNotAdmin, PlayerNotFound)
    async def update_player_stats(self, group_id: str, player_id: str, stats: PlayerStatsUpdateDTO,
                                  current_user_id: str) -> PlayerProfile:
        """UC-S02: Aggiorna statistiche (Admin)."""
        is_admin = await self.group_service.is_admin(group_id=group_id, user_id=current_user_id)

        if not is_admin:
            raise UserNotAdmin()
        updated_player = await self.playerRepository.update_stats(group_id=group_id, player_id=player_id, stats=stats)
        if not updated_player:
            raise PlayerNotFound("Giocatore non trovato per l'aggiornamento.")
        return updated_player

    @service_exception_handler(UserNotAdmin, PlayerNotFound)
    async def delete_player(self, group_id: str, player_id: str, current_user_id: str):
        """UC-S01: Elimina giocatore (Admin)."""
        is_admin = await self.group_service.is_admin(group_id=group_id, user_id=current_user_id)

        if not is_admin:
            raise UserNotAdmin()
        success = await self.playerRepository.delete(group_id=group_id, player_id=player_id)
        if not success:
            raise PlayerNotFound("Giocatore non trovato per l'eliminazione.")

    @service_exception_handler(UserNotAdmin, PlayerNotFound, AssociationError)
    async def associate_user(self, group_id: str, player_id: str, user_id_to_link: str, current_user_id: str):
        """UC-S01: Associa utente a giocatore (Admin)."""
        is_admin = await self.group_service.is_admin(group_id=group_id, user_id=current_user_id)

        if not is_admin:
            raise UserNotAdmin()

        player = await self.playerRepository.get_by_id(group_id=group_id, player_id=player_id)
        if not player:
            raise PlayerNotFound("Giocatore non trovato.")

        if player.linckeduserid and player.linckeduserid.strip() != "":
            raise AssociationError("Questo giocatore è già associato ad un altro utente.")

        await self.playerRepository.update_association(group_id=group_id, player_id=player_id, user_id=user_id_to_link)

    @service_exception_handler(UserNotAdmin, PlayerNotFound)
    async def dissociate_user(self, group_id: str, player_id: str, current_user_id: str):
        """UC-S01: Rimuove associazione (Admin)."""
        is_admin = await self.group_service.is_admin(group_id=group_id, user_id=current_user_id)

        if not is_admin:
            raise UserNotAdmin()
        success = await self.playerRepository.update_association(group_id=group_id, player_id=player_id, user_id="")
        if not success:
            raise PlayerNotFound("Giocatore non trovato.")

    @service_exception_handler(PlayerNotFound)
    async def save_avatar(self, user_image_base64: str, player_id: str, group_id: str):
        player = await self.playerRepository.get_by_id(group_id=group_id,player_id=player_id)

        if player is None:
            raise PlayerNotFound("Giocatore non trovato.")

        image = decode_base64_image(user_image_base64)
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")

        filename = f"{player_id}.png"

        public_url = state.storage_client.upload_image(image_data=buffered, filename=filename)

        return await self.playerRepository.update(field='avatar', value=public_url,player_id=player_id)

    async def verify_association_internal(self, user_id: str, player_id: str) -> bool:
        """Verifica Inter-Servizio."""
        return await self.playerRepository.check_user_association(user_id=user_id, player_id=player_id)
