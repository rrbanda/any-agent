"""
Minimal AG-UI demo agent. No LLM needed -- echoes messages and demonstrates
tool call visibility so you can verify the CopilotKit UI end-to-end.
"""

import asyncio
import uuid
import json
from datetime import datetime, timezone

from fastapi import FastAPI, Request
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
)
from ag_ui.encoder import EventEncoder

app = FastAPI(title="Any Agent - Demo AG-UI Agent")


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
                    last_user_msg = msg.content if isinstance(msg.content, str) else str(msg.content)
                    break

        # --- Tool call demo: get_current_time ---
        tool_call_id = str(uuid.uuid4())
        yield encoder.encode(
            ToolCallStartEvent(
                type=EventType.TOOL_CALL_START,
                tool_call_id=tool_call_id,
                tool_call_name="get_current_time",
            )
        )
        yield encoder.encode(
            ToolCallArgsEvent(
                type=EventType.TOOL_CALL_ARGS,
                tool_call_id=tool_call_id,
                delta=json.dumps({"timezone": "UTC"}),
            )
        )
        yield encoder.encode(
            ToolCallEndEvent(
                type=EventType.TOOL_CALL_END,
                tool_call_id=tool_call_id,
            )
        )

        await asyncio.sleep(0.3)

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
            f"Hello! I'm the **demo agent** running via AG-UI protocol.\n\n"
            f"You said: *\"{last_user_msg}\"*\n\n"
            f"Current time (from tool call): **{now}**\n\n"
            f"This proves the full pipeline works: "
            f"Browser → CopilotKit → CopilotRuntime → HttpAgent → this AG-UI server."
        )

        for word in reply.split(" "):
            yield encoder.encode(
                TextMessageContentEvent(
                    type=EventType.TEXT_MESSAGE_CONTENT,
                    message_id=message_id,
                    delta=word + " ",
                )
            )
            await asyncio.sleep(0.05)

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
