from datetime import datetime
from pathlib import Path

from fastapi import APIRouter
from pydantic import BaseModel

from app_ctx import ApplicationContext
from pipeline.document import DocumentPipeline

ingest_router = APIRouter(prefix='/api/v1')

context = ApplicationContext()
document_pipeline = DocumentPipeline(context)


class IngestRequest(BaseModel):
    object_id: str


class IngestResponse(BaseModel):
    pass


@ingest_router.post('/ingest')
async def ingest(request: IngestRequest):
    bucket = context.storage_client.bucket('speedy-atom-413006.appspot.com')
    blob = bucket.get_blob(request.object_id)
    filename = blob.metadata['filename']
    uid = blob.metadata['userId']
    content_type = blob.content_type

    with blob.open("rb") as file:
        document_pipeline.ingest(file, filename, content_type, uid)

    file_data = {
        'objectId': request.object_id,
        'timestamp': str(datetime.now()),
        'status': 'processed'
    }
    object_name = Path(request.object_id).name
    queue = context.db_client.collection('users').document(uid).collection('file_queue')
    queue.document(object_name).set(file_data)

    return IngestResponse()
