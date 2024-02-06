import logging
import time

from uuid import uuid4
from flask import Flask, jsonify, Response, request, g
from google.cloud import storage

from file_parser import FileParser
from service import EmbeddingService


def create_app():
    app = Flask(__name__)
    storage_client = storage.Client(project='speedy-atom-413006')

    service = EmbeddingService()

    @app.route("/ping")
    def hello_world():
        return "Hello World"

    @app.before_request
    def start_timer():
        g.start = time.time()
        g.req_id = uuid4()
        app.logger.info(f"{g.req_id} @ request started")

    @app.after_request
    def log_duration(response):
        duration = time.time() - g.start
        app.logger.info(f"{g.req_id} @ request duration: {duration} seconds")
        return response

    @app.route("/api/process-file", methods=["POST"])
    def process_file():
        data = request.json
        object_id = data.get('objectId')
        if not object_id:
            return jsonify({'error': 'object_id is required'}), 400

        bucket = storage_client.bucket('speedy-atom-413006.appspot.com')
        blob = bucket.get_blob(object_id)
        filename = blob.metadata['filename']
        uid = blob.metadata['userId']

        with blob.open("rb") as file:
            vec_count = service.process(file, filename, object_id, uid)

        return jsonify({
            'fileId': object_id,
            'filename': filename,
            'vectors': vec_count
        })

    return app


app = create_app()

if __name__ == "__main__":
    print(" Starting app...")
    logging.basicConfig(level=logging.INFO)
    app.run(port=5000)
