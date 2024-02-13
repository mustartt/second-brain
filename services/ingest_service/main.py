import logging

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()


def create_app():
    from pipeline.ingest import ingest_router

    logging.basicConfig(level=logging.INFO)
    fastapi = FastAPI()
    fastapi.add_middleware(
        CORSMiddleware,
        allow_origins=['*'],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    fastapi.include_router(ingest_router)
    return fastapi


app = create_app()
