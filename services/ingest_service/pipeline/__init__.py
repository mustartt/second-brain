from abc import ABC, abstractmethod
from typing import IO

from app_ctx import ApplicationContext


class IngestPipeline(ABC):
    def __init__(self, ctx: ApplicationContext):
        self.ctx = ctx

    @abstractmethod
    def ingest(self, file: IO[bytes], filename: str, mimetype: str, uid: str):
        pass
