import os
from typing import List
import httpx
from client_singleton import ServiceClient

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth_service:8000")


class GroupServiceClient(ServiceClient):
    """
    Client per interagire con il microservizio Gruppi.
    Implementato come Singleton: chiamare GroupServiceClient() restituirà sempre lo stesso oggetto.
    """

    async def get_users_public_info(self, user_ids: List[str]) -> List[dict]:
        """
        Recupera le info pubbliche per una lista di utenti.
        """
        # Nota come il codice qui è molto più pulito:
        # non serve controllare if self.client is None
        try:
            response = await self.http_client.post(
                f"{AUTH_SERVICE_URL}/users/batch-info",
                json={"user_ids": user_ids}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            # Loggare l'errore qui è buona pratica
            print(f"[GroupService] Errore batch info: {str(e)}")
            raise

    async def get_user_public_info(self, user_id: str) -> dict:
        """
        Recupera le info pubbliche per un singolo utente.
        """
        try:
            response = await self.http_client.post(
                f"{AUTH_SERVICE_URL}/users/{user_id}",
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            print(f"[GroupService] Errore user info: {str(e)}")
            raise