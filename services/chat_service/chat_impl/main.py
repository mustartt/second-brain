import asyncio
import json
import logging
import os
import uuid

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from llama_index.agent import OpenAIAgent
from llama_index.core.llms.types import ChatMessage
from llama_index.llms import OpenAI

from pydantic import BaseModel

chat_router = APIRouter(prefix='/api/v1')


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


class ChatResponseChunk(BaseModel):
    id: str
    is_response: bool
    chunk: str
    is_last: bool


@chat_router.post('/chat')
async def chat(request: ChatRequest):
    logging.info(request)

    llm = OpenAI(
        api_key=os.getenv('OPENAI_API_KEY'),
        model="gpt-3.5-turbo",
        temperature=request.settings.temperature,
        max_tokens=request.settings.max_token,
    )
    agent = OpenAIAgent.from_tools(
        tools=[], llm=llm, verbose=True
    )

    async def response_generator():
        response_id = str(uuid.uuid4())
        chat_history = [
            ChatMessage(role=message.role, content=message.message)
            for message in request.history
        ]
        response = await agent.astream_chat(
            message=request.message,
            chat_history=chat_history
        )

        async for res in response.async_response_gen():
            chunk = ChatResponseChunk(
                id=response_id,
                chunk=res,
                is_last=False,
                is_response=True,
            )
            yield chunk.json() + '\n'
        yield ChatResponseChunk(
            id=response_id,
            chunk='',
            is_response=True,
            is_last=True).json() + '\n'

    return StreamingResponse(
        response_generator(),
        media_type='application/x-ndjson',
        status_code=200
    )
