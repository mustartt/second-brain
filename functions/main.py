# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`
from datetime import datetime
from uuid import uuid4

from firebase_functions import https_fn
from firebase_admin import initialize_app, auth, firestore
from firebase_functions.options import CorsOptions
from google.cloud import storage

initialize_app()


def verify_id_token(id_token):
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except auth.InvalidIdTokenError:
        return None


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

    db_client = firestore.client()
    storage_client = storage.Client()

    new_obj_id = str(uuid4())

    bucket = storage_client.bucket('file_upload')
    blob = bucket.blob(new_obj_id)
    blob.upload_from_file(file.stream)

    file_data = {
        'objectId': new_obj_id,
        'timestamp': str(datetime.now()),
        'status': 'uploaded'
    }

    queue = db_client.collection('users').document(uid).collection('file_queue')
    queue.document(new_obj_id).set(file_data)

    return https_fn.Response(f"added file {new_obj_id} for user {uid}", status=201)
