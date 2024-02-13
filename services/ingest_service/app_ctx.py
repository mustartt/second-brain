import os

from firebase_admin import firestore, initialize_app
from google.cloud import storage
from llama_index.core import StorageContext, ServiceContext, VectorStoreIndex
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.legacy.vector_stores import PineconeVectorStore
from llama_index.llms.openai import OpenAI
from pinecone import Pinecone


class ApplicationContext:
    def __init__(self):
        initialize_app()

        self.unstructured_api_key = os.getenv('UNSTRUCTURED_API_KEY')
        self.unstructured_api_url = os.getenv('UNSTRUCTURED_API_URL')

        pinecone_index = Pinecone(api_key=os.getenv('PINECONE_API_KEY')).Index("text-embedding-3-small-index")

        self.document_vector_store = PineconeVectorStore(pinecone_index=pinecone_index, namespace='documents')
        self.llm = OpenAI(model='gpt-3.5-turbo', api_key=os.getenv('OPENAI_API_KEY'))
        self.embed_model = OpenAIEmbedding(model='text-embedding-3-small', api_key=os.getenv('OPENAI_API_KEY'))
        self.storage_context = StorageContext.from_defaults(vector_store=self.document_vector_store)
        self.service_context = ServiceContext.from_defaults(
            llm=self.llm,
            embed_model=self.embed_model,
            chunk_size=250,
            chunk_size_limit=300,
            chunk_overlap=10,
        )
        self.document_index = VectorStoreIndex.from_vector_store(
            vector_store=self.document_vector_store,
            storage_context=self.storage_context,
            service_context=self.service_context,
            embed_model=self.embed_model,
        )
        self.storage_client = storage.Client(project='speedy-atom-413006')
        self.db_client = firestore.client()
