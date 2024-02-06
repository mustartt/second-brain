import os
from abc import ABC, abstractmethod

from pinecone import Pinecone
from vertexai.language_models import TextEmbeddingModel


class EmbeddingEntry:
    id: str
    content: str
    parent: str | None
    children: list[str]
    metadata: dict[str, str | int | float | None]

    def __init__(self, uuid: str, content: str,
                 parent=None, children=None, metadata=None):
        self.id = uuid
        self.content = content
        self.parent = parent
        if children is None:
            children = []
        self.children = children
        if metadata is None:
            metadata = {}
        self.metadata = metadata

    def __repr__(self):
        return (
            f"{self.__class__.__name__}("
            f"id='{self.id}', "
            f"content='{repr(self.content)}', "
            f"parent='{self.parent}', "
            f"children={self.children}, "
            f"metadata={self.metadata})"
        )


class Embedding(ABC):
    @abstractmethod
    def get_embedding(self, doc: EmbeddingEntry):
        ...

    @abstractmethod
    def get_embeddings(self, docs: list[EmbeddingEntry]):
        ...

    @abstractmethod
    def get_dimension(self) -> int:
        ...


class TextEmbeddingGoogleGecko(Embedding):
    def __init__(self):
        self.model = TextEmbeddingModel.from_pretrained("textembedding-gecko@003")

    def get_embedding(self, doc: EmbeddingEntry):
        return self.get_embeddings([doc])[0]

    def get_embeddings(self, docs: list[EmbeddingEntry]):
        embeddings = self.model.get_embeddings([
            doc.content for doc in docs
        ])
        return [embedding.values for embedding in embeddings]

    def get_dimension(self) -> int:
        return 768


class PineconeDB:
    def __init__(self):
        if not os.getenv('PINECONE_API_KEY'):
            raise ValueError('PineconeDB: env var PINECONE_API_KEY is not set')
        if not os.getenv('PINECONE_HOST_NAME'):
            raise ValueError('PineconeDB: env var PINECONE_HOST_NAME is not set')
        if not os.getenv('PINECONE_NAMESPACE'):
            raise ValueError('PineconeDB: env var PINECONE_NAMESPACE is not set')

        self.db = Pinecone()
        self.index_name = os.getenv('PINECONE_HOST_NAME')
        self.namespace = os.getenv('PINECONE_NAMESPACE')
        self.index = self.db.Index(host=self.index_name)

    def merge_metadata(self, doc: EmbeddingEntry) -> dict:
        result = {
            'content': doc.content,
            'parent': doc.parent,
            'children': repr(doc.children)
        }
        result.update(doc.metadata)
        return result

    def filter_metadata(self, metadata: dict):
        return {
            key: str(value) for key, value in metadata.items()
            if value is not None
        }

    def save_embeddings(self, docs: list[EmbeddingEntry], embeddings):
        vectors = [
            (doc.id, vec, self.filter_metadata(self.merge_metadata(doc)))
            for doc, vec in zip(docs, embeddings)
        ]
        self.index.upsert(vectors, namespace='testing1')
