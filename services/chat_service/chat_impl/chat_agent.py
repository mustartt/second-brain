import logging
import time
from dataclasses import dataclass
from asyncio import Queue
from enum import Enum
from typing import Optional, Dict, Any, List

from llama_index import BaseCallbackHandler
from llama_index.callbacks import CBEventType
from llama_index.schema import NodeWithScore


class AgentEventType(str, Enum):
    AGENT_START = 'agent_start'
    AGENT_COMPLETE = 'agent_complete'
    AGENT_ERROR = 'agent_error'

    AGENT_EVENT_START = 'agent_event_start'
    AGENT_EVENT_STOP = 'agent_event_stop'

    RESPONSE_START = 'response_start'
    RESPONSE_STREAM = 'response_stream'
    RESPONSE_COMPLETE = 'response_complete'
    RESPONSE_ERROR = 'response_error'


@dataclass
class TaskEvent:
    completed: bool
    event_type: CBEventType
    event_id: str
    parent_id: str
    duration_s: float


@dataclass
class AgentEvent:
    type: AgentEventType
    task: TaskEvent | None
    error: str | None
    response_chunk: str
    sources: List[NodeWithScore]


class RealTimeAgentEvents(BaseCallbackHandler):
    def __init__(self, event_queue: Queue, allowed_events=None):
        if not allowed_events:
            allowed_events = [CBEventType.QUERY, CBEventType.SUB_QUESTION, CBEventType.FUNCTION_CALL]
        allowed = self.get_allowed_events(allowed_events)
        super().__init__([], [])
        self.event_queue = event_queue
        self.event_start_time = {}

    @staticmethod
    def get_allowed_events(allowed: list[CBEventType] = None):
        if not allowed:
            allowed = []
        all_events = {CBEventType.CHUNKING, CBEventType.NODE_PARSING, CBEventType.EMBEDDING, CBEventType.LLM,
                      CBEventType.QUERY, CBEventType.RETRIEVE, CBEventType.SYNTHESIZE, CBEventType.TREE,
                      CBEventType.SUB_QUESTION, CBEventType.TEMPLATING, CBEventType.FUNCTION_CALL,
                      CBEventType.RERANKING, CBEventType.EXCEPTION, CBEventType.AGENT_STEP}
        return list(all_events.difference(set(allowed)))

    def on_event_start(self, event_type: CBEventType,
                       payload: Optional[Dict[str, Any]] = None,
                       event_id: str = "",
                       parent_id: str = "", **kwargs: Any) -> str:
        self.event_start_time[event_id] = (time.time(), parent_id)
        agent_task = TaskEvent(
            completed=False,
            event_type=event_type,
            event_id=event_id,
            parent_id=parent_id,
            duration_s=0
        )
        self.event_queue.put_nowait(AgentEvent(
            type=AgentEventType.AGENT_EVENT_START,
            task=agent_task,
            error=None,
            response_chunk='',
            sources=[]
        ))
        return event_id

    def on_event_end(self, event_type: CBEventType,
                     payload: Optional[Dict[str, Any]] = None,
                     event_id: str = "",
                     **kwargs: Any) -> None:
        start_time, parent_id = self.event_start_time[event_id]
        agent_task = TaskEvent(
            completed=True,
            event_type=event_type,
            event_id=event_id,
            parent_id=parent_id,
            duration_s=time.time() - start_time
        )
        self.event_queue.put_nowait(AgentEvent(
            type=AgentEventType.AGENT_EVENT_STOP,
            task=agent_task,
            error=None,
            response_chunk='',
            sources=[]
        ))

    def start_trace(self, trace_id: Optional[str] = None) -> None:
        pass

    def end_trace(self, trace_id: Optional[str] = None,
                  trace_map: Optional[Dict[str, List[str]]] = None) -> None:
        pass
