from repositories.user_repository import UserRepository
from router.schemas import UserRegistrationDTO, UserLoginDTO
import uuid
from models.user_model import User
from services.jwt_service import *


class AuthService:
    def __init__(self):
        self.userRepository = UserRepository()
        self.tokenRepository = TokenRepository()

    async def registerUser(self, userData: UserRegistrationDTO):
        try:
            await self.userRepository.username_exists(userData.username)
            await self.userRepository.email_exists(userData.email)

            print('debug')

            password_hash = hash_password(userData.password)

            user_id = uuid.uuid4()
            new_user = User(userid=str(user_id), email=userData.email, username=userData.username,
                            passwordhash=password_hash, imageurl='http://localhost:9000/users/placeholder')

            await self.userRepository.save(new_user)
        except Exception as e:
            raise e

    async def authenticate(self, loginData: UserLoginDTO) -> str:

        # CHECK USERNAME OR EMAIL
        if loginData.username:
            user = await self.userRepository.find_user_by_username(loginData.username)
        else:
            user = await self.userRepository.find_user_by_email(loginData.email)

        if not user:
            raise CredentialsError()

        # CHECK PASSWORD
        if verify_password(loginData.password, user.passwordhash):
            return await generate_JWT(user.userid)
        else:
            raise CredentialsError()

    async def logout(self, token: str):
        exp = await verify_JWT(token, get="exp")
        await self.tokenRepository.add_to_blacklist(token, exp)
