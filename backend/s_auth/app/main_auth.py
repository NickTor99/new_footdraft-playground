import uvicorn
from router.auth_router import router
from service_configuration import service_configuration

app = service_configuration(
    title="Authentication Microservice",
    routers=[router],
    storage_bucket_name="users"
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
    uvicorn.run("main_auth:app", host="0.0.0.0", port=8000, reload=True)
