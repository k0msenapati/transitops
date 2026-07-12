from fastapi import FastAPI

from app.core.database import Base, engine
from app.routers.baserouter import base_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(base_router, prefix="/api")


@app.get("/api/status")
def read_root():
    return {"status": "OK"}
