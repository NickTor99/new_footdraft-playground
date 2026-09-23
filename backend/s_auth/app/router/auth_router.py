from typing import Annotated
from fastapi import APIRouter, Depends, Path, HTTPException
from fastapi.security import OAuth2PasswordBearer

from exceptions.exceptions import *
from services.jwt_service import verify_JWT

router = APIRouter()

from router.schemas import *
from services.auth_service import AuthService
from services.user_service import UserService

auth_service = AuthService()
user_service = UserService()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def authenticate_and_get_userId_from_JWT(token: Annotated[str, Depends(oauth2_scheme)]) -> str:
    try:
        user_id = await verify_JWT(token=token)
        return user_id
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)


@router.post("/auth/register")
async def register(regDTO: UserRegistrationDTO):
    try:
        await auth_service.registerUser(userData=regDTO)
    except RequestValidationError as re:
        raise re
    except Exception as e:
        raise e


@router.post("/auth/login",
             response_model=AuthTokenDTO,  # DTO di output per il successo
             status_code=status.HTTP_200_OK,
             summary="Login utente e emissione JWT")
async def login(logDTO: UserLoginDTO):
    try:
        token = await auth_service.authenticate(loginData=logDTO)
        print(token)
        return AuthTokenDTO(access_token=token, token_type="Bearer")
    except ServiceException as e:
        raise e


@router.post("/auth/logout",
             status_code=status.HTTP_200_OK,
             summary="Logout utente e invalidazione JWT")
async def logout(token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        await auth_service.logout(token)
    except ServiceException as e:
        raise e


@router.post("/auth/validate",
             response_model=str,
             status_code=status.HTTP_200_OK)
async def validate(token: AuthTokenDTO):
    try:
        user_id = await verify_JWT(token.access_token)
        return user_id
    except ServiceException as e:
        raise e


@router.get(
    "/users/me",
    response_model=UserPublicInfoDTO
)
async def getUser(user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)]):
    try:
        return await user_service.get_public_info_by_id(user_id)
    except ServiceException as e:
        raise e


@router.put("/users/me/username")
async def updateUsername(dto: UsernameUpdateDTO, token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        await user_service.update_username(dto.new_username, token)
    except ServiceException as e:
        raise e


@router.put("/users/me/image")
async def updateUserImage(dto: UserImageUpdateDTO, user_id: Annotated[str, Depends(authenticate_and_get_userId_from_JWT)]):
    try:
        await user_service.update_user_image(dto.user_image_base64, user_id)
    except ServiceException as e:
        raise e


@router.put("/users/me/password")
async def updatePassword(dto: PasswordUpdateDTO, token: Annotated[str, Depends(oauth2_scheme)]):
    try:
        await user_service.update_password(
            current_password=dto.current_password,
            new_password=dto.new_password,
            token=token
        )

        await auth_service.logout(token)
    except ServiceException as e:
        raise e


@router.post("/users/batch-info", response_model=list[UserPublicInfoDTO])
async def get_users_batch_info(
        user_list: UserIdListDTO,
):
    results = await user_service.get_public_info_by_ids(user_list.user_ids)
    return results


@router.post("/users/{user_id}", response_model=UserPublicInfoDTO)
async def get_user_by_id(
        user_id: str = Path(..., description="ID del utente target."),
):
    results = await user_service.get_public_info_by_id(user_id)
    return results
