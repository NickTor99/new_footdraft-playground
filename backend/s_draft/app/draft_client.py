import os
from typing import List
import httpx
from client_singleton import ServiceClient
from models.History import DraftHistory

GROUP_SERVICE_URL = os.getenv("GROUP_SERVICE_URL", "http://group_service:8001")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth_service:8000")

class DraftServiceClient(ServiceClient):
    """
    Client che permette al microservizio Draft di comunicare con il microservizio Gruppi.
    """

    async def send_draft_history(self, draft: DraftHistory):
        try:
            response = await self.http_client.post(
                f"{GROUP_SERVICE_URL}/groups/{draft.group_id}/draft",
                json=draft.model_dump(mode='json')
            )
            print(response.json())
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            # Loggare l'errore qui è buona pratica
            print(f"[GroupService] Errore info storico draft: {str(e)}")
            raise

    async def is_member(self, group_id, user_id) -> bool:
        try:
            response = await self.http_client.get(
                f"{GROUP_SERVICE_URL}/groups/{group_id}/{user_id}/is-member"
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            # Loggare l'errore qui è buona pratica
            print(f"[GroupService] Errore info storico draft: {str(e)}")
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

