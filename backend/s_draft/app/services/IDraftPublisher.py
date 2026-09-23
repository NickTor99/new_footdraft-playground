from fastapi import WebSocket, WebSocketDisconnect

from models.DraftSession import DraftSession


class IDraftPublisher:
    async def subscribe_local(self, session_id: str, websocket: WebSocket):
        pass

    async def unsubscribe_local(self, session_id: str, websocket: WebSocket):
        pass

    async def broadcast_event(self, session: DraftSession):
        pass