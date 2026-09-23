import sys

import uvicorn

from router.group_router import router as router_group
from router.player_router import router as router_player
from service_configuration import service_configuration

debug_mode = False
if len(sys.argv) > 1 and sys.argv[1] == "debug":
    debug_mode = True


app = service_configuration(
    title="Group Microservice",
    routers=[router_group, router_player],
    storage_bucket_name="avatars",
    debug_mode=debug_mode
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # URL di React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type", "X-Custom-Header"], # 👈 Specifica qui i tuoi header
)


if __name__ == "__main__":
    uvicorn.run("main_group:app", host="0.0.0.0", port=8001, reload=True)
