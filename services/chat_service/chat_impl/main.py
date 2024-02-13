import logging
import os
import uuid
from typing import List, Any, Dict

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from llama_index.core.llms.types import ChatMessage
from llama_index.llms.openai import OpenAI
from llama_index.schema import NodeWithScore

from pydantic import BaseModel

from app_ctx import ApplicationContext
from chat_impl.auth import get_current_user
from chat_impl.query_engine import ContextFactory, QueryEngineFactory

chat_router = APIRouter(prefix='/api/v1')

app_ctx = ApplicationContext()
ctx_factory = ContextFactory(app_ctx)
query_engine_factory = QueryEngineFactory(app_ctx, ctx_factory)


class ChatRequestSettings(BaseModel):
    temperature: float = 0.8
    max_token: int = 256
    top_p: float = 0.5


class RequestChatMessage(BaseModel):
    message: str
    role: str


class ChatRequest(BaseModel):
    model: str
    settings: ChatRequestSettings
    history: list[RequestChatMessage]
    message: str


class AvailableModelResponse(BaseModel):
    available: list[str]


@chat_router.get('/available')
async def get_available(user: dict = Depends(get_current_user)):
    user_claims = user.get('claims', {})
    # get available models through user claims
    return AvailableModelResponse(available=['gpt-3.5-turbo', 'gpt-4'])


class ChatAgentTask(BaseModel):
    completed: bool
    event_type: str
    event_id: str
    parent_id: str
    duration_s: float


class ChatAgentSources(BaseModel):
    score: float | None
    text: str
    metadata: Dict[str, Any]


class ChatResponseChunk(BaseModel):
    id: str
    event_type: str
    task: ChatAgentTask | None
    error: str | None
    response_chunk: str
    sources: List[ChatAgentSources]


@chat_router.post('/chat')
async def chat(request: ChatRequest, user: dict = Depends(get_current_user)):
    logging.info(f"chat request uid: {user['uid']}")

    response_llm = OpenAI(
        api_key=os.getenv('OPENAI_API_KEY'),
        model="gpt-3.5-turbo",
        temperature=request.settings.temperature,
        max_tokens=request.settings.max_token,
    )
    engine = query_engine_factory.get_query_engine(user['uid'], response_llm)

    response_id = str(uuid.uuid4())
    chat_history = [
        ChatMessage(role=message.role, content=message.message)
        for message in request.history
    ]

    async def response_generator():
        async for event in engine.chat(chat_history, request.message):
            task = None
            if event.task:
                task = ChatAgentTask(
                    completed=event.task.completed,
                    event_type=event.task.event_type,
                    event_id=event.task.event_id,
                    parent_id=event.task.parent_id,
                    duration_s=event.task.duration_s
                )
            response_chunk = ChatResponseChunk(
                id=response_id,
                event_type=event.type,
                task=task,
                error=event.error,
                response_chunk=event.response_chunk,
                sources=[
                    ChatAgentSources(score=source.score, text=source.text, metadata=source.metadata)
                    for source in event.sources
                    if isinstance(source, NodeWithScore)
                ]
            )
            yield response_chunk.json() + '\n'

    return StreamingResponse(
        response_generator(),
        media_type='application/x-ndjson',
        status_code=200
    )
