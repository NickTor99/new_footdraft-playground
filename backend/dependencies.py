from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from service_configuration import AppState as state

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def authenticate_and_get_userId_from_JWT(token: Annotated[str, Depends(oauth2_scheme)]) -> str:

    headers = {"Content-Type": "application/json"}
    x = await state.http_client.post(
        url=state.service_auth_host,
        json={"access_token": token, "token_type": "Bearer"},
        headers=headers
    )

    if x.status_code != 200:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)

    return x.text.split('"')[1]
