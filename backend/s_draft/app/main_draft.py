import uvicorn
from router.draft_router import router
from service_configuration import service_configuration

app = service_configuration(
    title="Draft Microservice",
    routers=[router]
)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # URL di React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"], # 👈 Specifica qui i tuoi header
)


if __name__ == "__main__":
    uvicorn.run("main_draft:app", host="0.0.0.0", port=8002, reload=True)