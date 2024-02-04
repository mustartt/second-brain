from flask import Flask, jsonify, Response, request
from typing import IO

from unstructured.partition.auto import partition


def extract_metadata(metadata):
    default_meta = {
        'page_number': None
    }
    for key in default_meta.keys():
        if key in metadata:
            default_meta[key] = metadata[key]
    return default_meta


class FileParser:
    def parse_text(self, file: IO[bytes]):
        result = partition(file=file)
        parsed_chunks = []
        for element in result:
            parsed_chunks.append({
                'text': element.text,
                'metadata': extract_metadata(element.metadata.to_dict())
            })
        return parsed_chunks


def create_app():
    app = Flask(__name__)
    file_parser = FileParser()

    @app.route("/ping")
    def hello_world():
        return "Hello World"

    @app.route("/api/process-file", methods=["POST"])
    def process_file():
        return "Ok", 200

    return app


app = create_app()

if __name__ == "__main__":
    print(" Starting app...")
    app.run(port=5000)
