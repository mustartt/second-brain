from typing import IO
from uuid import uuid4

import vertexai
from dotenv import load_dotenv

from embedding import EmbeddingEntry, PineconeDB, TextEmbeddingGoogleGecko
from file_parser import FileParser
from summarize import TextGenGooglePaLM2
from utils import batched

load_dotenv()
vertexai.init(project="speedy-atom-413006", location="us-central1")


class EmbeddingService:
    parser = FileParser()
    summarizer = TextGenGooglePaLM2()
    vectordb = PineconeDB()
    embedding = TextEmbeddingGoogleGecko()

    def __init__(self):
        pass

    def _gen_uuid(self):
        return str(uuid4())

    def split_chunks(self, docs, chunk_size=350):
        doc_idx = 0
        doc_pos = 0

        current_chunk = ''
        current_metadata = docs[0]['metadata']

        while doc_idx < len(docs):
            curr_doc = docs[doc_idx]
            remaining = len(curr_doc['text']) - doc_pos
            needed = len(current_chunk) + remaining
            if needed < chunk_size:
                current_chunk += curr_doc['text'][doc_pos:]
                doc_idx += 1
                doc_pos = 0
                if needed == chunk_size:
                    yield {
                        'text': current_chunk,
                        'metadata': curr_doc['metadata']
                    }
                    current_chunk = ''
                    current_metadata = curr_doc['metadata']
            else:
                take = min(chunk_size, remaining)
                current_chunk += curr_doc['text'][doc_pos:doc_pos + take]
                yield {
                    'text': current_chunk,
                    'metadata': current_metadata
                }
                current_chunk = ''
                current_metadata = curr_doc['metadata']
                doc_pos += take

        if current_chunk:
            yield {
                'text': current_chunk,
                'metadata': current_metadata
            }

    def process_docs(self, parsed_docs):
        chunks = filter(
            lambda doc: len(doc['text']) > 0,
            self.split_chunks(parsed_docs, chunk_size=300)
        )

        summary_uuid = self._gen_uuid()
        summary = ''
        children_ids = []

        for docs in batched(chunks, 3):
            content = ' '.join(doc['text'] for doc in docs)
            condensed = self.summarizer.condense(content)
            summary += condensed
            summary += '\n'
            condensed_id = self._gen_uuid()

            docs_ids = []
            for document in docs:
                doc_id = self._gen_uuid()
                docs_ids.append(doc_id)
                yield EmbeddingEntry(
                    uuid=doc_id,
                    content=document['text'],
                    parent=condensed_id,
                    metadata=document['metadata']
                )

            children_ids.append(condensed_id)
            yield EmbeddingEntry(
                uuid=condensed_id,
                content=condensed,
                parent=summary_uuid,
                children=[doc for doc in docs_ids],
                metadata=docs[0]['metadata']
            )

        yield EmbeddingEntry(
            uuid=summary_uuid,
            content=self.summarizer.summarize(summary),
            children=children_ids,
            metadata=parsed_docs[0]['metadata']
        )

    def process_embeddings(self, docs):
        proc_count = 0
        for doc_entries in batched(docs, 50):
            embeddings = self.embedding.get_embeddings(doc_entries)
            self.vectordb.save_embeddings(doc_entries, embeddings)
            proc_count += len(doc_entries)
        return proc_count

    def process(self, file: IO[bytes], filename, doc_id, uid):
        parsed_docs = self.parser.parse_text(file, filename, doc_id)
        result_gen = self.process_docs(parsed_docs)
        return self.process_embeddings(result_gen)
