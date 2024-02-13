from pathlib import Path

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
    db_client = firestore.client()
    parent = client.queue_path(project='speedy-atom-413006',
                               location='us-central1',
                               queue='file-ingest-tasks')

    object_id = event.data.name
    uid = event.data.metadata['userId']
    log.info(f'{route_ingest_files.__name__}: sending {object_id} to task queue for {uid}')

    task = {
        'http_request': {
            'http_method': tasks_v2.HttpMethod.POST,
            'url': 'https://ingest-service-uhefmk7o7q-uc.a.run.app/api/v1/ingest',
            'oidc_token': {
                'service_account_email': '664044881400-compute@developer.gserviceaccount.com'
            },
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'object_id': object_id}).encode()
        }
    }
    task = tasks_v2.Task(mapping=task)
    response = client.create_task(parent=parent, task=task)

    file_data = {
        'objectId': object_id,
        'timestamp': str(datetime.now()),
        'status': 'queued'
    }
    object_name = Path(object_id).name
    queue = db_client.collection('users').document(uid).collection('file_queue')
    queue.document(object_name).set(file_data)

    log.info(f'{route_ingest_files.__name__}: added {response.name} to task queue')
