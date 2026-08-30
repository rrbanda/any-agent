"""
Minimal AG-UI demo agent. No LLM needed -- echoes messages and demonstrates
tool call visibility, reasoning, and thinking so you can verify the
assistant-ui end-to-end.
"""

import asyncio
import uuid
import json
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from ag_ui.core import (
    RunAgentInput,
    EventType,
    RunStartedEvent,
    RunFinishedEvent,
    TextMessageStartEvent,
    TextMessageContentEvent,
    TextMessageEndEvent,
    ToolCallStartEvent,
    ToolCallArgsEvent,
    ToolCallEndEvent,
    ThinkingStartEvent,
    ThinkingTextMessageStartEvent,
    ThinkingTextMessageContentEvent,
    ThinkingTextMessageEndEvent,
    ThinkingEndEvent,
)
from ag_ui.encoder import EventEncoder

app = FastAPI(title="Any Agent - Demo AG-UI Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/")
async def run_agent(request: Request):
    body = await request.body()
    input_data = RunAgentInput.model_validate_json(body)

    accept = request.headers.get("accept", "text/event-stream")
    encoder = EventEncoder(accept)

    async def event_generator():
        thread_id = input_data.thread_id or str(uuid.uuid4())
        run_id = input_data.run_id or str(uuid.uuid4())

        yield encoder.encode(
            RunStartedEvent(
                type=EventType.RUN_STARTED,
                thread_id=thread_id,
                run_id=run_id,
            )
        )

        last_user_msg = ""
        if input_data.messages:
            for msg in reversed(input_data.messages):
                if msg.role == "user":
                    last_user_msg = (
                        msg.content
                        if isinstance(msg.content, str)
                        else str(msg.content)
                    )
                    break

        # --- Thinking / reasoning demo ---
        thinking_id = str(uuid.uuid4())
        yield encoder.encode(
            ThinkingStartEvent(type=EventType.THINKING_START)
        )
        yield encoder.encode(
            ThinkingTextMessageStartEvent(
                type=EventType.THINKING_TEXT_MESSAGE_START,
                message_id=thinking_id,
            )
        )

        reasoning_steps = [
            "Let me analyze the user's request...\n",
            "I should demonstrate tool calls to show the full pipeline.\n",
            "First I'll check the current time, then look up the weather.\n",
            "Finally I'll compose a helpful response.\n",
        ]
        for step in reasoning_steps:
            yield encoder.encode(
                ThinkingTextMessageContentEvent(
                    type=EventType.THINKING_TEXT_MESSAGE_CONTENT,
                    message_id=thinking_id,
                    delta=step,
                )
            )
            await asyncio.sleep(0.15)

        yield encoder.encode(
            ThinkingTextMessageEndEvent(
                type=EventType.THINKING_TEXT_MESSAGE_END,
                message_id=thinking_id,
            )
        )
        yield encoder.encode(
            ThinkingEndEvent(type=EventType.THINKING_END)
        )

        # --- Tool call 1: get_current_time ---
        tc1_id = str(uuid.uuid4())
        yield encoder.encode(
            ToolCallStartEvent(
                type=EventType.TOOL_CALL_START,
                tool_call_id=tc1_id,
                tool_call_name="get_current_time",
            )
        )
        yield encoder.encode(
            ToolCallArgsEvent(
                type=EventType.TOOL_CALL_ARGS,
                tool_call_id=tc1_id,
                delta=json.dumps({"timezone": "UTC"}),
            )
        )
        yield encoder.encode(
            ToolCallEndEvent(
                type=EventType.TOOL_CALL_END,
                tool_call_id=tc1_id,
            )
        )
        await asyncio.sleep(0.2)

        # --- Tool call 2: get_weather ---
        tc2_id = str(uuid.uuid4())
        yield encoder.encode(
            ToolCallStartEvent(
                type=EventType.TOOL_CALL_START,
                tool_call_id=tc2_id,
                tool_call_name="get_weather",
            )
        )
        yield encoder.encode(
            ToolCallArgsEvent(
                type=EventType.TOOL_CALL_ARGS,
                tool_call_id=tc2_id,
                delta=json.dumps({"location": "San Francisco", "units": "celsius"}),
            )
        )
        yield encoder.encode(
            ToolCallEndEvent(
                type=EventType.TOOL_CALL_END,
                tool_call_id=tc2_id,
            )
        )
        await asyncio.sleep(0.2)

        # --- Tool call 3: search_knowledge_base ---
        tc3_id = str(uuid.uuid4())
        yield encoder.encode(
            ToolCallStartEvent(
                type=EventType.TOOL_CALL_START,
                tool_call_id=tc3_id,
                tool_call_name="search_knowledge_base",
            )
        )
        yield encoder.encode(
            ToolCallArgsEvent(
                type=EventType.TOOL_CALL_ARGS,
                tool_call_id=tc3_id,
                delta=json.dumps({"query": last_user_msg or "demo", "limit": 5}),
            )
        )
        yield encoder.encode(
            ToolCallEndEvent(
                type=EventType.TOOL_CALL_END,
                tool_call_id=tc3_id,
            )
        )
        await asyncio.sleep(0.2)

        # --- Stream the text reply ---
        message_id = str(uuid.uuid4())
        yield encoder.encode(
            TextMessageStartEvent(
                type=EventType.TEXT_MESSAGE_START,
                message_id=message_id,
                role="assistant",
            )
        )

        now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
        reply = (
            f"Hello! I'm the **demo agent** running via the AG-UI protocol.\n\n"
            f"You said: *\"{last_user_msg}\"*\n\n"
            f"## Tool Results\n\n"
            f"| Tool | Result |\n"
            f"|------|--------|\n"
            f"| `get_current_time` | {now} |\n"
            f"| `get_weather` | 18°C, partly cloudy |\n"
            f"| `search_knowledge_base` | 3 results found |\n\n"
            f"This demonstrates the full feature set:\n"
            f"- **Reasoning/Thinking** — collapsible chain-of-thought\n"
            f"- **Tool Groups** — multiple tool calls grouped together\n"
            f"- **Markdown** — rich text with tables, code, and formatting\n"
            f"- **Streaming** — word-by-word token delivery\n\n"
            f"```python\n"
            f"# Example code block with syntax highlighting\n"
            f"from ag_ui.core import RunAgentInput\n"
            f"print('AG-UI protocol in action!')\n"
            f"```\n"
        )

        for word in reply.split(" "):
            yield encoder.encode(
                TextMessageContentEvent(
                    type=EventType.TEXT_MESSAGE_CONTENT,
                    message_id=message_id,
                    delta=word + " ",
                )
            )
            await asyncio.sleep(0.04)

        yield encoder.encode(
            TextMessageEndEvent(
                type=EventType.TEXT_MESSAGE_END,
                message_id=message_id,
            )
        )

        yield encoder.encode(
            RunFinishedEvent(
                type=EventType.RUN_FINISHED,
                thread_id=thread_id,
                run_id=run_id,
            )
        )

    return StreamingResponse(
        event_generator(),
        media_type=encoder.get_content_type(),
    )


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
