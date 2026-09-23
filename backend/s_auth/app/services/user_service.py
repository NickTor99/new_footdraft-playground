import io
from typing import List

import storage_client
from utils import decode_base64_image
from decorator import service_exception_handler
from exceptions.exceptions import UserNotFoundError, CredentialsError
from repositories.user_repository import UserRepository
from router.schemas import UserPublicInfoDTO
from services.auth_service import verify_JWT, hash_password, verify_password
from service_configuration import AppState as state


class UserService:
    def __init__(self):
        self.userRepository = UserRepository()

    async def update_username(self, new_username: str, token: str):
        user_id = await verify_JWT(token=token)

        user = await self.userRepository.find_user_by_id(user_id=user_id)

        if not user:
            raise UserNotFoundError()

        user.username = new_username

        await self.userRepository.update(field="username", value=new_username, user_id=user_id)

    async def update_password(self, new_password: str, current_password: str, token: str):
        user_id = await verify_JWT(token=token)

        user = await self.userRepository.find_user_by_id(user_id)

        if not user:
            raise UserNotFoundError()

        if verify_password(password=current_password, hashed_password=user.passwordhash):
            raise CredentialsError(detail="Password attuale non corretta")

        new_password_hash = hash_password(new_password)

        await self.userRepository.update(field="passwordhash", value=new_password_hash, user_id=user_id)

    @service_exception_handler()
    async def get_public_info_by_ids(self, user_ids: List[str]) -> List[UserPublicInfoDTO]:
        """
        Recupera i dati pubblici degli utenti dal repository e li mappa al DTO.
        """
        if not user_ids:
            return []

        # 1. Recupera i dati grezzi dal DB (lista di dict)
        user_data_list = await self.userRepository.find_public_info_by_ids(user_ids)

        # 2. Mappa la lista di dict al DTO Pydantic
        # Usiamo model_validate per applicare la validazione e la mappatura degli alias (es. 'id' -> 'user_id')
        public_info_dtos = [UserPublicInfoDTO.model_validate(data) for data in user_data_list]

        return public_info_dtos

    @service_exception_handler(UserNotFoundError)
    async def get_public_info_by_id(self, user_id: str) -> UserPublicInfoDTO:
        user = await self.userRepository.find_user_by_id(user_id)

        if not user:
            raise UserNotFoundError()

        info = {"userid": user.userid, "username": user.username, "imageurl": user.imageurl}

        return UserPublicInfoDTO.model_validate(info)

    @service_exception_handler()
    async def update_user_image(self, user_image_base64: str, user_id: str):
        image = decode_base64_image(user_image_base64)
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")

        filename = f"{user_id}.png"

        public_url = state.storage_client.upload_image(image_data=buffered, filename=filename)

        await self.userRepository.update(field="imageUrl", value=public_url, user_id=user_id)


