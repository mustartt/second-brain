import asyncio
import logging
from asyncio import Queue
from typing import List

from llama_index import StorageContext, ServiceContext, VectorStoreIndex
from llama_index.agent import OpenAIAgent
from llama_index.callbacks import CallbackManager, CBEventType
from llama_index.core.llms.types import ChatMessage
from llama_index.indices.vector_store import VectorIndexRetriever
from llama_index.llms import OpenAI
from llama_index.postprocessor import SimilarityPostprocessor
from llama_index.query_engine import CitationQueryEngine
from llama_index.response_synthesizers import ResponseMode
from llama_index.tools import QueryEngineTool, ToolMetadata
from llama_index.vector_stores import ExactMatchFilter, MetadataFilters

from app_ctx import ApplicationContext
from chat_impl.chat_agent import RealTimeAgentEvents, AgentEvent, AgentEventType


class ContextFactory:
    def __init__(self, ctx: ApplicationContext):
        self.ctx = ctx

    def get_storage_context(self):
        return StorageContext.from_defaults(vector_store=self.ctx.document_vector_store)

    def get_service_context(self, queue: Queue):
        event_handler = RealTimeAgentEvents(queue, [
            CBEventType.LLM, CBEventType.QUERY, CBEventType.RETRIEVE,
            CBEventType.SYNTHESIZE, CBEventType.TREE, CBEventType.SUB_QUESTION,
            CBEventType.FUNCTION_CALL, CBEventType.RERANKING, CBEventType.EXCEPTION,
            CBEventType.AGENT_STEP
        ])
        callback_manager = CallbackManager([event_handler])

        return ServiceContext.from_defaults(
            llm=self.ctx.gpt3,
            embed_model=self.ctx.text_small,
            chunk_size=250,
            chunk_size_limit=300,
            chunk_overlap=10,
            callback_manager=callback_manager
        )


class QueryEngine:
    def __init__(self, queue: asyncio.Queue[AgentEvent], agent: OpenAIAgent):
        self.queue = queue
        self.agent = agent

    async def response_generator(self, memory, message):
        try:
            response = await self.agent.astream_chat(
                message=message,
                chat_history=memory,
                tool_choice=None,
            )
            self.queue.put_nowait(AgentEvent(
                type=AgentEventType.RESPONSE_START,
                task=None,
                error=None,
                response_chunk='',
                sources=response.source_nodes
            ))
            async for res in response.async_response_gen():
                self.queue.put_nowait(AgentEvent(
                    type=AgentEventType.RESPONSE_STREAM,
                    task=None,
                    error=None,
                    response_chunk=res,
                    sources=[]
                ))
            self.queue.put_nowait(AgentEvent(
                type=AgentEventType.RESPONSE_COMPLETE,
                task=None,
                error=None,
                response_chunk='',
                sources=[]
            ))
        except Exception as err:
            logging.error(err)
            self.queue.put_nowait(AgentEvent(
                type=AgentEventType.RESPONSE_ERROR,
                task=None,
                error=repr(err),
                response_chunk='',
                sources=[]
            ))

    async def chat(self, memory: List[ChatMessage], message: str):
        task = asyncio.create_task(self.response_generator(memory, message))
        try:
            while True:
                event = await self.queue.get()
                yield event
                if event.type in [
                    AgentEventType.AGENT_ERROR,
                    AgentEventType.RESPONSE_ERROR,
                    AgentEventType.RESPONSE_COMPLETE
                ]:
                    break
            await task  # exceptions should be thrown here
        except Exception as err:
            logging.error(err)
            yield AgentEvent(
                type=AgentEventType.AGENT_ERROR,
                task=None,
                error=repr(err),
                response_chunk='',
                sources=[]
            )


class QueryEngineFactory:
    def __init__(self, ctx: ApplicationContext, ctx_factory: ContextFactory):
        self.ctx = ctx
        self.ctx_factory = ctx_factory

    def get_query_engine(self, uid: str, response_llm: OpenAI):
        queue = asyncio.Queue()
        service_context = self.ctx_factory.get_service_context(queue)
        index = VectorStoreIndex.from_vector_store(
            vector_store=self.ctx.document_vector_store,
            service_context=service_context
        )
        filters = MetadataFilters(filters=[ExactMatchFilter(key="user", value=uid)])
        retriever = VectorIndexRetriever(
            index=index,
            similarity_top_k=10,
            filters=filters,
        )
        response_llm.callback_manager = service_context.callback_manager
        query_engine = CitationQueryEngine.from_args(
            index=index,  # this is not used
            retriever=retriever,
            response_mode=ResponseMode.COMPACT,  # compacts the chunks and refine
            node_postprocessors=[
                SimilarityPostprocessor(similarity_cutoff=0.25),
                self.ctx.cohere_rerank
            ],
            callback_manager=service_context.callback_manager,
            verbose=False,
            use_async=True,
        )

        query_engine_tools = [
            QueryEngineTool(
                query_engine=query_engine,
                metadata=ToolMetadata(
                    name="document_vector_index",
                    description=(
                        "Contains semantic information about all my files. "
                        "When using the output, return the citation in [number] "
                        "as is and do not modify or generate new ones."
                    ),
                ),
            ),
        ]

        # SubQueryEngine not sure how to get this to work well yet?
        # final_synth = get_response_synthesizer(
        #     response_mode=ResponseMode.COM,
        #     service_context=service_context
        # )
        # subquery_engine = SubQuestionQueryEngine.from_defaults(
        #     query_engine_tools=query_engine_tools,
        #     response_synthesizer=final_synth,
        #     service_context=service_context,
        #     use_async=True
        # )

        return QueryEngine(
            queue=queue,
            agent=OpenAIAgent.from_tools(
                tools=query_engine_tools,
                llm=response_llm,
                verbose=False,
            )
        )
