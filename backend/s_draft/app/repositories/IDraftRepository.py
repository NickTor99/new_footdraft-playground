from models.DraftSession import DraftSession
from models.History import DraftHistory


class IDraftRepository:
    async def save_history(self, session: DraftHistory):
        pass

    async def save_to_cache(self, session: DraftSession):
        pass

    async def get_from_cache(self, session_id) -> DraftSession:
        pass

