import asyncio
import json
from enum import Enum
from typing import Dict, List

from fastapi.websockets import WebSocket

from redis_singleton import RedisClient
from services.IDraftPublisher import *


async def _safe_send(ws: WebSocket, data: str):
    try:
        await ws.send_text(data)
    except Exception:
        pass


class RedisDraftPublisher(IDraftPublisher):
    """
    Gestore delle connessioni WebSocket con integrazione Redis Pub/Sub.
    Implementa il pattern Fan-out.
    """
    def __init__(self):
        self.redis = RedisClient()
        self.local_connections: Dict[str, List[WebSocket]] = {}
        self.redis_tasks: Dict[str, asyncio.Task] = {}

    async def subscribe_local(self, session_id: str, websocket: WebSocket):
        if session_id not in self.local_connections:
            self.local_connections[session_id] = []
            self.redis_tasks[session_id] = asyncio.create_task(self._listen_to_redis(session_id))

        self.local_connections[session_id].append(websocket)

    async def unsubscribe_local(self, session_id: str, websocket: WebSocket):
        if session_id in self.local_connections:
            if websocket in self.local_connections[session_id]:
                self.local_connections[session_id].remove(websocket)

            if not self.local_connections[session_id]:
                del self.local_connections[session_id]
                if session_id in self.redis_tasks:
                    self.redis_tasks[session_id].cancel()
                    del self.redis_tasks[session_id]

    async def _listen_to_redis(self, session_id: str):
        pubsub = self.redis.redis_client.pubsub()
        await pubsub.subscribe(f"draft:session:{session_id}")

        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = message["data"]
                    if session_id in self.local_connections:
                        targets = self.local_connections[session_id]
                        await asyncio.gather(
                            *[_safe_send(ws, data) for ws in targets],
                            return_exceptions=True
                        )
        except asyncio.CancelledError:
            await pubsub.unsubscribe(f"draft:session:{session_id}")
        finally:
            await pubsub.close()

    async def broadcast_event(self, session: DraftSession):
        # Utilizziamo un serializzatore custom per gestire oggetti complessi nell'evento
        def json_serializer(obj):
            if isinstance(obj, Enum):
                return obj.value
            if hasattr(obj, "__dict__"):
                return obj.__dict__
            return str(obj)

        payload = json.dumps(session, default=json_serializer)
        await self.redis.redis_client.publish(f"draft:session:{session.sessionId}", payload)




