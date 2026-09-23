import uuid
from datetime import datetime, timedelta, timezone
from typing import List

from fastapi import status
from models.access_action_model import AccessAction
from models.draft_history import DraftHistory
from models.group_model import Group
from models.membership_model import Membership
from repositories.access_action_repository import AccessActionRepository
from repositories.draft_repository import DraftRepository
from repositories.group_repository import GroupRepository
from repositories.membership_repository import MembershipRepository

from common_exceptions import ServiceException
from decorator import service_exception_handler
from exceptions.exceptions import UserAlreadyInGroup, UserNotAdmin, DuplicateGroupNameError, UserNotMember, \
    RequestNotFound, GroupNotExists, GroupIsFull, RequestAlreadySent
from group_client import GroupServiceClient
from router.schemas import ActionStatusDTO, ActionConfirmationDTO, GroupDetailDTO


class GroupService:

    def __init__(self):
        self.groupRepository = GroupRepository()
        self.membershipRepository = MembershipRepository()
        self.accessActionRepository = AccessActionRepository()
        self.draftRepository = DraftRepository()
        self.client = GroupServiceClient()

    @service_exception_handler(DuplicateGroupNameError, ServiceException)
    async def create_group(self, group_data: GroupDetailDTO, user_id) -> Group:
        exists = await self.groupRepository.groupName_exists(groupName=group_data.group_name)

        if exists:
            raise DuplicateGroupNameError()

        group_id = uuid.uuid4()

        user = await self.client.get_user_public_info(user_id=str(user_id))

        print(user)

        if not user:
            raise ServiceException(status_code=status.HTTP_404_NOT_FOUND, detail="utente non trovato")

        new_group = Group(
            groupid=str(group_id),
            creatorid=user['username'],
            groupname=group_data.group_name,
            maxmember=group_data.max_member,
            createdat=datetime.now(),
            description=group_data.description,
            membercount=0,
            isprivate=group_data.is_private,
            category=group_data.category
        )

        await self.groupRepository.save(new_group)

        new_membership = Membership(groupid=str(group_id), userid=str(user_id), userrole="Admin")

        await self.membershipRepository.save(new_membership)

        return new_group

    @service_exception_handler(UserNotAdmin)
    async def delete_group(self, group_id: str, admin_id: str):
        is_admin = await self.is_admin(group_id=group_id, user_id=admin_id)
        if not is_admin:
            raise UserNotAdmin()

        await self.groupRepository.delete(group_id)

    @service_exception_handler()
    async def update_group(self, group_id, update_data: GroupDetailDTO, admin_id: str):
        is_admin = await self.is_admin(group_id=group_id, user_id=admin_id)
        if not is_admin:
            raise UserNotAdmin()

        await self.groupRepository.update(update_data=update_data, group_id=group_id)

    @service_exception_handler(GroupNotExists)
    async def get_group_by_id(self, group_id: str) -> Group:
        group = await self.groupRepository.find_group_by_id(group_id)

        if not group:
            raise GroupNotExists()

        return Group.model_validate(group)

    @service_exception_handler()
    async def search_groups(self, search_query: str) -> List[Group]:
        """
        Cerca gruppi per nome e mappa i risultati all'Entity Group.
        """
        if not search_query or len(search_query.strip()) < 3:
            # Opzionale: Aggiungere un requisito minimo di caratteri
            return []

        # 1. Chiama il Repository
        raw_groups = await self.groupRepository.elastic_search(search_query)
        print(raw_groups)

        # 2. Mappa i dati grezzi all'Entity/DTO
        # Assumiamo che il nome del campo nel DB (groupId) sia mappato correttamente
        # all'alias nel modello (group_id) tramite Pydantic Config.
        groups_dtos = [Group.model_validate(data) for data in raw_groups]

        return groups_dtos

    @service_exception_handler(UserNotMember)
    async def is_member(self, group_id: str, user_id: str) -> Membership:
        member: Membership = await self.membershipRepository.search_role(group_id=group_id, user_id=user_id)

        if not member:
            raise UserNotMember()
        return member

    @service_exception_handler()
    async def is_admin(self, group_id: str, user_id: str) -> bool:
        member = await self.is_member(group_id=group_id, user_id=user_id)

        if member.userrole == "Admin":
            return True
        else:
            return False

    @service_exception_handler()
    async def get_groups_for_user(self, user_id: str) -> List[dict]:
        memberships = await self.membershipRepository.search_by_userid(user_id=user_id)

        return memberships

    @service_exception_handler()
    async def get_users_from_group(self, group_id: str, user_id: str) -> List[dict]:
        await self.is_member(group_id=group_id, user_id=user_id)  # Check se l'user è membro del gruppo

        list_members: List[Membership] = await self.membershipRepository.search_by_groupid(group_id)

        if not list_members:
            return []

        ids = [m.userid for m in list_members]

        # Chiama il microservizio utenti per recuperare le informazioni publiche degli users
        list_users = await self.client.get_users_public_info(user_ids=ids)

        return list_users

    @service_exception_handler(UserAlreadyInGroup, GroupNotExists, RequestAlreadySent)
    async def send_join_request(self, group_id, user_id) -> ActionConfirmationDTO:
        join_request_exists = await self.accessActionRepository.find_pending_requests_by_group_and_user(group_id=group_id, user_id=user_id)

        if join_request_exists:
            raise RequestAlreadySent()


        member: Membership = await self.membershipRepository.search_role(group_id=group_id, user_id=user_id)

        if member:
            raise UserAlreadyInGroup()

        group_exists = await self.groupRepository.groupId_exists(group_id)

        if not group_exists:
            raise GroupNotExists()

        action = AccessAction(
            actionid=str(uuid.uuid4()),
            groupid=group_id,
            targetuserid="",
            creatoruserid=user_id,
            expire=datetime.now(timezone.utc) + timedelta(days=3),
            status="PENDING",
            actiontype="REQUEST"
        )

        await self.accessActionRepository.save(action)

        return ActionConfirmationDTO(message="Richiesta inviata. In attesa di approvazione Admin.",
                                     action_id=action.actionid)

    @service_exception_handler(UserNotAdmin, RequestNotFound, GroupIsFull, GroupNotExists)
    async def process_request(self, request_id, admin_id, status: ActionStatusDTO) -> ActionConfirmationDTO:
        request: AccessAction = await self.accessActionRepository.find_by_id(action_id=request_id)

        # CHECK PER RICHISTA SCADUTE
        if not request or datetime.now(timezone.utc) >= request.expire:
            raise RequestNotFound()

        # CHECK PER LIMITE DI MEMBRI DEL GRUPPO
        group: Group = await self.groupRepository.find_group_by_id(request.groupid)
        if group:
            count = await self.membershipRepository.get_group_size(request.groupid)
            if count >= group.maxmember:
                raise GroupIsFull()
        else:
            raise GroupNotExists()

        # CHECK PER VERIFICARE CHE L'UTENTE CHE GESTISCE LA RICHIESTA è ADMIN
        is_admin = await self.is_admin(group_id=request.groupid, user_id=admin_id)

        if is_admin:
            if status.status == "ACCEPTED":
                member = Membership(groupid=request.groupid, userid=request.creatoruserid, userrole="Member")

                await self.membershipRepository.save(member)

                await self.accessActionRepository.update_status(action_id=request_id, new_status="ACCEPTED")

                user = await self.client.get_user_public_info(request.creatoruserid)

                return ActionConfirmationDTO(message="Utente aggiunto al gruppo", action_id=request_id, user=user)

            elif status.status == "REJECTED":
                await self.accessActionRepository.update_status(action_id=request_id, new_status="REJECTED")
                return ActionConfirmationDTO(message="Richiesta rifiutata", action_id=request_id)
        else:
            raise UserNotAdmin()

    @service_exception_handler(UserNotAdmin, GroupNotExists)
    async def get_pending_actions(self, group_id, admin_id) -> List[dict] | None:
        group_exists = await self.groupRepository.groupId_exists(group_id)

        if not group_exists:
            raise GroupNotExists()

        is_admin = await self.is_admin(group_id=group_id, user_id=admin_id)

        if is_admin:
            pending_actions = await self.accessActionRepository.find_pending_requests_by_group(group_id=group_id)

            for p in pending_actions:
                user_id = p['creatoruserid']
                user = await self.client.get_user_public_info(user_id)
                p['user'] = user

            return pending_actions

        else:
            raise UserNotAdmin()

    @service_exception_handler(GroupNotExists, UserNotAdmin)
    async def delete_user(self, group_id: str, user_id: str, admin_id: str):
        group_exists = await self.groupRepository.groupId_exists(group_id)

        if not group_exists:
            raise GroupNotExists()

        is_admin = await self.is_admin(group_id=group_id, user_id=admin_id)

        if is_admin:
            await self.membershipRepository.delete(user_id=user_id, group_id=group_id)
        else:
            raise UserNotAdmin()

    @service_exception_handler(GroupNotExists)
    async def leave_group(self, group_id: str, user_id: str):
        print(group_id)
        group_exists = await self.groupRepository.groupId_exists(group_id)

        if not group_exists:
            raise GroupNotExists()

        await self.membershipRepository.delete(user_id=user_id, group_id=group_id)

    async def save_draft_history(self, draft: DraftHistory):
        await self.draftRepository.save(draft)
