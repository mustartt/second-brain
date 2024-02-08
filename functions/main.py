import json

import logging as log

from datetime import datetime
from flask import jsonify
from uuid import uuid4

from firebase_functions import https_fn, storage_fn
from firebase_admin import initialize_app, firestore
from firebase_functions.options import CorsOptions
from google.cloud import storage, tasks_v2, logging

from fn_impl.utils import verify_id_token

initialize_app()


@storage_fn.on_object_finalized(bucket='speedy-atom-413006.appspot.com')
def route_ingest_files(event: storage_fn.CloudEvent[storage_fn.StorageObjectData]):
    logging_client = logging.Client()
    logging_client.setup_logging()
    client = tasks_v2.CloudTasksClient()
    parent = client.queue_path(project='speedy-atom-413006',
                               location='us-central1',
                               queue='file-ingest-tasks')

    object_id = event.data.name
    log.info(f'{route_ingest_files.__name__}: sending {object_id} to task queue')

    task = {
        'http_request': {
            'http_method': tasks_v2.HttpMethod.POST,
            'url': 'https://vaultgpt-uhefmk7o7q-uc.a.run.app/api/process-file',
            'oidc_token': {
                'service_account_email': '664044881400-compute@developer.gserviceaccount.com'
            },
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'objectId': object_id}).encode()
        }
    }
    task = tasks_v2.Task(mapping=task)
    response = client.create_task(parent=parent, task=task)

    log.info(f'{route_ingest_files.__name__}: added {response.name} to task queue')


@https_fn.on_request(
    cors=CorsOptions(
        cors_origins=['*'],
        cors_methods=['POST']
    )
)
def ingest_file(req: https_fn.Request) -> https_fn.Response:
    if req.method != 'POST':
        return https_fn.Response('Method Not Allowed', status=405)

    authorization_header = req.headers.get('Authorization')
    if not authorization_header:
        return https_fn.Response('Unauthorized', status=401)

    id_token = authorization_header.split('Bearer ')[1]
    decoded_token = verify_id_token(id_token)
    if not decoded_token:
        return https_fn.Response('Unauthorized', status=403)
    uid = decoded_token['uid']

    if 'file' not in req.files:
        return https_fn.Response()
    file = req.files['file']

    # todo: figure why client init wont work in the global scope?
    db_client = firestore.client()
    storage_client = storage.Client()
    new_obj_id = str(uuid4())

    bucket = storage_client.bucket('speedy-atom-413006.appspot.com')
    blob = bucket.blob(new_obj_id)
    blob.metadata = {
        'filename': file.filename,
        'userId': uid
    }
    blob.content_type = file.content_type

    blob.upload_from_file(file.stream)

    file_data = {
        'objectId': new_obj_id,
        'timestamp': str(datetime.now()),
        'status': 'uploaded'
    }
    queue = db_client.collection('users').document(uid).collection('file_queue')
    queue.document(new_obj_id).set(file_data)

    return jsonify(file_data)
