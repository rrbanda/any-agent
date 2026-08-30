# Any Agent — Spec

## Distribution model

Any Agent is a thin integration layer on top of upstream open-source projects:

- **assistant-ui** — Chat UI engine (used as npm dependency)
- **agentregistry** — Agent catalog (optional, deployed alongside)
- **AG-UI protocol** — Agent-user interaction standard

## Custom components

1. **Runtime Switcher** (`chat-wrapper.tsx`) — Given an agent's protocol,
   instantiates the correct assistant-ui adapter and renders the chat.

2. **Protocol Probe** (`probe.ts`) — HTTP fingerprinting to auto-detect
   whether an agent speaks A2A, OpenAI, LangGraph, or AG-UI.

3. **Registry Client** (`registry-client.ts`) — Fetches agents from
   agentregistry REST API. Falls back to AGENTS env var.

4. **Agent Selector** (`agent-selector.tsx`) — Dropdown UI portaled into
   the assistant-ui composer action bar.

5. **Deployment** — Helm chart + Docker Compose for production use.

## Protocols supported

| Protocol | Detection method | Adapter |
|----------|-----------------|---------|
| A2A / Google ADK | `GET /.well-known/agent.json` returns 200 | `@assistant-ui/react-google-adk` |
| OpenAI-compatible | `GET /v1/models` returns 200 | `@assistant-ui/ai-sdk` |
| LangGraph | `GET /threads` or `/assistants` returns 200 | `@assistant-ui/react-langgraph` |
| AG-UI | Fallback (default) | `@assistant-ui/react-ag-ui` |
