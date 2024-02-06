from typing import IO

from unstructured.partition.auto import partition


def extract_metadata(metadata, default_meta):
    for key in default_meta.keys():
        if key in metadata:
            default_meta[key] = metadata[key]
    return default_meta


class FileParser:
    def parse_text(self, file: IO[bytes], filename, doc_id, uid):
        default_meta = {
            'page_number': None,
            'filename': filename,
            'doc_id': doc_id,
            'uid': uid
        }
        result = partition(file=file)
        parsed_chunks = []
        for element in result:
            new_meta = extract_metadata(
                element.metadata.to_dict(),
                default_meta.copy()
            )
            parsed_chunks.append({
                'text': element.text,
                'metadata': new_meta
            })
        return parsed_chunks
