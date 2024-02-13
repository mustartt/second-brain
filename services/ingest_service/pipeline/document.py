from typing import IO

from llama_index.core import Document
from unstructured.partition.api import partition_via_api

from app_ctx import ApplicationContext
from pipeline import IngestPipeline


class DocumentPipeline(IngestPipeline):
    def __init__(self, ctx: ApplicationContext):
        super().__init__(ctx)

    def ingest(self, file: IO[bytes], filename: str, mimetype: str, uid: str):
        response = partition_via_api(
            file=file,
            metadata_filename=filename,
            api_key=self.ctx.unstructured_api_key,
            api_url=self.ctx.unstructured_api_url,
            content_type=mimetype,
            coordinates=False,
            strategy='hi_res',
        )
        doc_metadata = {
            key: str(value)
            for key, value in response[0].metadata.to_dict().items()
        }
        doc_metadata.update({'user': uid})

        self.ctx.document_index.insert(
            Document(
                text='\n'.join(node.text for node in response),
                metadata=doc_metadata,
                excluded_llm_metadata_keys=['languages', 'filetype', 'user'],
            )
        )
