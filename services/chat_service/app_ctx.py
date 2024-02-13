import os

from llama_index.embeddings.openai import OpenAIEmbedding

from llama_index.llms.openai import OpenAI
from llama_index.postprocessor import CohereRerank
from llama_index.vector_stores import PineconeVectorStore
from pinecone import Pinecone


def get_env(key: str):
    value = os.getenv(key)
    if not value:
        raise ValueError(f"Missing environment variable f{key}")
    return value


class ApplicationContext:
    def __init__(self):
        pc = Pinecone(api_key=get_env('PINECONE_API_KEY'))
        pinecone_index = pc.Index("text-embedding-3-small-index")

        self.gpt3 = OpenAI(model='gpt-3.5-turbo', temperature=0)
        self.text_small = OpenAIEmbedding(model='text-embedding-3-small')
        self.document_vector_store = PineconeVectorStore(pinecone_index=pinecone_index, namespace='documents')
        self.cohere_rerank = CohereRerank(api_key=get_env('COHERE_API_KEY'), top_n=3)
